import time

import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.clock import ref_date
from app.services.inventory_service import _threshold_days
from app.services.ml_loader import get_model

# Même calcul de stock qu'à l'entraînement ; ici on garde AUSSI les produits sans vente récente
LIST_QUERY = text("""
    WITH stock AS (
        SELECT product_id,
               COUNT(*) AS received,
               COUNT(*) FILTER (WHERE sold_at IS NOT NULL AND sold_at < :ref_date) AS sold
        FROM inventory_items
        WHERE created_at < :ref_date
        GROUP BY product_id
    ),
    lines AS (
        SELECT oi.id, oi.product_id, oi.sale_price, o.created_at AS order_date,
               (oi.returned_at IS NOT NULL AND oi.returned_at < :ref_date) AS is_returned
        FROM order_items oi
        JOIN orders o ON o.order_id = oi.order_id
        WHERE o.created_at < :ref_date
          AND oi.status <> 'Cancelled'
    ),
    hist AS (
        SELECT product_id,
               COUNT(*) AS n_sales,
               AVG(sale_price) AS avg_price,
               AVG(CASE WHEN is_returned THEN 1.0 ELSE 0.0 END) AS return_rate
        FROM lines
        GROUP BY product_id
    ),
    recent AS (
        SELECT product_id,
               COUNT(*) AS units_30d,
               SUM(sale_price) AS revenue_30d
        FROM lines
        WHERE order_date >= (:ref_date - INTERVAL '30 days')
        GROUP BY product_id
    )
    SELECT p.id AS product_id,
           p.name AS product_name,
           p.category,
           (st.received - st.sold) AS stock_actuel,
           r.units_30d,
           r.revenue_30d,
           COALESCE(h.n_sales, 0) AS n_sales,
           h.avg_price,
           COALESCE(h.return_rate, 0) AS return_rate,
           p.retail_price,
           p.cost
    FROM products p
    JOIN stock st ON st.product_id = p.id
    LEFT JOIN recent r ON r.product_id = p.id
    LEFT JOIN hist h ON h.product_id = p.id
""")

COLUMNS = ["product_id", "product_name", "category", "stock_actuel", "units_30d", "revenue_30d",
           "n_sales", "avg_price", "return_rate", "retail_price", "cost"]
NUM_COLS = [c for c in COLUMNS if c not in ("product_name", "category")]

_CACHE = {"t": 0.0, "df": None}
CACHE_TTL = 120  # secondes : la requête SQL est lourde, on évite de la refaire à chaque frappe


def _base_df(db: Session) -> pd.DataFrame:
    now = time.time()
    if _CACHE["df"] is None or now - _CACHE["t"] > CACHE_TTL:
        rows = db.execute(LIST_QUERY, {"ref_date": ref_date()}).fetchall()
        df = pd.DataFrame(rows, columns=COLUMNS)
        df[NUM_COLS] = df[NUM_COLS].astype(float)

        # Probabilité de rupture : uniquement pour les produits vendus sur 30 jours
        mdl = get_model("stockout")
        sold = df["units_30d"].fillna(0) > 0
        df["probabilite_rupture"] = float("nan")
        if sold.any():
            X = mdl["imputer"].transform(df.loc[sold, mdl["features"]].copy())
            X = mdl["outlier"].transform(X)
            X = mdl["scaler"].transform(X)
            df.loc[sold, "probabilite_rupture"] = mdl["model"].predict_proba(X)[:, 1]

        df["jours_de_couverture"] = df["stock_actuel"] / (df["units_30d"] / 30.0)
        _CACHE.update(t=now, df=df)
    return _CACHE["df"].copy()


def _opt(x, nd=1):
    return None if pd.isna(x) else round(float(x), nd)


def get_inventory_products(db: Session, search: str, status: str, page: int, page_size: int):
    df = _base_df(db)

    # Le statut dépend du seuil de la page Paramètres : recalculé à chaque appel
    threshold = _threshold_days(db)
    df["statut"] = "OK"
    df.loc[df["jours_de_couverture"] < threshold, "statut"] = "Critique"
    df.loc[df["stock_actuel"] <= 0, "statut"] = "Rupture"

    counts = df["statut"].value_counts()
    summary = {
        "total": len(df),
        "rupture": int(counts.get("Rupture", 0)),
        "critique": int(counts.get("Critique", 0)),
        "ok": int(counts.get("OK", 0)),
    }
    stock_value = float((df["stock_actuel"].clip(lower=0) * df["cost"].fillna(0)).sum())

    if status != "all":
        df = df[df["statut"] == status]
    if search.strip():
        df = df[df["product_name"].str.contains(search.strip(), case=False, na=False, regex=False)]

    df = df.assign(_prio=df["statut"].map({"Rupture": 0, "Critique": 1, "OK": 2}))
    df = df.sort_values(["_prio", "jours_de_couverture", "product_name"], na_position="last")

    total_filtered = len(df)
    start = (page - 1) * page_size
    chunk = df.iloc[start:start + page_size]

    items = [
        {
            "product_id": int(r.product_id),
            "product_name": str(r.product_name),
            "category": None if pd.isna(r.category) else str(r.category),
            "stock_actuel": int(r.stock_actuel),
            "ventes_30j": 0 if pd.isna(r.units_30d) else int(r.units_30d),
            "jours_de_couverture": _opt(r.jours_de_couverture),
            "probabilite_rupture": _opt(r.probabilite_rupture, 2),
            "valeur_stock": round(max(float(r.stock_actuel), 0) * (0 if pd.isna(r.cost) else float(r.cost)), 2),
            "statut": r.statut,
        }
        for r in chunk.itertuples()
    ]

    return {
        "counts": summary,
        "stock_value": round(stock_value, 2),
        "total_filtered": total_filtered,
        "page": page,
        "page_size": page_size,
        "items": items,
    }
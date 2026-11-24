import pandas as pd
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.clock import ref_date
from app.services.ml_loader import get_model

# 30 j = définition de la cible d'entraînement (stock < ventes sur 30 jours)
DEFAULT_THRESHOLD_DAYS = 30

QUERY = text("""
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
    JOIN recent r ON r.product_id = p.id
    LEFT JOIN hist h ON h.product_id = p.id
""")

COLUMNS = ["product_id", "product_name", "stock_actuel", "units_30d", "revenue_30d",
           "n_sales", "avg_price", "return_rate", "retail_price", "cost"]


def _threshold_days(db: Session) -> int:
    value = db.execute(text("SELECT stock_critical_threshold FROM shop_settings LIMIT 1")).scalar()
    return int(value) if value else DEFAULT_THRESHOLD_DAYS


def get_inventory_alerts(db: Session, limit: int = 50):
    mdl = get_model("stockout")
    features = mdl["features"]

    rows = db.execute(QUERY, {"ref_date": ref_date()}).fetchall()
    if not rows:
        return {"total_produits": 0, "alertes": []}

    df = pd.DataFrame(rows, columns=COLUMNS)
    num_cols = [c for c in COLUMNS if c != "product_name"]
    df[num_cols] = df[num_cols].astype(float)

    # Même pipeline qu'à l'entraînement
    X = mdl["imputer"].transform(df[features].copy())
    X = mdl["outlier"].transform(X)
    X = mdl["scaler"].transform(X)
    df["probabilite_rupture"] = mdl["model"].predict_proba(X)[:, 1]

    # Règle explicable : jours de couverture = stock / ventes par jour
    threshold = _threshold_days(db)
    df["jours_de_couverture"] = df["stock_actuel"] / (df["units_30d"] / 30.0)
    df["statut"] = "OK"
    df.loc[df["jours_de_couverture"] < threshold, "statut"] = "Critique"
    df.loc[df["stock_actuel"] <= 0, "statut"] = "Rupture"

    alerts = (df[df["statut"] != "OK"]
              .sort_values(["jours_de_couverture", "probabilite_rupture"], ascending=[True, False])
              .head(limit))

    return {
        "total_produits": len(df),
        "alertes": [
            {
                "product_id": int(r.product_id),
                "product_name": str(r.product_name),
                "stock_actuel": int(r.stock_actuel),
                "ventes_30j": int(r.units_30d),
                "jours_de_couverture": round(float(r.jours_de_couverture), 1),
                "probabilite_rupture": round(float(r.probabilite_rupture), 2),
                "statut": r.statut,
            }
            for r in alerts.itertuples()
        ],
    }
from datetime import timedelta

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.clock import days_ago, ref_date


def _pct_change(current: float, previous: float) -> float | None:
    if not previous:
        return None
    return round((current - previous) / previous * 100, 1)


def get_sales_analytics(db: Session, days: int = 7):
    ref = ref_date()
    start = days_ago(days)
    prev_start = days_ago(2 * days)
    params = {"ref_date": ref, "start": start, "prev_start": prev_start}

    # 1. Indicateurs : période courante vs période précédente (même durée)
    rows = db.execute(text("""
        SELECT CASE WHEN o.created_at >= :start THEN 'current' ELSE 'previous' END AS period,
               COUNT(DISTINCT o.order_id) AS orders,
               COUNT(*) AS units,
               COALESCE(SUM(oi.sale_price), 0) AS revenue
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.order_id
        WHERE o.created_at >= :prev_start AND o.created_at < :ref_date
          AND oi.status <> 'Cancelled'
        GROUP BY 1
    """), params).fetchall()

    empty = {"orders": 0.0, "units": 0.0, "revenue": 0.0}
    data = {r[0]: {"orders": float(r[1]), "units": float(r[2]), "revenue": float(r[3])} for r in rows}
    cur = data.get("current", dict(empty))
    prev = data.get("previous", dict(empty))
    for p in (cur, prev):
        p["avg_basket"] = p["revenue"] / p["orders"] if p["orders"] else 0.0

    labels = [("revenue", "Chiffre d'affaires"), ("orders", "Commandes"),
              ("units", "Articles vendus"), ("avg_basket", "Panier moyen")]
    kpis = [{"key": k, "label": label, "value": round(cur[k], 2),
             "change_pct": _pct_change(cur[k], prev[k])} for k, label in labels]

    # 2. Revenu et commandes par jour (jours sans vente = 0)
    day_rows = db.execute(text("""
        SELECT DATE(o.created_at) AS d,
               COUNT(DISTINCT o.order_id) AS orders,
               SUM(oi.sale_price) AS revenue
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.order_id
        WHERE o.created_at >= :start AND o.created_at < :ref_date
          AND oi.status <> 'Cancelled'
        GROUP BY 1
    """), params).fetchall()
    by_day = {str(r[0]): (int(r[1]), float(r[2])) for r in day_rows}
    daily = []
    for i in range(days):
        d = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        orders, revenue = by_day.get(d, (0, 0.0))
        daily.append({"date": d, "revenue": round(revenue, 2), "orders": orders})

    # 3. Catégories (8 premières + "Autres")
    cat_rows = db.execute(text("""
        SELECT p.category, SUM(oi.sale_price) AS revenue
        FROM order_items oi
        JOIN orders o ON o.order_id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE o.created_at >= :start AND o.created_at < :ref_date
          AND oi.status <> 'Cancelled'
        GROUP BY p.category
        ORDER BY revenue DESC
    """), params).fetchall()
    total = sum(float(r[1]) for r in cat_rows)
    categories = []
    if total:
        for r in cat_rows[:8]:
            categories.append({"category": r[0], "revenue": round(float(r[1]), 2),
                               "share_pct": round(float(r[1]) / total * 100, 1)})
        rest = sum(float(r[1]) for r in cat_rows[8:])
        if rest > 0:
            categories.append({"category": "Autres", "revenue": round(rest, 2),
                               "share_pct": round(rest / total * 100, 1)})

    # 4. Top 5 produits par revenu
    top_rows = db.execute(text("""
        SELECT p.id, p.name, COUNT(*) AS units, SUM(oi.sale_price) AS revenue
        FROM order_items oi
        JOIN orders o ON o.order_id = oi.order_id
        JOIN products p ON p.id = oi.product_id
        WHERE o.created_at >= :start AND o.created_at < :ref_date
          AND oi.status <> 'Cancelled'
        GROUP BY p.id, p.name
        ORDER BY revenue DESC
        LIMIT 5
    """), params).fetchall()
    top_products = [{"product_id": int(r[0]), "product_name": str(r[1]),
                     "units": int(r[2]), "revenue": round(float(r[3]), 2)} for r in top_rows]

    currency = db.execute(text("SELECT currency FROM shop_settings LIMIT 1")).scalar() or "EUR"

    return {
        "days": days,
        "currency": currency,
        "reference_date": ref.strftime("%Y-%m-%d"),
        "kpis": kpis,
        "daily": daily,
        "categories": categories,
        "top_products": top_products,
    }
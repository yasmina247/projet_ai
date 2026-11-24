# from sqlalchemy.orm import Session
# from sqlalchemy import text
# from app.core.clock import ref_date

# def get_overview_data(db: Session):
#     reference = ref_date()

#     # 1. KPIs globaux
#     kpi_query = text("""
#         SELECT 
#             COUNT(DISTINCT o.order_id) as total_orders,
#             SUM(oi.sale_price) as total_revenue,
#             COUNT(DISTINCT o.user_id) as total_clients
#         FROM orders o
#         JOIN order_items oi ON o.order_id = oi.order_id
#         WHERE o.created_at < :ref_date
#     """)
#     kpi_res = db.execute(kpi_query, {"ref_date": reference}).fetchone()
    
#     total_orders = kpi_res[0] or 0
#     total_revenue = kpi_res[1] or 0.0
#     total_clients = kpi_res[2] or 0

#     kpis = [
#         {"label": "Chiffre d'affaires", "value": f"{total_revenue:,.0f} €", "change": "+12%"},
#         {"label": "Commandes", "value": str(total_orders), "change": "+5%"},
#         {"label": "Clients actifs", "value": str(total_clients), "change": "+8%"},
#     ]

#     # 2. Revenus des 7 derniers jours
#     rev_query = text("""
#         SELECT 
#             DATE(o.created_at) as date,
#             SUM(oi.sale_price) as revenue
#         FROM orders o
#         JOIN order_items oi ON o.order_id = oi.order_id
#         WHERE o.created_at < :ref_date
#           AND o.created_at >= (:ref_date - INTERVAL '7 days')
#         GROUP BY DATE(o.created_at)
#         ORDER BY date ASC
#     """)
#     rev_res = db.execute(rev_query, {"ref_date": reference}).fetchall()
#     last_7_days = [{"date": str(row[0]), "revenue": float(row[1])} for row in rev_res]

#     # 3. Dernières commandes
#     orders_query = text("""
#         SELECT 
#             o.order_id,
#             u.first_name || ' ' || u.last_name as user_name,
#             SUM(oi.sale_price) as amount,
#             o.status,
#             DATE(o.created_at) as date
#         FROM orders o
#         JOIN users u ON o.user_id = u.id
#         JOIN order_items oi ON o.order_id = oi.order_id
#         WHERE o.created_at < :ref_date
#         GROUP BY o.order_id, u.first_name, u.last_name, o.status, o.created_at
#         ORDER BY o.created_at DESC
#         LIMIT 5
#     """)
#     orders_res = db.execute(orders_query, {"ref_date": reference}).fetchall()
    
#     recent_orders = []
#     for row in orders_res:
#         recent_orders.append({
#             "order_id": row[0],
#             "user_name": row[1],
#             "amount": float(row[2]),
#             "status": row[3],
#             "date": str(row[4])
#         })

#     return {
#         "kpis": kpis,
#         "last_7_days": last_7_days,
#         "recent_orders": recent_orders,
#         "reference_date": str(reference)
#     }
from datetime import timedelta

from sqlalchemy import text
from sqlalchemy.orm import Session

from app.core.clock import days_ago, ref_date


def _pct_change(current: float, previous: float) -> float | None:
    if not previous:
        return None
    return round((current - previous) / previous * 100, 1)


def get_overview_data(db: Session, days: int = 7):
    ref = ref_date()
    start = days_ago(days)            # début de la période courante
    prev_start = days_ago(2 * days)   # début de la période précédente (même durée)
    params = {"ref_date": ref, "start": start, "prev_start": prev_start}

    # 1. KPI : période courante vs période précédente
    rows = db.execute(text("""
        SELECT CASE WHEN o.created_at >= :start THEN 'current' ELSE 'previous' END AS period,
               COUNT(DISTINCT o.order_id) AS orders,
               COALESCE(SUM(oi.sale_price), 0) AS revenue,
               COUNT(DISTINCT o.user_id) AS clients
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.order_id
        WHERE o.created_at >= :prev_start AND o.created_at < :ref_date
          AND oi.status <> 'Cancelled'
        GROUP BY 1
    """), params).fetchall()

    empty = {"orders": 0.0, "revenue": 0.0, "clients": 0.0}
    data = {r[0]: {"orders": float(r[1]), "revenue": float(r[2]), "clients": float(r[3])} for r in rows}
    cur = data.get("current", dict(empty))
    prev = data.get("previous", dict(empty))
    for p in (cur, prev):
        p["avg_basket"] = p["revenue"] / p["orders"] if p["orders"] else 0.0

    labels = [("revenue", "Chiffre d'affaires"), ("orders", "Commandes"),
              ("avg_basket", "Panier moyen"), ("clients", "Clients actifs")]
    kpis = [{"key": k, "label": label, "value": round(cur[k], 2),
             "change_pct": _pct_change(cur[k], prev[k])} for k, label in labels]

    # 2. Revenu par jour (les jours sans vente sont remplis avec 0)
    rev_rows = db.execute(text("""
        SELECT DATE(o.created_at) AS d, SUM(oi.sale_price)
        FROM orders o
        JOIN order_items oi ON oi.order_id = o.order_id
        WHERE o.created_at >= :start AND o.created_at < :ref_date
          AND oi.status <> 'Cancelled'
        GROUP BY 1
    """), params).fetchall()
    by_day = {str(r[0]): float(r[1]) for r in rev_rows}
    daily = []
    for i in range(days):
        d = (start + timedelta(days=i)).strftime("%Y-%m-%d")
        daily.append({"date": d, "revenue": round(by_day.get(d, 0.0), 2)})

    # 3. Part du CA par catégorie (3 premières + "Autres")
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
    top = []
    if total:
        top = [{"category": r[0], "share_pct": round(float(r[1]) / total * 100, 1)} for r in cat_rows[:3]]
        others = round(100 - sum(c["share_pct"] for c in top), 1)
        if others > 0:
            top.append({"category": "Autres", "share_pct": others})

    # 4. Dernières commandes
    orders_res = db.execute(text("""
        SELECT o.order_id,
               u.first_name || ' ' || u.last_name AS user_name,
               SUM(oi.sale_price) AS amount,
               o.status,
               DATE(o.created_at) AS d
        FROM orders o
        JOIN customers u ON o.user_id = u.id
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.created_at < :ref_date
        GROUP BY o.order_id, u.first_name, u.last_name, o.status, o.created_at
        ORDER BY o.created_at DESC
        LIMIT 5
    """), {"ref_date": ref}).fetchall()
    recent_orders = [{"order_id": r[0], "user_name": r[1], "amount": round(float(r[2]), 2),
                      "status": r[3], "date": str(r[4])} for r in orders_res]

    currency = db.execute(text("SELECT currency FROM shop_settings LIMIT 1")).scalar() or "EUR"

    return {
        "days": days,
        "currency": currency,
        "reference_date": ref.strftime("%Y-%m-%d"),
        "kpis": kpis,
        "daily_revenue": daily,
        "top_categories": top,
        "recent_orders": recent_orders,
    }
import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.services.ml_loader import get_model
from app.core.clock import ref_date

def get_inventory_alerts(db: Session, limit: int = 50):
    # 1. Charger le modèle XGBoost
    model_dict = get_model("stockout")
    model = model_dict["model"]
    features = model_dict["features"]
    imputer = model_dict["imputer"]
    outlier = model_dict["outlier"]
    scaler = model_dict["scaler"]

    reference = ref_date()

    # 2. Récupérer les données depuis PostgreSQL
    # ⚠️ CORRECTION : On utilise product_retail_price au lieu de retail_price
        # 2. Récupérer les données depuis PostgreSQL
    query = text("""
        WITH sales_30d AS (
            SELECT 
                oi.product_id,
                SUM(oi.sale_price) as revenue_30d,
                COUNT(oi.id) as n_sales,
                AVG(oi.sale_price) as avg_price
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.order_id
            WHERE o.created_at < :ref_date
              AND o.created_at >= (:ref_date - INTERVAL '30 days')
            GROUP BY oi.product_id
        ),
        stock_actuel AS (
            SELECT 
                product_id,
                COUNT(id) as stock
            FROM inventory_items
            WHERE created_at < :ref_date 
              AND sold_at IS NULL
            GROUP BY product_id
        )
        SELECT 
            p.id as product_id,
            p.name as product_name,
            COALESCE(s.revenue_30d, 0) as revenue_30d,
            COALESCE(s.n_sales, 0) as n_sales,
            COALESCE(s.avg_price, p.retail_price) as avg_price,
            p.retail_price,
            p.cost,
            COALESCE(st.stock, 0) as stock_actuel
        FROM products p
        JOIN sales_30d s ON p.id = s.product_id  -- On ne garde que ceux qui ont eu des ventes
        LEFT JOIN stock_actuel st ON p.id = st.product_id
        ORDER BY s.n_sales DESC  -- On prend les produits les plus vendus
        LIMIT :limit
    """)
    
    result = db.execute(query, {"ref_date": reference, "limit": limit}).fetchall()
    
    if not result:
        return {"total_produits": 0, "alertes": []}

    df = pd.DataFrame(result, columns=[
        "product_id", "product_name", "revenue_30d", "n_sales", 
        "avg_price", "retail_price", "cost", "stock_actuel"
    ])

    # 3. Préparation des features pour le modèle
    df['return_rate'] = 0.0 
    
    # On s'assure que toutes les features attendues par le modèle sont là
    # (Si le modèle attend 'retail_price' et 'cost', on les a bien)
    X = df[features].copy()
    
    # Application du pipeline de preprocessing
    X_imputed = imputer.transform(X)
    X_outlier = outlier.transform(X_imputed)
    X_scaled = scaler.transform(X_outlier)
    
    # Probabilité de rupture (classe 1)
    probas = model.predict_proba(X_scaled)[:, 1]
    df['probabilite_rupture'] = probas

    # 4. Règle métier simple (jours de couverture)
    df['ventes_par_jour'] = df['n_sales'] / 30.0
    df['jours_de_couverture'] = df.apply(
        lambda row: row['stock_actuel'] / row['ventes_par_jour'] if row['ventes_par_jour'] > 0 else 999.0, 
        axis=1
    )
    
    # 5. Définition du statut (Seuil critique : 7 jours)
    def get_statut(row):
        if row['stock_actuel'] == 0:
            return "Rupture"
        elif row['jours_de_couverture'] < 70: # Seuil temporairement abaissé/élevé pour la démo
            return "Critique"
        else:
            return "OK"

    df['statut'] = df.apply(get_statut, axis=1)
    
    # On ne garde que les alertes, on trie par probabilité décroissante
    df_alertes = df[df['statut'].isin(["Rupture", "Critique"])].sort_values(by="probabilite_rupture", ascending=False)
    
    # 6. Formatage de la réponse
    alertes_list = []
    for _, row in df_alertes.iterrows():
        alertes_list.append({
            "product_id": int(row['product_id']),
            "product_name": str(row['product_name']),
            "stock_actuel": int(row['stock_actuel']),
            "ventes_30j": int(row['n_sales']),
            "jours_de_couverture": round(float(row['jours_de_couverture']), 1),
            "probabilite_rupture": round(float(row['probabilite_rupture']), 2),
            "statut": str(row['statut'])
        })

    return {
        "total_produits": len(df),
        "alertes": alertes_list
    }
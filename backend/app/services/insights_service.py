import pandas as pd
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.services.ml_loader import get_model
import os

# --- 1. SERVICE DE RECOMMANDATION ---
def get_recommendations(db: Session, product_id: int, top_n: int = 5):
    # Charger le modèle TF-IDF
    rec_model = get_model("recommendation")
    content_matrix = rec_model["content_matrix"]
    product_id_to_idx = rec_model["product_id_to_idx"]
    product_ids = rec_model["product_ids"]
    
    # Vérifier si le produit existe dans notre matrice
    if product_id not in product_id_to_idx:
        return {"source_product_id": product_id, "source_product_name": "Inconnu", "recommendations": []}
    
    idx = product_id_to_idx[product_id]
    
    # Calculer la similarité cosinus entre ce produit et tous les autres
    from sklearn.metrics.pairwise import linear_kernel
    cosine_sim = linear_kernel(content_matrix[idx:idx+1], content_matrix).flatten()
    
    # Trier les indices par score de similarité décroissant
    # On ignore le premier (le produit lui-même)
    similar_indices = cosine_sim.argsort()[:-top_n-1:-1]
    
    # Récupérer les IDs produits correspondants
    recommended_pids = [product_ids[i] for i in similar_indices if i != idx][:top_n]
    
    # Récupérer les infos de ces produits depuis PostgreSQL
    query = text("""
        SELECT id, name, brand, category, retail_price 
        FROM products 
        WHERE id = ANY(:ids)
    """)
    result = db.execute(query, {"ids": recommended_pids}).fetchall()
    
    # Récupérer le nom du produit source
    source_query = text("SELECT name FROM products WHERE id = :id")
    source_name = db.execute(source_query, {"id": product_id}).scalar() or "Inconnu"
    
    recs = []
    for row in result:
        recs.append({
            "product_id": row[0],
            "product_name": row[1],
            "brand": row[2],
            "category": row[3],
            "price": float(row[4])
        })
        
    return {
        "source_product_id": product_id,
        "source_product_name": source_name,
        "recommendations": recs
    }

# --- 2. SERVICE POUR LES SEGMENTS ---
# --- 2. SERVICE POUR LES SEGMENTS ---
def get_segments(db: Session):
    import os
    import pandas as pd
    
    # Chemin vers le fichier
    filepath = os.path.join(os.path.dirname(__file__), "..", "..", "ml_artifacts", "customer_segmentation", "segments.parquet")
    
    if not os.path.exists(filepath):
        # Si le chemin relatif ne marche pas (selon comment uvicorn est lancé)
        filepath = "ml_artifacts/customer_segmentation/segments.parquet"

    df = pd.read_parquet(filepath)
    
    # ⚠️ LA CORRECTION EST ICI : On utilise 'segment' au lieu de 'cluster'
    counts = df['segment'].value_counts().to_dict()
    total = sum(counts.values())
    
    segments_list = []
    
    for segment_id, count in counts.items():
        # D'après ton échantillon, le segment 1 a l'air d'être les clients réguliers (frequency élevée)
        # et le segment 0 les clients moins actifs. On va les nommer ainsi :
        name = "VIP" if segment_id == 1 else "Dormant"
        
        segments_list.append({
            "segment_name": name,
            "count": count,
            "percentage": round((count / total) * 100, 1)
        })
        
    # Trier par nombre de clients décroissant
    segments_list.sort(key=lambda x: x['count'], reverse=True)
    
    return {
        "total_clients": total,
        "segments": segments_list
    }
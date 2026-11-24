# backend/app/services/forecasting.py
import pandas as pd
import numpy as np
from datetime import timedelta
from app.services.ml_loader import get_model
from app.core.clock import ref_date
from sqlalchemy.orm import Session
from sqlalchemy import text

def get_sales_history(db: Session, days: int = 90) -> pd.DataFrame:
    """
    Récupère l'historique des ventes journalières depuis SQLite.
    On prend 90 jours pour avoir assez de recul pour les lags de 30 jours.
    """
    reference = ref_date()
    query = text("""
        SELECT 
            DATE(o.created_at) as date,
            SUM(oi.sale_price) as revenue
        FROM orders o
        JOIN order_items oi ON o.order_id = oi.order_id
        WHERE o.created_at < :ref_date
          AND o.status NOT IN ('Cancelled', 'Returned')
        GROUP BY DATE(o.created_at)
        ORDER BY date ASC
    """)
    
    result = db.execute(query, {"ref_date": reference}).fetchall()
    df = pd.DataFrame(result, columns=["date", "revenue"])
    
    # Assurer qu'on a bien une ligne par jour (combler les jours sans vente par 0)
    df['date'] = pd.to_datetime(df['date'])
    full_range = pd.date_range(start=df['date'].min(), end=reference - timedelta(days=1), freq='D')
    df = df.set_index('date').reindex(full_range, fill_value=0.0).rename_axis('date').reset_index()
    
    return df

def predict_recursive(db: Session, horizon: int = 14) -> list[dict]:
    """
    Génère les prévisions de ventes jour par jour.
    """
    # 1. Charger le modèle
    model_dict = get_model("forecast")
    model = model_dict["model"]
    scaler = model_dict["scaler"]
    feature_cols = model_dict["features"]
    
    # 2. Récupérer l'historique (au moins 30 jours requis, on en prend 90 pour la robustesse)
    history_df = get_sales_history(db, days=90)
    
    if len(history_df) < 30:
        raise ValueError("Pas assez d'historique de ventes (30 jours requis minimum).")
    
    predictions = []
    current_date = ref_date()
    
    # 3. Boucle de prévision récursive
    for i in range(horizon):
        target_date = current_date + timedelta(days=i)
        
        # --- Feature Engineering dynamique pour ce jour précis ---
        # On crée un dictionnaire de features pour le jour cible
        features = {
            'dow': target_date.dayofweek,
            'month': target_date.month,
            'day': target_date.day,
            'is_weekend': 1 if target_date.dayofweek >= 5 else 0,
            'weekofyear': target_date.isocalendar().week,
            'is_first_of_month': 1 if target_date.day == 1 else 0,
        }
        
        # Calcul des lags (on regarde dans l'historique, y compris les prédictions précédentes)
        features['lag_1'] = history_df['revenue'].iloc[-1]
        features['lag_7'] = history_df['revenue'].iloc[-7] if len(history_df) >= 7 else 0.0
        features['lag_14'] = history_df['revenue'].iloc[-14] if len(history_df) >= 14 else 0.0
        features['lag_30'] = history_df['revenue'].iloc[-30] if len(history_df) >= 30 else 0.0
        
        # Calcul des moyennes et écarts-types glissants
        features['roll_mean_7'] = history_df['revenue'].tail(7).mean()
        features['roll_mean_30'] = history_df['revenue'].tail(30).mean()
        features['roll_std_7'] = history_df['revenue'].tail(7).std()
        features['roll_std_30'] = history_df['revenue'].tail(30).std()
        
        # Remplacer les NaN par 0 (si std sur 1 seule valeur par ex)
        for k, v in features.items():
            if pd.isna(v):
                features[k] = 0.0
        
        # --- Préparation et Prédiction ---
        # On construit le DataFrame dans le bon ordre de colonnes
        X_pred = pd.DataFrame([features])[feature_cols]
        
        # Application du scaler
        X_scaled = scaler.transform(X_pred)
        
        # Prédiction (on force à 0 si le modèle prédit du négatif)
        pred_value = model.predict(X_scaled)[0]
        pred_value = max(0.0, float(pred_value))
        
        # Ajout au résultat
        predictions.append({
            "date": target_date.strftime("%Y-%m-%d"),
            "predicted_revenue": round(pred_value, 2)
        })
        
        # --- Réinjection dans l'historique pour le jour suivant ---
        new_row = pd.DataFrame([{'date': target_date, 'revenue': pred_value}])
        history_df = pd.concat([history_df, new_row], ignore_index=True)
        
    return predictions
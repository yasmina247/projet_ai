import pandas as pd
from sqlalchemy import create_engine
from app.core.config import settings
import os

# 1. Connexion à PostgreSQL
engine = create_engine(settings.DATABASE_URL)

#  LE NOUVEAU CHEMIN TROUVÉ :
DATA_DIR = r"C:\Users\A\Downloads\The_look\data\clean"

files = {
    "customers": "users.parquet",
    "products": "products.parquet",
    "orders": "orders_train.parquet",        # Pas de orders_test !
    "order_items": "order_items_train.parquet", # Pas de order_items_test !
    "inventory_items": "inventory_items.parquet"
}

print("Début de l'importation...")

for table_name, filename in files.items():
    filepath = os.path.join(DATA_DIR, filename)
    if not os.path.exists(filepath):
        print(f"⚠️ Fichier introuvable : {filepath}")
        continue
        
    print(f"Lecture de {filename}...")
    df = pd.read_parquet(filepath)
    
    print(f"Insertion de {len(df)} lignes dans la table '{table_name}'...")
    # index=False évite d'ajouter une colonne index inutile
    # if_exists="replace" écrase la table si elle existe déjà
    df.to_sql(table_name, engine, if_exists="replace", index=False)
    print(f"✅ Table '{table_name}' importée.")

print("Importation terminée !")
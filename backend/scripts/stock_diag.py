from app.db.session import SessionLocal
from app.services.inventory_service import get_inventory_alerts

db = SessionLocal()
res = get_inventory_alerts(db, limit=100000)
a = res["alertes"]
print("produits analysés :", res["total_produits"])
print("Rupture :", sum(x["statut"] == "Rupture" for x in a),
      "| Critique :", sum(x["statut"] == "Critique" for x in a))
for x in a[:5]:
    print(x)
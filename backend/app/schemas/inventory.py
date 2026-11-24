from pydantic import BaseModel
from typing import List

class InventoryAlert(BaseModel):
    product_id: int
    product_name: str
    stock_actuel: int
    ventes_30j: int
    jours_de_couverture: float
    probabilite_rupture: float
    statut: str  # "Rupture", "Critique", "OK"

class InventoryResponse(BaseModel):
    total_produits: int
    alertes: List[InventoryAlert]
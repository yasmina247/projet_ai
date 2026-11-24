from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.inventory import InventoryResponse
from app.services.inventory_service import get_inventory_alerts

router = APIRouter(prefix="/api/inventory", tags=["Inventaire"])

@router.get("/alerts", response_model=InventoryResponse)
def inventory_alerts(
    limit: int = Query(50, ge=1, le=200, description="Nombre de produits à analyser"),
    db: Session = Depends(get_db)
):
    """
    Détecte les produits en risque de rupture de stock.
    Combine le modèle XGBoost (probabilité) et une règle métier (jours de couverture).
    """
    return get_inventory_alerts(db, limit=limit)
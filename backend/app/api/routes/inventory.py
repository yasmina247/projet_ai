from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from typing import Literal

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.inventory import InventoryResponse
from app.schemas.inventory_list import ProductListResponse
from app.services.inventory_service import get_inventory_alerts
from app.services.inventory_products_service import get_inventory_products

router = APIRouter(
    prefix="/api/inventory",
    tags=["Inventaire"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/alerts", response_model=InventoryResponse)
def inventory_alerts(
    limit: int = Query(50, ge=1, le=200, description="Nombre de produits à analyser"),
    db: Session = Depends(get_db)
):
    return get_inventory_alerts(db, limit=limit)

@router.get("/products", response_model=ProductListResponse)
def inventory_products(
    search: str = "",
    status: Literal["all", "Rupture", "Critique", "OK"] = "all",
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return get_inventory_products(db, search, status, page, page_size)
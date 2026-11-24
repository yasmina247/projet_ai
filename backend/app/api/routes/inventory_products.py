from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.inventory_list import ProductListResponse
from app.services.inventory_products_service import get_inventory_products

router = APIRouter(prefix="/api/inventory", tags=["Inventaire"])


@router.get("/products", response_model=ProductListResponse)
def inventory_products(
    search: str = "",
    status: Literal["all", "Rupture", "Critique", "OK"] = "all",
    page: int = Query(1, ge=1),
    page_size: int = Query(15, ge=1, le=100),
    db: Session = Depends(get_db),
):
    return get_inventory_products(db, search, status, page, page_size)
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.analytics_sales import SalesResponse
from app.services.analytics_sales_service import get_sales_analytics

router = APIRouter(prefix="/api/analytics", tags=["Ventes & analytics"])


@router.get("/sales", response_model=SalesResponse)
def sales(days: int = Query(7, ge=1, le=90), db: Session = Depends(get_db)):
    return get_sales_analytics(db, days)
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.forecast import ForecastResponse
from app.schemas.analytics_sales import SalesResponse
from app.services.forecasting import predict_recursive
from app.services.analytics_sales_service import get_sales_analytics
from app.core.clock import ref_date

router = APIRouter(
    prefix="/api/analytics",
    tags=["Analytics"],
    dependencies=[Depends(get_current_user)]
)

@router.get("/forecast", response_model=ForecastResponse)
def get_forecast(
    horizon: int = Query(14, ge=1, le=30, description="Nombre de jours à prévoir"),
    db: Session = Depends(get_db)
):
    predictions = predict_recursive(db, horizon=horizon)
    return ForecastResponse(
        horizon=horizon,
        reference_date=ref_date().strftime("%Y-%m-%d"),
        forecast=predictions
    )

@router.get("/sales", response_model=SalesResponse)
def sales(days: int = Query(7, ge=1, le=90), db: Session = Depends(get_db)):
    return get_sales_analytics(db, days)
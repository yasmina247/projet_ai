# backend/app/api/routes/analytics.py
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db # Adaptez selon votre code de session
from app.schemas.forecast import ForecastResponse
from app.services.forecasting import predict_recursive
from app.core.clock import ref_date

router = APIRouter(prefix="/api/analytics", tags=["Analytics"])

@router.get("/forecast", response_model=ForecastResponse)
def get_forecast(
    horizon: int = Query(14, ge=1, le=30, description="Nombre de jours à prévoir"),
    db: Session = Depends(get_db)
):
    """
    Génère les prévisions de ventes pour les N prochains jours.
    """
    predictions = predict_recursive(db, horizon=horizon)
    return ForecastResponse(
        horizon=horizon,
        reference_date=ref_date().strftime("%Y-%m-%d"),
        forecast=predictions
    )
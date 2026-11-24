from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.overview import OverviewResponse, SignalResponse
from app.services.overview_service import get_overview_data, get_overview_signal

router = APIRouter(
    prefix="/api/overview",
    tags=["Vue d'ensemble"],
    dependencies=[Depends(get_current_user)]
)

@router.get("", response_model=OverviewResponse)
def overview(days: int = Query(7, ge=1, le=90), db: Session = Depends(get_db)):
    return get_overview_data(db, days)

@router.get("/signal", response_model=SignalResponse)
def overview_signal(db: Session = Depends(get_db)):
    """Génère le signal IA du jour (prévision vs réel + alerte stock)."""
    return get_overview_signal(db)
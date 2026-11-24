# from fastapi import APIRouter, Depends
# from sqlalchemy.orm import Session
# from app.db.session import get_db
# from app.schemas.overview import OverviewResponse
# from app.services.overview_service import get_overview_data

# router = APIRouter(prefix="/api/overview", tags=["Vue d'ensemble"])

# @router.get("", response_model=OverviewResponse)
# def overview(db: Session = Depends(get_db)):
#     return get_overview_data(db)
from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session

from app.db.session import get_db
from app.schemas.overview import OverviewResponse
from app.services.overview_service import get_overview_data

router = APIRouter(prefix="/api/overview", tags=["Vue d'ensemble"])


@router.get("", response_model=OverviewResponse)
def overview(days: int = Query(7, ge=1, le=90), db: Session = Depends(get_db)):
    return get_overview_data(db, days)
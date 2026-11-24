from fastapi import APIRouter, Depends, Query
from sqlalchemy.orm import Session
from app.db.session import get_db
from app.schemas.insights import RecommendationResponse, SegmentResponse
from app.services.insights_service import get_recommendations, get_segments

router = APIRouter(prefix="/api/insights", tags=["Insights IA"])

@router.get("/recommendations", response_model=RecommendationResponse)
def recommendations(
    product_id: int = Query(..., description="ID du produit pour lequel trouver des similaires"),
    top_n: int = Query(5, ge=1, le=10),
    db: Session = Depends(get_db)
):
    return get_recommendations(db, product_id, top_n)

@router.get("/segments", response_model=SegmentResponse)
def segments(db: Session = Depends(get_db)):
    return get_segments(db)
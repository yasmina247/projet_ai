from pydantic import BaseModel
from typing import List

# --- Schémas pour les Recommandations ---
class RecommendationItem(BaseModel):
    product_id: int
    product_name: str
    brand: str
    category: str
    price: float

class RecommendationResponse(BaseModel):
    source_product_id: int
    source_product_name: str
    recommendations: List[RecommendationItem]

# --- Schémas pour les Segments ---
class SegmentInfo(BaseModel):
    segment_name: str
    count: int
    percentage: float

class SegmentResponse(BaseModel):
    total_clients: int
    segments: List[SegmentInfo]
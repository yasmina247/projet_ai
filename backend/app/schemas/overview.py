# from pydantic import BaseModel
# from typing import List, Optional

# class KPI(BaseModel):
#     label: str
#     value: str
#     change: Optional[str] = None

# class DailyRevenue(BaseModel):
#     date: str
#     revenue: float

# class RecentOrder(BaseModel):
#     order_id: int
#     user_name: str
#     amount: float
#     status: str
#     date: str

# class OverviewResponse(BaseModel):
#     kpis: List[KPI]
#     last_7_days: List[DailyRevenue]
#     recent_orders: List[RecentOrder]
#     reference_date: str
from pydantic import BaseModel


class KPI(BaseModel):
    key: str                      # revenue | orders | avg_basket | clients
    label: str
    value: float
    change_pct: float | None = None   # None si la période précédente est vide


class DailyRevenue(BaseModel):
    date: str
    revenue: float


class CategoryShare(BaseModel):
    category: str
    share_pct: float


class RecentOrder(BaseModel):
    order_id: int
    user_name: str
    amount: float
    status: str
    date: str


class OverviewResponse(BaseModel):
    days: int
    currency: str
    reference_date: str
    kpis: list[KPI]
    daily_revenue: list[DailyRevenue]
    top_categories: list[CategoryShare]
    recent_orders: list[RecentOrder]
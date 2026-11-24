from pydantic import BaseModel


class SalesKPI(BaseModel):
    key: str                  # revenue | orders | units | avg_basket
    label: str
    value: float
    change_pct: float | None = None


class DailySales(BaseModel):
    date: str
    revenue: float
    orders: int


class CategorySales(BaseModel):
    category: str
    revenue: float
    share_pct: float


class TopProduct(BaseModel):
    product_id: int
    product_name: str
    units: int
    revenue: float


class SalesResponse(BaseModel):
    days: int
    currency: str
    reference_date: str
    kpis: list[SalesKPI]
    daily: list[DailySales]
    categories: list[CategorySales]
    top_products: list[TopProduct]
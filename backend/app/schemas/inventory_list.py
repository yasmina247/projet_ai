from pydantic import BaseModel


class ProductStock(BaseModel):
    product_id: int
    product_name: str
    category: str | None = None
    stock_actuel: int
    ventes_30j: int
    jours_de_couverture: float | None = None
    probabilite_rupture: float | None = None
    valeur_stock: float
    statut: str


class StockCounts(BaseModel):
    total: int
    rupture: int
    critique: int
    ok: int


class ProductListResponse(BaseModel):
    counts: StockCounts
    stock_value: float
    total_filtered: int
    page: int
    page_size: int
    items: list[ProductStock]
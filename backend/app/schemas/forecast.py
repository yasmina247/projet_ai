# backend/app/shemas/forecast.py
from datetime import date

from pydantic import BaseModel, Field


class ForecastPoint(BaseModel):
    date: date
    predicted_revenue: float = Field(ge=0)


class ForecastResponse(BaseModel):
    horizon: int
    reference_date: date
    model_name: str | None = None
    validation_mae: float | None = None
    forecast: list[ForecastPoint]
from contextlib import asynccontextmanager

from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.auth import router as auth_router
from app.api.routes.analytics import router as analytics_router
from app.api.routes.inventory import router as inventory_router
from app.api.routes.insights import router as insights_router
from app.api.routes.overview import router as overview_router
from app.api.routes.settings import router as settings_router
from app.core.config import settings
from app.db.session import get_db
from app.services.ml_loader import load_all
from app.api.routes.inventory_products import router as inventory_products_router
from app.api.routes.analytics_sales import router as analytics_sales_router

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_all()  # échoue au démarrage si un .pkl est cassé, pas pendant la démo
    yield


app = FastAPI(title="SmartSales AI API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
def health(db: Session = Depends(get_db)):
    db.execute(text("SELECT 1"))
    return {"status": "ok", "database": "connected"}


app.include_router(auth_router)
app.include_router(analytics_router)
app.include_router(inventory_router)
app.include_router(insights_router)
app.include_router(overview_router)
app.include_router(settings_router)
app.include_router(inventory_products_router)
app.include_router(analytics_sales_router)
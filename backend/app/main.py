from contextlib import asynccontextmanager

from fastapi import FastAPI

from app.services.ml_loader import load_all
from app.api.routes.analytics import router as analytics_router
from app.api.routes.inventory import router as inventory_router
from app.api.routes.insights import router as insights_router
from app.api.routes.overview import router as overview_router
from app.api.routes.settings import router as settings_router
from fastapi.middleware.cors import CORSMiddleware
from app.core.config import settings

@asynccontextmanager
async def lifespan(app: FastAPI):
    load_all()   # échoue au démarrage si un .pkl est cassé, pas pendant la démo
    yield


app = FastAPI(title="SmartSales AI", lifespan=lifespan)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.cors_origins_list,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(analytics_router)
app.include_router(inventory_router)
app.include_router(insights_router)
app.include_router(overview_router)
app.include_router(settings_router)
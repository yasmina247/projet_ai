from fastapi import Depends, FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text
from sqlalchemy.orm import Session
from app.api.auth import router as auth_router
from app.core.config import settings
from app.db.session import get_db

app = FastAPI(title="SmartSales AI API", version="0.1.0")

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
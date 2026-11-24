from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db.session import get_db
from app.schemas.settings import SettingsSchema

router = APIRouter(prefix="/api/settings", tags=["Paramètres"])

@router.get("", response_model=SettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    query = text("SELECT store_name, currency, stock_critical_threshold, enable_whatsapp FROM shop_settings LIMIT 1")
    result = db.execute(query).fetchone()
    
    if not result:
        raise HTTPException(status_code=404, detail="Paramètres non trouvés")
        
    return {
        "store_name": result[0],
        "currency": result[1],
        "stock_critical_threshold": result[2],
        "enable_whatsapp": result[3]
    }

@router.put("", response_model=SettingsSchema)
def update_settings(settings: SettingsSchema, db: Session = Depends(get_db)):
    query = text("""
        UPDATE shop_settings 
        SET store_name = :store_name, 
            currency = :currency, 
            stock_critical_threshold = :threshold, 
            enable_whatsapp = :whatsapp
        WHERE id = (SELECT id FROM shop_settings LIMIT 1)
    """)
    
    db.execute(query, {
        "store_name": settings.store_name,
        "currency": settings.currency,
        "threshold": settings.stock_critical_threshold,
        "whatsapp": settings.enable_whatsapp
    })
    db.commit()
    
    return settings
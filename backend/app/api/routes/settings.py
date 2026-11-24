from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import text
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.db.session import get_db
from app.schemas.settings import SettingsSchema, SettingsUpdate

router = APIRouter(
    prefix="/api/settings",
    tags=["Paramètres"],
    dependencies=[Depends(get_current_user)]
)

FIELDS = list(SettingsSchema.model_fields.keys())

def _read(db: Session) -> dict:
    row = db.execute(text(f"SELECT {', '.join(FIELDS)} FROM shop_settings LIMIT 1")).mappings().first()
    if not row:
        raise HTTPException(status_code=404, detail="Paramètres non trouvés")
    return dict(row)

@router.get("", response_model=SettingsSchema)
def get_settings(db: Session = Depends(get_db)):
    return _read(db)

@router.put("", response_model=SettingsSchema)
def update_settings(payload: SettingsUpdate, db: Session = Depends(get_db)):
    changes = payload.model_dump(exclude_none=True)
    if changes:
        set_clause = ", ".join(f"{k} = :{k}" for k in changes)
        db.execute(
            text(f"UPDATE shop_settings SET {set_clause} WHERE id = (SELECT id FROM shop_settings LIMIT 1)"),
            changes,
        )
        db.commit()
    return _read(db)
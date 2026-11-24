from sqlalchemy import text
from app.db.session import engine

COLUMNS = [
    ("sector", "VARCHAR(80) NOT NULL DEFAULT 'Prêt-à-porter & Mode'"),
    ("city", "VARCHAR(80) NOT NULL DEFAULT ''"),
    ("address", "VARCHAR(255) NOT NULL DEFAULT ''"),
    ("shipping_fee", "NUMERIC(10,2) NOT NULL DEFAULT 0"),
    ("whatsapp_number", "VARCHAR(30) NOT NULL DEFAULT ''"),
    ("whatsapp_tone", "VARCHAR(80) NOT NULL DEFAULT 'Chaleureux & accueillant (recommandé)'"),
    ("welcome_message", "TEXT NOT NULL DEFAULT 'Bonjour ! Bienvenue dans notre boutique. Comment puis-je vous aider aujourd’hui ?'"),
    ("notify_stock", "BOOLEAN NOT NULL DEFAULT TRUE"),
    ("notify_orders", "BOOLEAN NOT NULL DEFAULT TRUE"),
    ("notify_weekly_report", "BOOLEAN NOT NULL DEFAULT TRUE"),
    ("notify_sms", "BOOLEAN NOT NULL DEFAULT FALSE"),
]

with engine.begin() as conn:
    for name, ddl in COLUMNS:
        conn.execute(text(f"ALTER TABLE shop_settings ADD COLUMN IF NOT EXISTS {name} {ddl}"))

print("shop_settings mise à jour")
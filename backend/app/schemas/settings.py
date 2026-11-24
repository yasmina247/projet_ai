from pydantic import BaseModel

class SettingsSchema(BaseModel):
    store_name: str
    currency: str
    stock_critical_threshold: int
    enable_whatsapp: bool

    class Config:
        from_attributes = True
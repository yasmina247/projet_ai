from pydantic import BaseModel, ConfigDict


class SettingsSchema(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    store_name: str
    currency: str
    stock_critical_threshold: int
    sector: str
    city: str
    address: str
    shipping_fee: float
    enable_whatsapp: bool
    whatsapp_number: str
    whatsapp_tone: str
    welcome_message: str
    notify_stock: bool
    notify_orders: bool
    notify_weekly_report: bool
    notify_sms: bool


class SettingsUpdate(BaseModel):
    """Tous les champs sont optionnels : on ne modifie que ceux qui sont envoyés."""
    store_name: str | None = None
    currency: str | None = None
    stock_critical_threshold: int | None = None
    sector: str | None = None
    city: str | None = None
    address: str | None = None
    shipping_fee: float | None = None
    enable_whatsapp: bool | None = None
    whatsapp_number: str | None = None
    whatsapp_tone: str | None = None
    welcome_message: str | None = None
    notify_stock: bool | None = None
    notify_orders: bool | None = None
    notify_weekly_report: bool | None = None
    notify_sms: bool | None = None
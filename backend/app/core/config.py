from datetime import date
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    APP_ENV: str = "development"
    DATABASE_URL: str
    CORS_ORIGINS: str = "http://localhost:5173"

    JWT_SECRET_KEY: str = ""
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7

    BREVO_SMTP_HOST: str = "smtp-relay.brevo.com"
    BREVO_SMTP_PORT: int = 587
    BREVO_SMTP_LOGIN: str = ""
    BREVO_SMTP_KEY: str = ""
    MAIL_FROM: str = ""
    FRONTEND_URL: str = "http://localhost:5173"
    
    # Date "d'aujourd'hui" pour toutes les données métier (= CUTOFF des modèles)
    REFERENCE_DATE: date = date(2022, 4, 1)

    VERIFY_TOKEN_EXPIRE_HOURS: int = 24
    RESET_TOKEN_EXPIRE_MINUTES: int = 30

    @property
    def cors_origins_list(self) -> list[str]:
        return [o.strip() for o in self.CORS_ORIGINS.split(",") if o.strip()]


settings = Settings()
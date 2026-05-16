from pydantic import BaseSettings

class Settings(BaseSettings):
    app_name: str = "Event Booking Platform"
    debug: bool = True
    database_url: str = "sqlite:///./backend.db"
    payment_provider_url: str = "https://payment.example.com/api"
    notification_email_from: str = "noreply@eventplatform.local"

    class Config:
        env_file = ".env"

settings = Settings()

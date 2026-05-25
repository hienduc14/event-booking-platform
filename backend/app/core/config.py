from pydantic_settings import BaseSettings
from typing import Optional


class Settings(BaseSettings):
    # Database
    database_url: str = "postgresql+pg8000://postgres:password@localhost:5432/event_booking"

    # SMTP Email
    smtp_host: str = "smtp.gmail.com"
    smtp_port: int = 587
    smtp_username: str = ""
    smtp_password: str = ""
    smtp_from_email: str = ""
    smtp_from_name: str = "Event Booking Platform"

    # App
    app_name: str = "Event Booking Platform"
    frontend_url: str = "http://localhost:5173"
    backend_url: str = "http://localhost:8000"

    # Reservation timeout (minutes)
    reservation_timeout_minutes: int = 15

    class Config:
        env_file = ".env"
        extra = "ignore"


settings = Settings()

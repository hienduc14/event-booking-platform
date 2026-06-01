import logging

from sqlalchemy import create_engine
from sqlalchemy.engine.url import make_url
from sqlalchemy.orm import sessionmaker

from app.core.config import settings

logger = logging.getLogger("uvicorn.error")
database_url = make_url(settings.database_url)

engine = create_engine(
    settings.database_url,
    pool_pre_ping=True,
    pool_size=10,
    max_overflow=20,
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    logger.info(
        "Opening database session: driver=%s username=%s host=%s port=%s database=%s url=%s",
        database_url.drivername,
        database_url.username,
        database_url.host,
        database_url.port,
        database_url.database,
        database_url.render_as_string(hide_password=True),
    )
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

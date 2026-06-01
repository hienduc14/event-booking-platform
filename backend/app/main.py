from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager

from app.core.config import settings
from app.db.base import Base
from app.core.database import engine

# Import Routers
from app.api.v1.events import router as events_router
from app.api.v1.reservations import router as reservations_router
from app.api.v1.payments import router as payments_router
from app.api.v1.tickets import router as tickets_router

# Import worker
from app.worker.scheduler import start_scheduler, stop_scheduler


@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: Start background scheduler
    start_scheduler()
    yield
    # Shutdown: Stop scheduler
    stop_scheduler()


app = FastAPI(
    title=settings.app_name,
    description="Backend API for Event Booking Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
origins = [
    settings.frontend_url,
    "http://127.0.0.1:5173",
    "http://localhost:5173",
    "http://127.0.0.1:3000",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Public Routers
app.include_router(events_router, prefix="/api/v1/events", tags=["Events (Public)"])
app.include_router(reservations_router, prefix="/api/v1/reservations", tags=["Reservations (Public)"])
app.include_router(payments_router, prefix="/api/v1/payments", tags=["Payments (Public)"])
app.include_router(tickets_router, prefix="/api/v1/tickets", tags=["Tickets (Public)"])

@app.get("/health")
def health_check():
    return {"status": "ok", "app_name": settings.app_name}

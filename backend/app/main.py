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
from app.api.v1.admin_auth import router as admin_auth_router

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
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


from app.api.v1.admin_events import router as admin_events_router
from app.api.v1.admin_venues import router as admin_venues_router
from app.api.v1.admin_artists import router as admin_artists_router
from app.api.v1.admin_bookings import router as admin_bookings_router
from app.api.v1.admin_refunds import router as admin_refunds_router

# Include Public Routers
app.include_router(events_router, prefix="/api/v1/events", tags=["Events (Public)"])
app.include_router(reservations_router, prefix="/api/v1/reservations", tags=["Reservations (Public)"])
app.include_router(payments_router, prefix="/api/v1/payments", tags=["Payments (Public)"])
app.include_router(tickets_router, prefix="/api/v1/tickets", tags=["Tickets (Public)"])

# Include Admin Routers
app.include_router(admin_auth_router, prefix="/api/v1/admin", tags=["Admin Auth"])
app.include_router(admin_events_router, prefix="/api/v1/admin/events", tags=["Admin Events"])
app.include_router(admin_venues_router, prefix="/api/v1/admin/venues", tags=["Admin Venues"])
app.include_router(admin_artists_router, prefix="/api/v1/admin/artists", tags=["Admin Artists"])
app.include_router(admin_bookings_router, prefix="/api/v1/admin/bookings", tags=["Admin Bookings"])
app.include_router(admin_refunds_router, prefix="/api/v1/admin/refunds", tags=["Admin Refunds"])

@app.get("/health")
def health_check():
    return {"status": "ok", "app_name": settings.app_name}

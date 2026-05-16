from fastapi import FastAPI
from app.api.v1 import event, ticket

app = FastAPI(
    title="Event Booking Platform API",
    description="Backend services for event ticket booking, event management, and notification workflows.",
    version="0.1.0",
)

app.include_router(event.router, prefix="/api/v1/events", tags=["events"])
app.include_router(ticket.router, prefix="/api/v1/tickets", tags=["tickets"])


@app.get("/")
def root():
    return {"message": "Event Booking Platform backend is running."}

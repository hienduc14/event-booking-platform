from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.event import EventCreate, EventRead

router = APIRouter()

# Placeholder event store
EVENTS = []

@router.get("/", response_model=List[EventRead])
def list_events():
    return EVENTS

@router.post("/", response_model=EventRead)
def create_event(event_in: EventCreate):
    event = event_in.model_dump()
    event["id"] = len(EVENTS) + 1
    EVENTS.append(event)
    return event

@router.get("/{event_id}", response_model=EventRead)
def get_event(event_id: int):
    for event in EVENTS:
        if event["id"] == event_id:
            return event
    raise HTTPException(status_code=404, detail="Event not found")

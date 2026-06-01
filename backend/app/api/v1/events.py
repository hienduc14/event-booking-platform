from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
import logging

from app.core.database import get_db
from app.schemas.event import EventListItem, EventRead
from app.services.event_service import get_event_list, get_event_detail

router = APIRouter()
logger = logging.getLogger("uvicorn.error")

@router.get("", response_model=List[EventListItem])
def list_events(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Get list of active events."""
    logger.info("GET /api/v1/events received: skip=%s limit=%s", skip, limit)
    return get_event_list(db, skip=skip, limit=limit)

@router.get("/{event_id}", response_model=EventRead)
def get_event(event_id: int, db: Session = Depends(get_db)):
    """Get event detail by ID."""
    event = get_event_detail(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return event

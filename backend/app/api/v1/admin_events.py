from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.schemas.event import EventCreate, EventUpdate, EventRead
from app.schemas.schedule import EventScheduleCreate, EventScheduleRead, EventDayCreate, EventDayRead, EventDayUpdate
from app.schemas.ticket_config import TicketConfigCreate, TicketConfigRead
from app.crud.event import create_event, get_event, update_event, cancel_event
from app.crud.event_schedule import create_schedule
from app.crud.event_day import create_event_day
from app.crud.ticket_config import create_ticket_config
from app.services.admin_event_service import validate_schedule_capacity

router = APIRouter(dependencies=[Depends(get_current_admin)])

# -- Event CRUD --
@router.post("", response_model=EventRead)
def add_event(event: EventCreate, db: Session = Depends(get_db)):
    return create_event(db, event)

@router.put("/{event_id}", response_model=EventRead)
def edit_event(event_id: int, event_in: EventUpdate, db: Session = Depends(get_db)):
    event = get_event(db, event_id)
    if not event:
        raise HTTPException(status_code=404, detail="Event not found")
    return update_event(db, event, event_in)

@router.post("/{event_id}/cancel")
def cancel_event_endpoint(event_id: int, reason: str, db: Session = Depends(get_db)):
    from app.services.admin_event_service import cancel_event as service_cancel
    success = service_cancel(db, event_id, reason)
    if not success:
        raise HTTPException(status_code=400, detail="Could not cancel event")
    return {"message": "Event cancelled. Refunds triggered."}


# -- Schedule & Days --
@router.post("/schedules", response_model=EventScheduleRead)
def add_schedule(schedule: EventScheduleCreate, db: Session = Depends(get_db)):
    return create_schedule(db, schedule)

@router.post("/days", response_model=EventDayRead)
def add_event_day(day: EventDayCreate, db: Session = Depends(get_db)):
    return create_event_day(db, day)


# -- Ticket Configs --
@router.post("/ticket-configs", response_model=TicketConfigRead)
def add_ticket_config(config: TicketConfigCreate, db: Session = Depends(get_db)):
    # Validate capacity
    ok, err = validate_schedule_capacity(db, config.schedule_id, config.schedule_id, config.max_quantity) # schedule_id hack for venue validation?
    # Wait, we need the actual venue_id. Let's fix this in real code by looking up schedule.
    from app.crud.event_schedule import get_schedule
    sched = get_schedule(db, config.schedule_id)
    if not sched:
        raise HTTPException(status_code=404, detail="Schedule not found")
        
    ok, err = validate_schedule_capacity(db, config.schedule_id, sched.venue_id, config.max_quantity)
    if not ok:
        raise HTTPException(status_code=400, detail=err)
        
    return create_ticket_config(db, config)

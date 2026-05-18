from sqlalchemy.orm import Session
from typing import Optional, Tuple
from app.models.event import Event
from app.models.event_day import EventDay
from app.models.ticket_config import TicketConfig
from app.models.venue import Venue


def validate_schedule_capacity(db: Session, schedule_id: int, venue_id: int, new_max_quantity: int = 0) -> Tuple[bool, str]:
    venue = db.query(Venue).filter(Venue.venue_id == venue_id).first()
    if not venue:
        return False, "Venue not found"
        
    configs = db.query(TicketConfig).filter(TicketConfig.schedule_id == schedule_id).all()
    current_total = sum([c.max_quantity for c in configs])
    
    if current_total + new_max_quantity > venue.capacity:
        return False, f"Exceeds venue capacity ({venue.capacity})"
        
    return True, ""


def cancel_event(db: Session, event_id: int, reason: str) -> bool:
    event = db.query(Event).filter(Event.event_id == event_id).first()
    if not event:
        return False

    # schema.sql has no event/schedule/day status columns, so cancellation is
    # represented only by moving paid bookings to a refunding state.
    from app.services.refund_service import create_refund_requests_for_event
    create_refund_requests_for_event(db, event_id, reason)

    return True

from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional, Tuple
from datetime import datetime, timezone
from app.models.event import Event
from app.models.event_schedule import EventSchedule
from app.models.event_day import EventDay
from app.models.ticket_config import TicketConfig
from app.models.booking import Booking
from app.models.booking_detail import BookingDetail


def get_event_list(db: Session, skip: int = 0, limit: int = 100) -> List[Event]:
    return db.query(Event).offset(skip).limit(limit).all()


def get_event_detail(db: Session, event_id: int) -> Optional[Event]:
    return db.query(Event).filter(Event.event_id == event_id).first()


def calculate_remaining_tickets(db: Session, schedule_id: int, event_day_id: int, config_id: int) -> int:
    """
    remaining = max_quantity - (paid_quantity + pending_quantity)
    For a specific config and day.
    """
    config = db.query(TicketConfig).filter(TicketConfig.config_id == config_id).first()
    if not config:
        return 0

    # Sum of quantities in BookingDetails for this config and day, where Booking is PAID or PENDING_PAYMENT
    sold_query = db.query(func.sum(BookingDetail.quantity)).join(Booking).filter(
        BookingDetail.config_id == config_id,
        BookingDetail.event_day_id == event_day_id,
        Booking.payment_status.in_(["Paid", "Pending", "PAID", "PENDING_PAYMENT"])
    )
    sold = sold_query.scalar() or 0

    remaining = config.max_quantity - sold
    return max(0, remaining)

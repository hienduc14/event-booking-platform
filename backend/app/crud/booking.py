from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, timezone
from app.models.booking import Booking
from app.models.booking_detail import BookingDetail


def get_booking(db: Session, booking_id: int) -> Optional[Booking]:
    return db.query(Booking).filter(Booking.booking_id == booking_id).first()


def get_bookings(db: Session, skip: int = 0, limit: int = 100) -> List[Booking]:
    return db.query(Booking).order_by(Booking.created_at.desc()).offset(skip).limit(limit).all()


def get_expired_pending_bookings(db: Session) -> List[Booking]:
    now = datetime.now(timezone.utc)
    return db.query(Booking).filter(
        Booking.booking_status == "PENDING_PAYMENT",
        Booking.expires_at <= now
    ).all()


def get_paid_bookings_by_event(db: Session, event_id: int) -> List[Booking]:
    # We join with EventSchedule to filter by event_id
    from app.models.event_schedule import EventSchedule
    return db.query(Booking).join(EventSchedule).filter(
        EventSchedule.event_id == event_id,
        Booking.booking_status == "PAID"
    ).all()

from sqlalchemy.orm import Session
from typing import List, Optional, Tuple
from app.schemas.booking import ReservationRequest
from app.models.booking import Booking
from app.models.booking_detail import BookingDetail
from app.models.ticket_config import TicketConfig
from app.models.event_schedule import EventSchedule
from app.services.event_service import calculate_remaining_tickets


def create_reservation(db: Session, request: ReservationRequest) -> Tuple[Booking, Optional[str]]:
    # Validate schedule and event
    schedule = db.query(EventSchedule).filter(
        EventSchedule.schedule_id == request.schedule_id
    ).first()
    if not schedule:
        return None, "Schedule not found"

    # Using explicit transaction block (FastAPI session is auto-commit=False)
    # We will compute total amount and validate remaining quantity
    details = []

    # Lock ticket configs to prevent concurrent overselling for the same configs
    config_ids = [item.config_id for item in request.items]
    configs = db.query(TicketConfig).filter(
        TicketConfig.config_id.in_(config_ids)
    ).with_for_update().all()
    
    config_map = {c.config_id: c for c in configs}

    for item in request.items:
        if item.config_id not in config_map:
            db.rollback()
            return None, f"Invalid ticket config {item.config_id}"
            
        config = config_map[item.config_id]
        if config.schedule_id != request.schedule_id:
            db.rollback()
            return None, f"Ticket config {item.config_id} does not belong to the selected schedule"

        remaining = calculate_remaining_tickets(db, request.schedule_id, request.event_day_id, item.config_id)
        if remaining < item.quantity:
            db.rollback()
            return None, f"Not enough tickets for {config.ticket_type}. Remaining: {remaining}"

        details.append(BookingDetail(
            config_id=item.config_id,
            event_day_id=request.event_day_id,
            quantity=item.quantity
        ))

    # Create Booking
    booking = Booking(
        schedule_id=request.schedule_id,
        customer_name=request.customer_name,
        phone=request.phone,
        email=request.email,
        payment_account=request.payment_account,
        payment_status="Pending"
    )
    
    db.add(booking)
    db.flush() # get booking_id

    for d in details:
        d.booking_id = booking.booking_id
        db.add(d)

    db.commit()
    db.refresh(booking)
    return booking, None


def cancel_expired_reservations(db: Session):
    """schema.sql has no reservation expiry column, so there is nothing to cancel."""
    return 0

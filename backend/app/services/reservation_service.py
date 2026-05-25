from datetime import datetime, timezone
from typing import Optional, Tuple

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.e_ticket import ETicket
from app.models.event_day import EventDay
from app.models.event_schedule import EventSchedule
from app.schemas.booking import ReservationRequest


def create_reservation(db: Session, request: ReservationRequest) -> Tuple[Optional[Booking], Optional[str]]:
    schedule = db.query(EventSchedule).filter(EventSchedule.schedule_id == request.schedule_id).first()
    if not schedule:
        return None, "Schedule not found"

    event_day = db.query(EventDay).filter(EventDay.event_day_id == request.event_day_id).first()
    if not event_day or event_day.event_schedule_id != request.schedule_id:
        return None, "Event day does not belong to the selected schedule"

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if schedule.registration_start and now < schedule.registration_start:
        return None, "Ticket sales for this schedule have not started yet"
    if schedule.registration_end and now > schedule.registration_end:
        return None, "Ticket sales for this schedule have ended"

    unique_ticket_ids = list(dict.fromkeys(request.ticket_ids))
    selected_tickets = (
        db.query(ETicket)
        .filter(ETicket.ticket_id.in_(unique_ticket_ids))
        .with_for_update()
        .all()
    )

    if len(selected_tickets) != len(unique_ticket_ids):
        db.rollback()
        return None, "One or more selected seats no longer exist"

    for ticket in selected_tickets:
        if ticket.event_day_id != request.event_day_id:
            db.rollback()
            return None, "Selected seats must belong to the same event day"
        if ticket.ticket_status != "Available" or ticket.booking_id is not None:
            db.rollback()
            return None, f"Seat {ticket.row_label or ''}{ticket.col_number or ''} is no longer available"

    booking = Booking(
        schedule_id=request.schedule_id,
        customer_name=request.customer_name,
        phone=request.phone,
        email=request.email,
        payment_account=request.payment_account,
        payment_status="Pending",
    )
    db.add(booking)
    db.flush()

    for ticket in selected_tickets:
        ticket.booking_id = booking.booking_id
        ticket.ticket_status = "Holding"

    db.commit()
    db.refresh(booking)
    return booking, None


def cancel_expired_reservations(db: Session):
    return 0

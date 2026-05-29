import uuid
from typing import List

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.models.e_ticket import ETicket


def generate_ticket_code(event_id: int, booking_id: int, ticket_id: int) -> str:
    random_str = str(uuid.uuid4()).split("-")[0].upper()
    return f"EVT-{event_id}-{booking_id}-{ticket_id}-{random_str}"


def generate_tickets_for_booking(db: Session, booking_id: int) -> List[ETicket]:
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking or booking.booking_status != "PAID":
        return []

    event_id = booking.schedule.event_id
    issued = []
    for ticket in booking.e_tickets:
        if ticket.ticket_status == "Holding":
            ticket.ticket_status = "Valid"
        if not ticket.ticket_code:
            ticket.ticket_code = generate_ticket_code(event_id, booking.booking_id, ticket.ticket_id)
        issued.append(ticket)

    db.commit()
    return issued


def release_tickets_safely(db: Session, booking_id: int) -> None:
    # Fetch tickets currently held by this booking
    tickets = db.query(ETicket).filter(ETicket.booking_id == booking_id).all()
    for ticket in tickets:
        # Only release if the status is Holding and it still points to this booking
        if ticket.ticket_status == "Holding":
            ticket.booking_id = None
            ticket.ticket_status = "Available"
    db.commit()


def release_tickets_for_booking(db: Session, booking_id: int) -> None:
    release_tickets_safely(db, booking_id)

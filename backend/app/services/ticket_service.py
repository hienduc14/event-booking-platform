from sqlalchemy.orm import Session
import uuid
from typing import List
from app.models.booking import Booking
from app.models.booking_detail import BookingDetail
from app.models.e_ticket import ETicket


def generate_ticket_code(event_id: int, booking_id: int) -> str:
    random_str = str(uuid.uuid4()).split("-")[0].upper()
    return f"EVT-{event_id}-{booking_id}-{random_str}"


def generate_tickets_for_booking(db: Session, booking_id: int) -> List[ETicket]:
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking or booking.booking_status != "PAID":
        return []

    event_id = booking.schedule.event_id
    tickets = []

    for detail in booking.booking_details:
        for _ in range(detail.quantity):
            code = generate_ticket_code(event_id, booking_id)
            t = ETicket(
                ticket_code=code,
                booking_detail_id=detail.booking_detail_id,
                ticket_status="Valid"
            )
            db.add(t)
            tickets.append(t)

    db.commit()
    return tickets

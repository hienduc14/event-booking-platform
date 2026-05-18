from sqlalchemy.orm import Session
from datetime import datetime, timezone
import uuid
import qrcode
import io
import base64
from typing import List
from app.models.booking import Booking
from app.models.booking_detail import BookingDetail
from app.models.e_ticket import ETicket


def generate_ticket_code(event_id: int, booking_id: int) -> str:
    random_str = str(uuid.uuid4()).split("-")[0].upper()
    return f"EVT-{event_id}-{booking_id}-{random_str}"


def generate_qr_base64(data: str) -> str:
    qr = qrcode.QRCode(version=1, box_size=10, border=5)
    qr.add_data(data)
    qr.make(fit=True)
    img = qr.make_image(fill_color="black", back_color="white")
    
    buffered = io.BytesIO()
    img.save(buffered, format="PNG")
    img_str = base64.b64encode(buffered.getvalue()).decode()
    return f"data:image/png;base64,{img_str}"


def generate_tickets_for_booking(db: Session, booking_id: int) -> List[ETicket]:
    booking = db.query(Booking).filter(Booking.booking_id == booking_id).first()
    if not booking or booking.booking_status != "PAID":
        return []

    event_id = booking.schedule.event_id
    tickets = []

    for detail in booking.booking_details:
        for _ in range(detail.quantity):
            code = generate_ticket_code(event_id, booking_id)
            qr_data = f'{{"ticket_code":"{code}","booking_id":{booking_id}}}'
            qr_url = generate_qr_base64(qr_data)
            
            t = ETicket(
                ticket_code=code,
                booking_detail_id=detail.booking_detail_id,
                ticket_status="VALID",
                qr_code_url=qr_url
            )
            db.add(t)
            tickets.append(t)

    db.commit()
    return tickets

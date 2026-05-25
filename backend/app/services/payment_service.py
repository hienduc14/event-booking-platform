import re
import time
from datetime import datetime, timezone
from random import uniform
from typing import Any, Dict, Optional, Tuple
from urllib.parse import quote

from sqlalchemy.orm import Session

from app.models.booking import Booking
from app.schemas.payment import PaymentCreate, PaymentProcessRequest
from app.services.notification_service import send_payment_success_email
from app.services.ticket_service import generate_tickets_for_booking, release_tickets_for_booking


def _qr_code_data_url() -> str:
    svg = """
    <svg xmlns='http://www.w3.org/2000/svg' width='220' height='220' viewBox='0 0 220 220'>
      <rect width='220' height='220' fill='#ffffff'/>
      <rect x='16' y='16' width='52' height='52' fill='#111827'/>
      <rect x='28' y='28' width='28' height='28' fill='#ffffff'/>
      <rect x='152' y='16' width='52' height='52' fill='#111827'/>
      <rect x='164' y='28' width='28' height='28' fill='#ffffff'/>
      <rect x='16' y='152' width='52' height='52' fill='#111827'/>
      <rect x='28' y='164' width='28' height='28' fill='#ffffff'/>
      <rect x='88' y='28' width='16' height='16' fill='#111827'/>
      <rect x='120' y='28' width='16' height='16' fill='#111827'/>
      <rect x='88' y='60' width='16' height='16' fill='#111827'/>
      <rect x='104' y='76' width='16' height='16' fill='#111827'/>
      <rect x='136' y='60' width='16' height='16' fill='#111827'/>
      <rect x='88' y='104' width='16' height='16' fill='#111827'/>
      <rect x='120' y='104' width='16' height='16' fill='#111827'/>
      <rect x='152' y='88' width='16' height='16' fill='#111827'/>
      <rect x='168' y='120' width='16' height='16' fill='#111827'/>
      <rect x='88' y='136' width='16' height='16' fill='#111827'/>
      <rect x='104' y='152' width='16' height='16' fill='#111827'/>
      <rect x='120' y='168' width='16' height='16' fill='#111827'/>
      <rect x='136' y='136' width='16' height='16' fill='#111827'/>
      <text x='110' y='210' text-anchor='middle' font-size='12' fill='#111827' font-family='Arial'>Scan to pay</text>
    </svg>
    """
    return f"data:image/svg+xml;utf8,{quote(svg)}"


COMPANY_BANK = {
    "bank_name": "Vietcombank",
    "account_name": "Event Booking Company",
    "account_number": "0123456789",
    "qr_code_url": _qr_code_data_url(),
}


def _payment_payload(booking: Booking, payment_method: str, status: str, transaction_id: str | None = None) -> Dict[str, Any]:
    return {
        "payment_id": booking.booking_id,
        "booking_id": booking.booking_id,
        "gateway_transaction_id": transaction_id,
        "payment_method": payment_method,
        "amount": booking.total_amount,
        "status": status,
        "company_bank": COMPANY_BANK,
        "refund_account_required": payment_method == "ONLINE_BANKING",
        "card_payment_required": payment_method == "CARD_PAYMENT",
        "created_at": booking.created_at,
        "updated_at": booking.updated_at,
    }


def create_payment(db: Session, request: PaymentCreate) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    booking = db.query(Booking).filter(Booking.booking_id == request.booking_id).first()
    if not booking:
        return None, "Booking not found"

    if booking.booking_status != "PENDING_PAYMENT":
        return None, f"Booking status is {booking.booking_status}, cannot pay."

    return _payment_payload(booking, request.payment_method, "INITIATED"), None


def _validate_card_input(payload: PaymentProcessRequest) -> Optional[str]:
    card_number = re.sub(r"\s+", "", payload.card_number or "")
    if not re.fullmatch(r"\d{16}", card_number):
        return "Card number must contain exactly 16 digits."
    if not re.fullmatch(r"(0[1-9]|1[0-2])/[0-9]{2}", payload.expiration or ""):
        return "Expiration must be in MM/YY format."
    if not re.fullmatch(r"\d{3,4}", payload.cvv or ""):
        return "CVV must contain 3 or 4 digits."
    return None


def _fail_expired_booking(db: Session, booking: Booking) -> Tuple[None, str]:
    booking.payment_status = "Failed"
    db.commit()
    release_tickets_for_booking(db, booking.booking_id)
    return None, "Payment window expired after 10 minutes. Your held seats have been released."


def process_payment(db: Session, payload: PaymentProcessRequest) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
    booking = db.query(Booking).filter(Booking.booking_id == payload.booking_id).first()
    if not booking:
        return None, "Booking not found"

    if booking.booking_status != "PENDING_PAYMENT":
        return None, f"Booking status is {booking.booking_status}, cannot pay."

    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if booking.expires_at and now >= booking.expires_at:
        return _fail_expired_booking(db, booking)

    if payload.payment_method == "ONLINE_BANKING":
        if not payload.refund_account or not payload.refund_account.strip():
            return None, "Refund account is required for online banking."
        booking.payment_account = payload.refund_account.strip()
    else:
        validation_error = _validate_card_input(payload)
        if validation_error:
            return None, validation_error

        normalized_card_number = re.sub(r"\s+", "", payload.card_number or "")
        booking.payment_account = f"CARD ****{normalized_card_number[-4:]}"

    db.commit()
    time.sleep(uniform(3, 5))

    db.refresh(booking)
    now = datetime.now(timezone.utc).replace(tzinfo=None)
    if booking.booking_status != "PENDING_PAYMENT":
        return None, f"Booking status is {booking.booking_status}, cannot pay."
    if booking.expires_at and now >= booking.expires_at:
        return _fail_expired_booking(db, booking)

    booking.payment_status = "Paid"
    db.commit()

    generate_tickets_for_booking(db, booking.booking_id)
    send_payment_success_email(booking.email, booking.customer_name, booking.booking_id)
    db.refresh(booking)
    return {
        "message": "Payment successful. Your electronic tickets are ready.",
        "status": "SUCCESS",
        "booking_status": booking.booking_status,
        "tickets_ready": True,
    }, None

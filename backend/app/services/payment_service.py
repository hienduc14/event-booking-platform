from sqlalchemy.orm import Session
from typing import Tuple, Optional, Dict, Any
from app.models.booking import Booking
from app.schemas.payment import PaymentCreate, PaymentWebhookPayload
from app.services.ticket_service import generate_tickets_for_booking
from app.services.notification_service import send_payment_success_email


def _payment_payload(booking: Booking, payment_method: str, status: str, transaction_id: str | None = None) -> Dict[str, Any]:
    return {
        "payment_id": booking.booking_id,
        "booking_id": booking.booking_id,
        "gateway_transaction_id": transaction_id,
        "payment_method": payment_method,
        "amount": booking.total_amount,
        "status": status,
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


def process_payment_webhook(db: Session, payload: PaymentWebhookPayload) -> Tuple[bool, str]:
    booking = db.query(Booking).filter(Booking.booking_id == payload.booking_id).first()
    if not booking:
        return False, "Booking not found"

    if payload.status == "SUCCESS":
        booking.payment_status = "Paid"
        db.commit()

        # Trigger ticket issuance and notification
        generate_tickets_for_booking(db, booking.booking_id)
        send_payment_success_email(booking.email, booking.customer_name, booking.booking_id)
        
        return True, "Payment successful"
    else:
        booking.payment_status = "Failed"
        db.commit()
        return True, "Payment failed"

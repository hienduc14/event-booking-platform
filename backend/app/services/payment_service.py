from sqlalchemy.orm import Session
from typing import Tuple, Optional
from app.models.booking import Booking
from app.models.payment_transaction import PaymentTransaction
from app.schemas.payment import PaymentCreate, PaymentWebhookPayload
from app.services.ticket_service import generate_tickets_for_booking
from app.services.notification_service import send_payment_success_email


def create_payment(db: Session, request: PaymentCreate) -> Tuple[Optional[PaymentTransaction], Optional[str]]:
    booking = db.query(Booking).filter(Booking.booking_id == request.booking_id).first()
    if not booking:
        return None, "Booking not found"
    
    if booking.booking_status != "PENDING_PAYMENT":
        return None, f"Booking status is {booking.booking_status}, cannot pay."

    # Create payment intent/transaction
    payment = PaymentTransaction(
        booking_id=booking.booking_id,
        payment_method=request.payment_method,
        amount=booking.total_amount,
        status="INITIATED"
    )
    db.add(payment)
    db.commit()
    db.refresh(payment)
    return payment, None


def process_payment_webhook(db: Session, payload: PaymentWebhookPayload) -> Tuple[bool, str]:
    booking = db.query(Booking).filter(Booking.booking_id == payload.booking_id).first()
    if not booking:
        return False, "Booking not found"

    payment = db.query(PaymentTransaction).filter(
        PaymentTransaction.booking_id == payload.booking_id,
        PaymentTransaction.status == "INITIATED"
    ).order_by(PaymentTransaction.created_at.desc()).first()

    if not payment:
        return False, "No pending payment found"

    # Simulate signature verification (Placeholder)
    if payload.status == "SUCCESS":
        payment.status = "SUCCESS"
        payment.gateway_transaction_id = payload.transaction_id
        booking.booking_status = "PAID"
        db.commit()

        # Trigger ticket issuance and notification
        generate_tickets_for_booking(db, booking.booking_id)
        send_payment_success_email(booking.email, booking.customer_name, booking.booking_id)
        
        return True, "Payment successful"
    else:
        payment.status = "FAILED"
        payment.gateway_transaction_id = payload.transaction_id
        booking.booking_status = "PAYMENT_FAILED"
        db.commit()
        return True, "Payment failed"

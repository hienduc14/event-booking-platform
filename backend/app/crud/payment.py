from sqlalchemy.orm import Session
from typing import Optional, Dict, Any
from app.schemas.payment import PaymentCreate
from app.models.booking import Booking


def create_payment_transaction(db: Session, obj_in: PaymentCreate, amount: float) -> Dict[str, Any]:
    return {
        "payment_id": obj_in.booking_id,
        "booking_id": obj_in.booking_id,
        "payment_method": obj_in.payment_method,
        "amount": amount,
        "status": "INITIATED",
    }


def get_payment_transaction(db: Session, payment_id: int) -> Optional[Dict[str, Any]]:
    booking = db.query(Booking).filter(Booking.booking_id == payment_id).first()
    if not booking:
        return None
    return {
        "payment_id": booking.booking_id,
        "booking_id": booking.booking_id,
        "payment_method": "manual",
        "amount": booking.total_amount,
        "status": booking.booking_status,
        "created_at": booking.created_at,
        "updated_at": booking.updated_at,
    }

from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.payment_transaction import PaymentTransaction
from app.schemas.payment import PaymentCreate


def create_payment_transaction(db: Session, obj_in: PaymentCreate, amount: float) -> PaymentTransaction:
    db_obj = PaymentTransaction(
        booking_id=obj_in.booking_id,
        payment_method=obj_in.payment_method,
        amount=amount,
        status="INITIATED"
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_payment_transaction(db: Session, payment_id: int) -> Optional[PaymentTransaction]:
    return db.query(PaymentTransaction).filter(PaymentTransaction.payment_id == payment_id).first()

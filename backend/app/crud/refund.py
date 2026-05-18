from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.refund_transaction import RefundTransaction
from app.schemas.refund import RefundCreate


def create_refund_transaction(db: Session, booking_id: int, amount: float, reason: str = None) -> RefundTransaction:
    db_obj = RefundTransaction(
        booking_id=booking_id,
        amount=amount,
        reason=reason,
        status="PENDING",
        is_manual=False
    )
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_refund(db: Session, refund_id: int) -> Optional[RefundTransaction]:
    return db.query(RefundTransaction).filter(RefundTransaction.refund_id == refund_id).first()


def get_pending_refunds(db: Session) -> List[RefundTransaction]:
    return db.query(RefundTransaction).filter(RefundTransaction.status == "PENDING").all()

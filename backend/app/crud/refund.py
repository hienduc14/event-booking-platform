from sqlalchemy.orm import Session
from typing import List, Optional, Dict, Any


def create_refund_transaction(db: Session, booking_id: int, amount: float, reason: str = None) -> Dict[str, Any]:
    return {
        "refund_id": booking_id,
        "booking_id": booking_id,
        "amount": amount,
        "reason": reason,
        "status": "PENDING",
        "is_manual": False,
    }


def get_refund(db: Session, refund_id: int) -> Optional[Dict[str, Any]]:
    return None


def get_pending_refunds(db: Session) -> List[Dict[str, Any]]:
    return []

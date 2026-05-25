from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.e_ticket import ETicket


def get_ticket_by_code(db: Session, ticket_code: str) -> Optional[ETicket]:
    return db.query(ETicket).filter(ETicket.ticket_code == ticket_code).first()


def get_tickets_by_booking(db: Session, booking_id: int) -> List[ETicket]:
    return db.query(ETicket).filter(ETicket.booking_id == booking_id).all()


def mark_ticket_used(db: Session, db_obj: ETicket) -> ETicket:
    db_obj.ticket_status = "Used"
    db.commit()
    db.refresh(db_obj)
    return db_obj

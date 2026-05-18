from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.schemas.ticket import ETicketRead
from app.crud.ticket import get_ticket_by_code, get_tickets_by_booking

router = APIRouter()

@router.get("/booking/{booking_id}", response_model=List[ETicketRead])
def get_booking_tickets(booking_id: int, db: Session = Depends(get_db)):
    """Get all tickets for a specific booking."""
    tickets = get_tickets_by_booking(db, booking_id)
    return tickets

@router.get("/{ticket_code}", response_model=ETicketRead)
def get_ticket(ticket_code: str, db: Session = Depends(get_db)):
    """Get ticket detail by code (for scanning QR)."""
    ticket = get_ticket_by_code(db, ticket_code)
    if not ticket:
        raise HTTPException(status_code=404, detail="Ticket not found")
    return ticket

from fastapi import APIRouter, HTTPException
from typing import List
from app.schemas.ticket import TicketCreate, TicketRead

router = APIRouter()

TICKETS = []

@router.post("/", response_model=TicketRead)
def create_ticket(ticket_in: TicketCreate):
    ticket = ticket_in.model_dump()
    ticket["id"] = len(TICKETS) + 1
    TICKETS.append(ticket)
    return ticket

@router.get("/", response_model=List[TicketRead])
def list_tickets():
    return TICKETS

@router.get("/{ticket_id}", response_model=TicketRead)
def get_ticket(ticket_id: int):
    for ticket in TICKETS:
        if ticket["id"] == ticket_id:
            return ticket
    raise HTTPException(status_code=404, detail="Ticket not found")

from app.schemas.ticket import TicketCreate


def reserve_ticket(ticket_in: TicketCreate) -> dict:
    # Placeholder: check availability, lock inventory, create pending ticket
    return {"id": 1, **ticket_in.model_dump(), "status": "reserved"}


def calculate_total(ticket_count: int, unit_price: float) -> float:
    return ticket_count * unit_price

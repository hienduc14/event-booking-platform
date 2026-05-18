from datetime import datetime
from typing import Optional
from pydantic import BaseModel


class ETicketRead(BaseModel):
    ticket_code: str
    booking_detail_id: int
    ticket_status: str
    qr_code_url: Optional[str] = None
    issued_at: Optional[datetime] = None
    used_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class ETicketDetailRead(ETicketRead):
    event_name: str
    venue_name: str
    date: datetime
    ticket_type: str
    customer_name: str

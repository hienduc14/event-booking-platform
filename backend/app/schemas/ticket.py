from datetime import datetime
from decimal import Decimal
from typing import Optional

from pydantic import BaseModel


class ETicketRead(BaseModel):
    ticket_id: int
    ticket_config_id: int
    event_day_id: int
    booking_id: Optional[int] = None
    ticket_code: Optional[str] = None
    ticket_status: str
    row_label: Optional[str] = None
    col_number: Optional[int] = None
    ticket_type: Optional[str] = None
    price: Optional[Decimal] = None
    event_name: Optional[str] = None
    venue_name: Optional[str] = None
    date: Optional[datetime] = None
    customer_name: Optional[str] = None
    qr_code_url: Optional[str] = None
    issued_at: Optional[datetime] = None
    used_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

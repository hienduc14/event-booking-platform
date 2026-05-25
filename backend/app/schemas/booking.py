from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel, EmailStr, field_validator

from app.schemas.ticket import ETicketRead


class ReservationRequest(BaseModel):
    customer_name: str
    phone: str
    email: EmailStr
    schedule_id: int
    event_day_id: int
    ticket_ids: List[int]

    @field_validator("ticket_ids")
    @classmethod
    def ticket_ids_required(cls, value: List[int]) -> List[int]:
        if not value:
            raise ValueError("Select at least one seat")
        return value


class BookingRead(BaseModel):
    booking_id: int
    schedule_id: int
    customer_name: str
    phone: str
    email: str
    payment_account: Optional[str] = None
    booking_status: str
    total_amount: Decimal
    expires_at: Optional[datetime] = None
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    e_tickets: List[ETicketRead] = []

    model_config = {"from_attributes": True}


class BookingListItem(BaseModel):
    booking_id: int
    customer_name: str
    email: str
    phone: str
    booking_status: str
    total_amount: Decimal
    created_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

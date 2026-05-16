from pydantic import BaseModel, EmailStr
from typing import List
from decimal import Decimal
from app.schemas.ticket import TicketRead

class OrderCreate(BaseModel):
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    ticket_ids: List[int]

class OrderRead(BaseModel):
    id: int
    customer_name: str
    customer_email: EmailStr
    customer_phone: str
    total_amount: Decimal
    payment_status: str
    tickets: List[TicketRead] = []

    class Config:
        from_attributes = True

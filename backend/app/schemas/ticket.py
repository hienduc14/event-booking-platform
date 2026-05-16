from pydantic import BaseModel
from typing import Optional
from enum import Enum

class TicketType(str, Enum):
    gold = "gold"
    silver = "silver"
    bronze = "bronze"
    plastic = "plastic"
    vip = "vip"

class TicketCreate(BaseModel):
    code: str
    type: TicketType
    event_day_id: int
    customer_name: Optional[str] = None
    customer_email: Optional[str] = None
    customer_phone: Optional[str] = None

class TicketRead(TicketCreate):
    id: int
    status: str

    class Config:
        from_attributes = True

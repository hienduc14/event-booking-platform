from datetime import datetime
from decimal import Decimal
from typing import List, Optional

from pydantic import BaseModel


class EventBase(BaseModel):
    event_name: str
    description: Optional[str] = None
    number_of_days: Optional[int] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    description: Optional[str] = None
    number_of_days: Optional[int] = None


class EventVenueRead(BaseModel):
    venue_id: int
    venue_name: str
    city: str
    capacity: int

    model_config = {"from_attributes": True}


class EventTicketConfigRead(BaseModel):
    config_id: int
    schedule_id: int
    ticket_type: str
    price: Decimal
    max_quantity: int
    remaining_quantity: Optional[int] = None

    model_config = {"from_attributes": True}


class EventSeatRead(BaseModel):
    ticket_id: int
    ticket_config_id: int
    ticket_status: str
    row_label: Optional[str] = None
    col_number: Optional[int] = None
    ticket_type: Optional[str] = None
    price: Optional[Decimal] = None

    model_config = {"from_attributes": True}


class EventDayRead(BaseModel):
    event_day_id: int
    schedule_id: int
    date: datetime
    available_tickets: List[EventSeatRead] = []

    model_config = {"from_attributes": True}


class EventScheduleRead(BaseModel):
    schedule_id: int
    event_id: int
    venue_id: int
    registration_start: Optional[datetime] = None
    registration_end: Optional[datetime] = None
    seat_layout: Optional[str] = None
    venue: EventVenueRead
    ticket_configs: List[EventTicketConfigRead] = []
    event_days: List[EventDayRead] = []

    model_config = {"from_attributes": True}


class EventRead(EventBase):
    event_id: int
    banner_url: Optional[str] = None
    status: str = "ACTIVE"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None
    schedules: List[EventScheduleRead] = []

    model_config = {"from_attributes": True}


class EventListItem(BaseModel):
    event_id: int
    event_name: str
    description: Optional[str] = None
    number_of_days: Optional[int] = None
    banner_url: Optional[str] = None
    status: str = "ACTIVE"

    model_config = {"from_attributes": True}

from datetime import datetime
from typing import Optional
from pydantic import BaseModel


# ── Event Schemas ──────────────────────────────────────────────

class EventBase(BaseModel):
    event_name: str
    description: Optional[str] = None
    banner_url: Optional[str] = None


class EventCreate(EventBase):
    pass


class EventUpdate(BaseModel):
    event_name: Optional[str] = None
    description: Optional[str] = None
    banner_url: Optional[str] = None
    status: Optional[str] = None


class EventRead(EventBase):
    event_id: int
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}


class EventListItem(BaseModel):
    event_id: int
    event_name: str
    description: Optional[str] = None
    banner_url: Optional[str] = None
    status: str

    model_config = {"from_attributes": True}

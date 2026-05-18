from datetime import datetime
from typing import Optional, List
from pydantic import BaseModel


# ── EventSchedule ──────────────────────────────────────────────

class EventScheduleCreate(BaseModel):
    event_id: int
    venue_id: int


class EventScheduleRead(BaseModel):
    schedule_id: int
    event_id: int
    venue_id: int
    status: str = "ACTIVE"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


# ── EventDay ──────────────────────────────────────────────────

class EventDayCreate(BaseModel):
    schedule_id: int
    date: datetime


class EventDayUpdate(BaseModel):
    date: Optional[datetime] = None


class EventDayRead(BaseModel):
    event_day_id: int
    schedule_id: int
    date: datetime
    status: str = "ACTIVE"
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

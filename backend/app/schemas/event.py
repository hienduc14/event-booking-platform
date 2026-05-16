from pydantic import BaseModel
from typing import Optional, List

class EventBase(BaseModel):
    code: str
    name: str
    description: Optional[str] = None

class EventCreate(EventBase):
    pass

class EventRead(EventBase):
    id: int

    class Config:
        from_attributes = True

from datetime import datetime
from typing import Optional
from pydantic import BaseModel, field_validator


class VenueBase(BaseModel):
    venue_name: str
    city: str
    address: Optional[str] = None
    capacity: int

    @field_validator("capacity")
    @classmethod
    def capacity_must_be_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("capacity must be greater than 0")
        return v


class VenueCreate(VenueBase):
    pass


class VenueUpdate(BaseModel):
    venue_name: Optional[str] = None
    city: Optional[str] = None
    address: Optional[str] = None
    capacity: Optional[int] = None


class VenueRead(VenueBase):
    venue_id: int
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}

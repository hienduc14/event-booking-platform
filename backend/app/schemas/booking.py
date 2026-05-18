from datetime import datetime
from typing import Optional, List
from decimal import Decimal
from pydantic import BaseModel, EmailStr, field_validator


# ── Booking Item (one line in booking) ─────────────────────────

class BookingItem(BaseModel):
    config_id: int
    quantity: int

    @field_validator("quantity")
    @classmethod
    def quantity_positive(cls, v: int) -> int:
        if v <= 0:
            raise ValueError("quantity must be > 0")
        return v


# ── Reservation Request (POST /api/v1/reservations) ────────────

class ReservationRequest(BaseModel):
    customer_name: str
    phone: str
    email: EmailStr
    payment_account: str
    schedule_id: int
    event_day_id: int
    items: List[BookingItem]


# ── Booking Detail Read ─────────────────────────────────────────

class BookingDetailRead(BaseModel):
    booking_detail_id: int
    config_id: int
    event_day_id: int
    quantity: int
    unit_price: Decimal
    subtotal: Decimal

    model_config = {"from_attributes": True}


# ── Booking Read ────────────────────────────────────────────────

class BookingRead(BaseModel):
    booking_id: int
    schedule_id: int
    customer_name: str
    phone: str
    email: str
    payment_account: str
    booking_status: str
    total_amount: Decimal
    expires_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    booking_details: List[BookingDetailRead] = []

    model_config = {"from_attributes": True}


# ── Admin Booking List ──────────────────────────────────────────

class BookingListItem(BaseModel):
    booking_id: int
    customer_name: str
    email: str
    phone: str
    booking_status: str
    total_amount: Decimal
    created_at: datetime

    model_config = {"from_attributes": True}

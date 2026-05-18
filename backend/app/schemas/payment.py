from datetime import datetime
from typing import Optional, Any
from decimal import Decimal
from pydantic import BaseModel


class PaymentCreate(BaseModel):
    booking_id: int
    payment_method: str


class PaymentRead(BaseModel):
    payment_id: int
    booking_id: int
    gateway_transaction_id: Optional[str] = None
    payment_method: str
    amount: Decimal
    status: str
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PaymentWebhookPayload(BaseModel):
    transaction_id: str
    booking_id: int
    status: str
    amount: Decimal
    signature: Optional[str] = None

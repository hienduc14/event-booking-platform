from datetime import datetime
from decimal import Decimal
from typing import Literal, Optional

from pydantic import BaseModel


PaymentMethod = Literal["ONLINE_BANKING", "CARD_PAYMENT"]


class PaymentCreate(BaseModel):
    booking_id: int
    payment_method: PaymentMethod = "ONLINE_BANKING"


class CompanyBankInfo(BaseModel):
    bank_name: str
    account_name: str
    account_number: str
    qr_code_url: str


class PaymentRead(BaseModel):
    payment_id: int
    booking_id: int
    gateway_transaction_id: Optional[str] = None
    payment_method: PaymentMethod
    amount: Decimal
    status: str
    company_bank: CompanyBankInfo
    refund_account_required: bool = False
    card_payment_required: bool = False
    created_at: Optional[datetime] = None
    updated_at: Optional[datetime] = None

    model_config = {"from_attributes": True}


class PaymentProcessRequest(BaseModel):
    booking_id: int
    payment_method: PaymentMethod
    refund_account: Optional[str] = None
    card_number: Optional[str] = None
    expiration: Optional[str] = None
    cvv: Optional[str] = None


class PaymentProcessResult(BaseModel):
    message: str
    status: str
    booking_status: str
    tickets_ready: bool = False

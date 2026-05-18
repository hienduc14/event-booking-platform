from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.payment import PaymentCreate, PaymentRead, PaymentWebhookPayload
from app.services.payment_service import create_payment, process_payment_webhook

router = APIRouter()

@router.post("/create", response_model=PaymentRead)
def init_payment(request: PaymentCreate, db: Session = Depends(get_db)):
    """Initialize a payment for a booking."""
    payment, error = create_payment(db, request)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return payment

@router.post("/webhook")
def payment_webhook(payload: PaymentWebhookPayload, db: Session = Depends(get_db)):
    """Webhook for payment gateway to notify payment success/failure."""
    success, msg = process_payment_webhook(db, payload)
    if not success:
        raise HTTPException(status_code=400, detail=msg)
    return {"message": msg}

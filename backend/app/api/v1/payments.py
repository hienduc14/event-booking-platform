from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.schemas.payment import PaymentCreate, PaymentProcessRequest, PaymentProcessResult, PaymentRead
from app.services.payment_service import create_payment, process_payment

router = APIRouter()

@router.post("/create", response_model=PaymentRead)
def init_payment(request: PaymentCreate, db: Session = Depends(get_db)):
    """Initialize a payment for a booking."""
    payment, error = create_payment(db, request)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return payment

@router.post("/process", response_model=PaymentProcessResult)
def process_payment_endpoint(payload: PaymentProcessRequest, db: Session = Depends(get_db)):
    result, error = process_payment(db, payload)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return result

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.schemas.booking import ReservationRequest, BookingRead
from app.services.reservation_service import create_reservation

router = APIRouter()

@router.post("", response_model=BookingRead)
def create_new_reservation(request: ReservationRequest, db: Session = Depends(get_db)):
    """Create a new reservation for tickets. Holds tickets in PENDING_PAYMENT state."""
    booking, error = create_reservation(db, request)
    if error:
        raise HTTPException(status_code=400, detail=error)
    return booking

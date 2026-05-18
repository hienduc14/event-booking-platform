from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.schemas.booking import BookingListItem
from app.crud.booking import get_bookings

router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.get("", response_model=List[BookingListItem])
def list_all_bookings(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    """Admin endpoint to see all bookings across the system."""
    return get_bookings(db, skip=skip, limit=limit)

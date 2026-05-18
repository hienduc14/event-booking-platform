from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.schemas.venue import VenueCreate, VenueUpdate, VenueRead
from app.crud.venue import create_venue, get_venue, get_venues, update_venue

router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.post("", response_model=VenueRead)
def add_venue(venue: VenueCreate, db: Session = Depends(get_db)):
    return create_venue(db, venue)

@router.get("", response_model=List[VenueRead])
def list_venues(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_venues(db, skip=skip, limit=limit)

@router.get("/{venue_id}", response_model=VenueRead)
def get_venue_by_id(venue_id: int, db: Session = Depends(get_db)):
    venue = get_venue(db, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return venue

@router.put("/{venue_id}", response_model=VenueRead)
def edit_venue(venue_id: int, venue_in: VenueUpdate, db: Session = Depends(get_db)):
    venue = get_venue(db, venue_id)
    if not venue:
        raise HTTPException(status_code=404, detail="Venue not found")
    return update_venue(db, venue, venue_in)

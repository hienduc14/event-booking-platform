from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.core.database import get_db
from app.api.dependencies import get_current_admin
from app.schemas.artist import ArtistCreate, ArtistRead, EventArtistCreate, EventArtistRead
from app.crud.artist import create_artist, get_artists, assign_artist_to_event_day

router = APIRouter(dependencies=[Depends(get_current_admin)])

@router.post("", response_model=ArtistRead)
def add_artist(artist: ArtistCreate, db: Session = Depends(get_db)):
    return create_artist(db, artist)

@router.get("", response_model=List[ArtistRead])
def list_artists(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return get_artists(db, skip=skip, limit=limit)

@router.post("/assign", response_model=EventArtistRead)
def assign_artist(assignment: EventArtistCreate, db: Session = Depends(get_db)):
    assigned = assign_artist_to_event_day(db, assignment)
    # We map artist_name from the relation for the Read schema
    return EventArtistRead(
        event_artist_id=assigned.event_artist_id,
        event_day_id=assigned.event_day_id,
        artist_id=assigned.artist_id,
        artist_name=assigned.artist.artist_name,
        is_backup=assigned.is_backup
    )

from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.artist import Artist
from app.models.event_artist import EventArtist
from app.schemas.artist import ArtistCreate, ArtistUpdate, EventArtistCreate


def create_artist(db: Session, obj_in: ArtistCreate) -> Artist:
    db_obj = Artist(**obj_in.model_dump(exclude={"bio", "image_url"}, exclude_none=True))
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_artist(db: Session, artist_id: int) -> Optional[Artist]:
    return db.query(Artist).filter(Artist.artist_id == artist_id).first()


def get_artists(db: Session, skip: int = 0, limit: int = 100) -> List[Artist]:
    return db.query(Artist).offset(skip).limit(limit).all()


def update_artist(db: Session, db_obj: Artist, obj_in: ArtistUpdate) -> Artist:
    update_data = obj_in.model_dump(exclude_unset=True, exclude={"bio", "image_url"})
    for field, value in update_data.items():
        setattr(db_obj, field, value)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def assign_artist_to_event_day(db: Session, obj_in: EventArtistCreate) -> EventArtist:
    db_obj = EventArtist(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_event_artists_by_day(db: Session, event_day_id: int) -> List[EventArtist]:
    return db.query(EventArtist).filter(EventArtist.event_day_id == event_day_id).all()

from typing import List
from app.schemas.event import EventCreate


def create_event(event_in: EventCreate) -> dict:
    # Placeholder for business logic, validation, and persistence
    return {"id": 1, **event_in.model_dump()}


def validate_event_backup_artists(artist_list: List[dict]) -> bool:
    backup_count = sum(1 for artist in artist_list if artist.get("is_backup"))
    return backup_count >= 2

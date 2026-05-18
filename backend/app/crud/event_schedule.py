from sqlalchemy.orm import Session
from typing import List, Optional
from app.models.event_schedule import EventSchedule
from app.schemas.schedule import EventScheduleCreate


def create_schedule(db: Session, obj_in: EventScheduleCreate) -> EventSchedule:
    db_obj = EventSchedule(**obj_in.model_dump())
    db.add(db_obj)
    db.commit()
    db.refresh(db_obj)
    return db_obj


def get_schedule(db: Session, schedule_id: int) -> Optional[EventSchedule]:
    return db.query(EventSchedule).filter(EventSchedule.schedule_id == schedule_id).first()


def get_schedules_by_event(db: Session, event_id: int) -> List[EventSchedule]:
    return db.query(EventSchedule).filter(EventSchedule.event_id == event_id).all()

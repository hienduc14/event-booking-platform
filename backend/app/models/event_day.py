from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class EventDay(Base):
    """A specific performance date within an EventSchedule."""
    __tablename__ = "event_days"

    event_day_id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("event_schedules.schedule_id", ondelete="CASCADE"), nullable=False, index=True)
    date = Column(DateTime(timezone=True), nullable=False)
    status = Column(String(50), nullable=False, default="ACTIVE")
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    schedule = relationship("EventSchedule", back_populates="event_days")
    event_artists = relationship("EventArtist", back_populates="event_day", cascade="all, delete-orphan")
    booking_details = relationship("BookingDetail", back_populates="event_day")

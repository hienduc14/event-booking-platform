from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class EventSchedule(Base):
    """Links an Event to a Venue. One event can be hosted at multiple venues."""
    __tablename__ = "event_schedules"

    schedule_id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.event_id", ondelete="CASCADE"), nullable=False, index=True)
    venue_id = Column(Integer, ForeignKey("venues.venue_id"), nullable=False, index=True)

    event = relationship("Event", back_populates="schedules")
    venue = relationship("Venue", back_populates="schedules")
    event_days = relationship("EventDay", back_populates="schedule", cascade="all, delete-orphan")
    ticket_configs = relationship("TicketConfig", back_populates="schedule", cascade="all, delete-orphan")
    bookings = relationship("Booking", back_populates="schedule")

    @property
    def status(self):
        return "ACTIVE"

    @property
    def created_at(self):
        return None

    @property
    def updated_at(self):
        return None

from sqlalchemy import Column, Integer, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class EventDay(Base):
    __tablename__ = "event_days"
    id = Column(Integer, primary_key=True, index=True)
    event_group_id = Column(Integer, ForeignKey("event_groups.id"), nullable=False)
    date = Column(Date, nullable=False)
    event_group = relationship("EventGroup", back_populates="event_days")
    tickets = relationship("Ticket", back_populates="event_day")
    artist_schedules = relationship("ArtistSchedule", back_populates="event_day")

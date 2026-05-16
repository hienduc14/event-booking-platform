from sqlalchemy import Column, Integer, ForeignKey, Numeric, String
from sqlalchemy.orm import relationship
from app.db.base import Base

class EventGroup(Base):
    __tablename__ = "event_groups"
    id = Column(Integer, primary_key=True, index=True)
    event_id = Column(Integer, ForeignKey("events.id"), nullable=False)
    venue_id = Column(Integer, ForeignKey("venues.id"), nullable=False)
    price_multiplier = Column(Numeric(5, 2), nullable=True)
    description = Column(String(512), nullable=True)
    event = relationship("Event", back_populates="event_groups")
    venue = relationship("Venue", back_populates="event_groups")
    event_days = relationship("EventDay", back_populates="event_group")

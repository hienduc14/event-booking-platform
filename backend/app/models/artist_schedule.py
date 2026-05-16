from sqlalchemy import Column, Integer, Boolean, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base

class ArtistSchedule(Base):
    __tablename__ = "artist_schedules"
    id = Column(Integer, primary_key=True, index=True)
    artist_id = Column(Integer, ForeignKey("artists.id"), nullable=False)
    event_day_id = Column(Integer, ForeignKey("event_days.id"), nullable=False)
    is_backup = Column(Boolean, default=False)
    artist = relationship("Artist", back_populates="schedules")
    event_day = relationship("EventDay", back_populates="artist_schedules")

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Boolean, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class EventArtist(Base):
    """Assigns an artist to a specific event day. Backup artists are tracked here."""
    __tablename__ = "event_artists"
    __table_args__ = (
        UniqueConstraint("event_day_id", "artist_id", name="uq_event_day_artist"),
    )

    event_artist_id = Column(Integer, primary_key=True, index=True)
    event_day_id = Column(Integer, ForeignKey("event_days.event_day_id", ondelete="CASCADE"), nullable=False, index=True)
    artist_id = Column(Integer, ForeignKey("artists.artist_id"), nullable=False, index=True)
    is_backup = Column(Boolean, nullable=False, default=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    event_day = relationship("EventDay", back_populates="event_artists")
    artist = relationship("Artist", back_populates="event_artists")

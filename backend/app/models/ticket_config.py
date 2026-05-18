from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Numeric, DateTime, ForeignKey, UniqueConstraint
from sqlalchemy.orm import relationship
from app.db.base import Base


class TicketConfig(Base):
    """Defines ticket types, prices and quantities for an EventSchedule.
    Price is fixed per venue (schedule), not per day."""
    __tablename__ = "ticket_configs"
    __table_args__ = (
        UniqueConstraint("schedule_id", "ticket_type", name="uq_schedule_ticket_type"),
    )

    config_id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("event_schedules.schedule_id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_type = Column(String(100), nullable=False)
    price = Column(Numeric(12, 2), nullable=False)
    max_quantity = Column(Integer, nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    schedule = relationship("EventSchedule", back_populates="ticket_configs")
    booking_details = relationship("BookingDetail", back_populates="ticket_config")

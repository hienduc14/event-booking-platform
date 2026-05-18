from datetime import datetime, timezone
from sqlalchemy import Column, Integer, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class BookingDetail(Base):
    """Line item in a booking: quantity of a specific ticket type for a specific day."""
    __tablename__ = "booking_details"

    booking_detail_id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id", ondelete="CASCADE"), nullable=False, index=True)
    config_id = Column(Integer, ForeignKey("ticket_configs.config_id"), nullable=False, index=True)
    event_day_id = Column(Integer, ForeignKey("event_days.event_day_id"), nullable=False, index=True)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Numeric(12, 2), nullable=False)
    subtotal = Column(Numeric(12, 2), nullable=False)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    booking = relationship("Booking", back_populates="booking_details")
    ticket_config = relationship("TicketConfig", back_populates="booking_details")
    event_day = relationship("EventDay", back_populates="booking_details")
    e_tickets = relationship("ETicket", back_populates="booking_detail", cascade="all, delete-orphan")

from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Numeric, Boolean, DateTime, ForeignKey
from sqlalchemy.dialects.postgresql import JSONB
from sqlalchemy.orm import relationship
from app.db.base import Base


class RefundTransaction(Base):
    """Records refund operations for cancelled events."""
    __tablename__ = "refund_transactions"

    refund_id = Column(Integer, primary_key=True, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id"), nullable=False, index=True)
    gateway_refund_id = Column(String(255), nullable=True)
    amount = Column(Numeric(12, 2), nullable=False)
    status = Column(String(50), nullable=False, default="PENDING")
    # Statuses: PENDING | PROCESSING | SUCCESS | FAILED
    reason = Column(Text, nullable=True)
    is_manual = Column(Boolean, nullable=False, default=False)
    raw_response = Column(JSONB, nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    booking = relationship("Booking", back_populates="refund_transactions")

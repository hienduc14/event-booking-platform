from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, Numeric, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class Booking(Base):
    """Customer booking order. Holds tickets in PENDING_PAYMENT state until paid."""
    __tablename__ = "bookings"

    booking_id = Column(Integer, primary_key=True, index=True)
    schedule_id = Column(Integer, ForeignKey("event_schedules.schedule_id"), nullable=False, index=True)

    # Customer info (no account required)
    customer_name = Column(String(255), nullable=False)
    phone = Column(String(50), nullable=False)
    email = Column(String(255), nullable=False)
    payment_account = Column(Text, nullable=False)  # bank account for refunds

    # Status
    booking_status = Column(String(50), nullable=False, default="PENDING_PAYMENT")
    # Booking statuses: PENDING_PAYMENT | PAID | PAYMENT_FAILED | CANCELLED | REFUNDING | REFUNDED | REFUND_FAILED

    total_amount = Column(Numeric(12, 2), nullable=False, default=0)
    expires_at = Column(DateTime(timezone=True), nullable=True)  # reservation expiry
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    schedule = relationship("EventSchedule", back_populates="bookings")
    booking_details = relationship("BookingDetail", back_populates="booking", cascade="all, delete-orphan")
    payment_transactions = relationship("PaymentTransaction", back_populates="booking")
    refund_transactions = relationship("RefundTransaction", back_populates="booking")

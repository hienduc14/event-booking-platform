from datetime import datetime, timezone
from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class ETicket(Base):
    """Electronic ticket issued after successful payment. One per seat purchased."""
    __tablename__ = "e_tickets"

    ticket_code = Column(String(255), primary_key=True, index=True)
    booking_detail_id = Column(Integer, ForeignKey("booking_details.booking_detail_id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_status = Column(String(50), nullable=False, default="VALID")
    # Ticket statuses: VALID | USED | CANCELLED | REFUNDED
    qr_code_url = Column(Text, nullable=True)
    issued_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    used_at = Column(DateTime(timezone=True), nullable=True)
    created_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at = Column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    booking_detail = relationship("BookingDetail", back_populates="e_tickets")

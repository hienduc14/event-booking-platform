from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class ETicket(Base):
    """Electronic ticket issued after successful payment. One per seat purchased."""
    __tablename__ = "e_tickets"

    ticket_code = Column(String(255), primary_key=True, index=True)
    booking_detail_id = Column(Integer, ForeignKey("booking_details.booking_detail_id", ondelete="CASCADE"), nullable=False, index=True)
    ticket_status = Column(String(50), nullable=False, default="VALID")

    booking_detail = relationship("BookingDetail", back_populates="e_tickets")

    @property
    def qr_code_url(self):
        return None

    @property
    def issued_at(self):
        return None

    @property
    def used_at(self):
        return None

    @property
    def created_at(self):
        return None

    @property
    def updated_at(self):
        return None

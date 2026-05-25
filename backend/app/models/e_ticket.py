from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.db.base import Base


class ETicket(Base):
    """Electronic ticket issued after successful payment. One per seat purchased."""
    __tablename__ = "e_tickets"

    ticket_id = Column(Integer, primary_key=True, index=True)
    ticket_config_id = Column(Integer, ForeignKey("ticket_configs.config_id", ondelete="CASCADE"), nullable=False, index=True)
    event_day_id = Column(Integer, ForeignKey("event_days.event_day_id", ondelete="CASCADE"), nullable=False, index=True)
    booking_id = Column(Integer, ForeignKey("bookings.booking_id", ondelete="SET NULL"), nullable=True, index=True)
    ticket_code = Column(String(255), nullable=True)
    ticket_status = Column(String(50), nullable=False, default="Available")
    row_label = Column(String(50), nullable=True)
    col_number = Column(Integer, nullable=True)

    ticket_config = relationship("TicketConfig", back_populates="e_tickets")
    event_day = relationship("EventDay", back_populates="e_tickets")
    booking = relationship("Booking", back_populates="e_tickets")

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

    @property
    def ticket_type(self):
        return self.ticket_config.ticket_type if self.ticket_config else None

    @property
    def price(self):
        return self.ticket_config.price if self.ticket_config else None

    @property
    def event_name(self):
        if self.event_day and self.event_day.schedule and self.event_day.schedule.event:
            return self.event_day.schedule.event.event_name
        return None

    @property
    def venue_name(self):
        if self.event_day and self.event_day.schedule and self.event_day.schedule.venue:
            return self.event_day.schedule.venue.venue_name
        return None

    @property
    def date(self):
        return self.event_day.date if self.event_day else None

    @property
    def customer_name(self):
        return self.booking.customer_name if self.booking else None

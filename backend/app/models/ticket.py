from sqlalchemy import Column, Integer, String, ForeignKey, Enum
from sqlalchemy.orm import relationship
from app.db.base import Base
import enum

class TicketType(str, enum.Enum):
    gold = "gold"
    silver = "silver"
    bronze = "bronze"
    plastic = "plastic"
    vip = "vip"

class Ticket(Base):
    __tablename__ = "tickets"
    id = Column(Integer, primary_key=True, index=True)
    code = Column(String(128), unique=True, nullable=False)
    type = Column(Enum(TicketType), nullable=False)
    event_day_id = Column(Integer, ForeignKey("event_days.id"), nullable=False)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=True)
    status = Column(String(64), nullable=False, default="reserved")
    customer_name = Column(String(255), nullable=True)
    customer_email = Column(String(255), nullable=True)
    customer_phone = Column(String(50), nullable=True)
    event_day = relationship("EventDay", back_populates="tickets")
    order = relationship("Order", back_populates="tickets")

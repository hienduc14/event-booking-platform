from sqlalchemy import Column, Integer, String, ForeignKey, Numeric, DateTime, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from app.db.base import Base

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_name = Column(String(255), nullable=False)
    customer_email = Column(String(255), nullable=False)
    customer_phone = Column(String(50), nullable=False)
    total_amount = Column(Numeric(12, 2), nullable=False)
    currency = Column(String(16), nullable=False, default="VND")
    payment_status = Column(String(64), nullable=False, default="pending")
    created_at = Column(DateTime, default=datetime.utcnow)
    cancelled = Column(Boolean, default=False)
    tickets = relationship("Ticket", back_populates="order")

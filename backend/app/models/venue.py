from sqlalchemy import Column, Integer, String, Text
from sqlalchemy.orm import relationship
from app.db.base import Base

class Venue(Base):
    __tablename__ = "venues"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False)
    city = Column(String(128), nullable=False)
    capacity = Column(Integer, nullable=False)
    address = Column(String(512), nullable=True)
    event_groups = relationship("EventGroup", back_populates="venue")

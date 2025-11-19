"""
Base model class.
Common fields and functionality shared across all models.
"""

from datetime import datetime
from sqlalchemy import Column, Integer, DateTime
from database.connection import Base

class BaseModel(Base):
    """
    Base model with common fields.
    All models should inherit from this class.
    """
    __abstract__ = True
    
    id = Column(Integer, primary_key=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)


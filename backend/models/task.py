"""
Task model.
Database model for tasks in the priority queue system.
"""

from sqlalchemy import Column, String, Integer, Boolean, Text, DateTime, CheckConstraint
from sqlalchemy.orm import relationship
from models.base import BaseModel
from datetime import datetime

class Task(BaseModel):
    """
    Task model representing items in the priority queue.
    Contains task information and priority metadata.
    """
    __tablename__ = "tasks"
    
    title = Column(String(200), nullable=False, index=True)
    description = Column(Text, nullable=True)
    urgency = Column(Integer, nullable=False, default=3)
    difficulty = Column(Integer, nullable=False, default=3)
    due_date = Column(DateTime, nullable=True)
    completed = Column(Boolean, nullable=False, default=False, index=True)
    
    # Relationships
    history = relationship("TaskHistory", back_populates="task", cascade="all, delete-orphan")
    
    # Constraints
    __table_args__ = (
        CheckConstraint('urgency >= 1 AND urgency <= 5', name='check_urgency_range'),
        CheckConstraint('difficulty >= 1 AND difficulty <= 5', name='check_difficulty_range'),
    )
    
    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', urgency={self.urgency}, difficulty={self.difficulty}, completed={self.completed})>"


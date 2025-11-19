"""
TaskHistory model.
Database model for tracking task completion history.
"""

from sqlalchemy import Column, Integer, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from models.base import BaseModel
from datetime import datetime

class TaskHistory(BaseModel):
    """
    TaskHistory model for tracking when tasks were completed.
    Maintains a historical record of task completions.
    """
    __tablename__ = "task_history"
    
    task_id = Column(Integer, ForeignKey("tasks.id", ondelete="CASCADE"), nullable=False, index=True)
    completed_at = Column(DateTime, nullable=False, default=datetime.utcnow)
    
    # Relationships
    task = relationship("Task", back_populates="history")
    
    def __repr__(self):
        return f"<TaskHistory(id={self.id}, task_id={self.task_id}, completed_at={self.completed_at})>"


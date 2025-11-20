"""
API request/response schemas.
Pydantic models for API validation and serialization.
"""

from pydantic import BaseModel, Field, field_validator
from datetime import datetime
from typing import Optional, List

class TaskBase(BaseModel):
    """Base task schema with common fields."""
    title: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = None
    urgency: int = Field(default=3, ge=1, le=5, description="Urgency level from 1-5")
    difficulty: int = Field(default=3, ge=1, le=5, description="Difficulty level from 1-5")
    due_date: Optional[datetime] = None
    completed: bool = Field(default=False, description="Task completion status")
    
    @field_validator('urgency', 'difficulty')
    @classmethod
    def validate_rating(cls, v):
        """Validate rating is between 1 and 5."""
        if not 1 <= v <= 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class TaskCreate(TaskBase):
    """Schema for creating a new task."""
    pass

class TaskUpdate(BaseModel):
    """Schema for updating a task."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = None
    urgency: Optional[int] = Field(None, ge=1, le=5, description="Urgency level from 1-5")
    difficulty: Optional[int] = Field(None, ge=1, le=5, description="Difficulty level from 1-5")
    due_date: Optional[datetime] = None
    completed: Optional[bool] = None
    
    @field_validator('urgency', 'difficulty')
    @classmethod
    def validate_rating(cls, v):
        """Validate rating is between 1 and 5 if provided."""
        if v is not None and not 1 <= v <= 5:
            raise ValueError('Rating must be between 1 and 5')
        return v

class TaskResponse(TaskBase):
    """Schema for task response."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TaskHistoryBase(BaseModel):
    """Base task history schema."""
    task_id: int
    completed_at: datetime

class TaskHistoryCreate(BaseModel):
    """Schema for creating task history."""
    task_id: int
    completed_at: Optional[datetime] = Field(default_factory=datetime.utcnow)

class TaskHistoryResponse(TaskHistoryBase):
    """Schema for task history response."""
    id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class TaskWithHistory(TaskResponse):
    """Schema for task with history."""
    history: List[TaskHistoryResponse] = []
    
    class Config:
        from_attributes = True

class ChatMessage(BaseModel):
    """Schema for chat message."""
    message: str = Field(..., min_length=1, max_length=1000, description="User message to the AI assistant")

class ChatResponse(BaseModel):
    """Schema for chat response."""
    response: str = Field(..., description="AI assistant's response")

class TaskActionRequest(BaseModel):
    """Schema for task action requests (create/complete)."""
    task_title: Optional[str] = Field(None, description="Title of the task")


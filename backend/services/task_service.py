"""
Task service.
Business logic for task management operations.
"""

from typing import List, Optional
from sqlalchemy.orm import Session
from models.task import Task
from priority_queue.engine import PriorityQueueEngine
from priority_queue.algorithms import DefaultPriorityAlgorithm

class TaskService:
    """
    Service for task-related business logic.
    Handles CRUD operations and priority calculations.
    """
    
    def __init__(self, db: Session):
        """
        Initialize task service.
        
        Args:
            db: Database session
        """
        self.db = db
        self.priority_engine = PriorityQueueEngine()
    
    def create_task(self, task_data: dict) -> Task:
        """
        Create a new task.
        
        Args:
            task_data: Task data dictionary
            
        Returns:
            Created task
        """
        task = Task(**task_data)
        
        # Calculate initial priority
        task.priority_score = DefaultPriorityAlgorithm.calculate_priority(task)
        
        self.db.add(task)
        self.db.commit()
        self.db.refresh(task)
        
        return task
    
    def get_task(self, task_id: int) -> Optional[Task]:
        """
        Get a task by ID.
        
        Args:
            task_id: Task ID
            
        Returns:
            Task if found, None otherwise
        """
        return self.db.query(Task).filter(Task.id == task_id).first()
    
    def get_all_tasks(self) -> List[Task]:
        """
        Get all tasks.
        
        Returns:
            List of all tasks
        """
        return self.db.query(Task).all()
    
    def update_task(self, task_id: int, task_data: dict) -> Optional[Task]:
        """
        Update a task.
        
        Args:
            task_id: Task ID
            task_data: Updated task data
            
        Returns:
            Updated task if found, None otherwise
        """
        task = self.get_task(task_id)
        if not task:
            return None
        
        # Update fields
        for key, value in task_data.items():
            setattr(task, key, value)
        
        # Recalculate priority if relevant fields changed
        if any(key in task_data for key in ["is_urgent", "is_important", "due_date"]):
            task.priority_score = DefaultPriorityAlgorithm.calculate_priority(task)
        
        self.db.commit()
        self.db.refresh(task)
        
        return task
    
    def delete_task(self, task_id: int) -> bool:
        """
        Delete a task.
        
        Args:
            task_id: Task ID
            
        Returns:
            True if deleted, False if not found
        """
        task = self.get_task(task_id)
        if not task:
            return False
        
        self.db.delete(task)
        self.db.commit()
        
        return True
    
    def reprioritize_all(self, algorithm: str = "default") -> List[Task]:
        """
        Reprioritize all tasks using the specified algorithm.
        
        Args:
            algorithm: Algorithm name to use
            
        Returns:
            List of tasks sorted by new priority
        """
        tasks = self.get_all_tasks()
        DefaultPriorityAlgorithm.apply_to_tasks(tasks)
        
        self.db.commit()
        
        # Sort by priority
        tasks.sort(key=lambda x: x.priority_score, reverse=True)
        
        return tasks


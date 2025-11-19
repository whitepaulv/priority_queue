"""
Priority queue engine.
Main engine for managing and processing priority queue operations.
"""

from typing import List, Optional
from models.task import Task

class PriorityQueueEngine:
    """
    Core priority queue engine.
    Handles task prioritization, queue management, and algorithm execution.
    """
    
    def __init__(self, algorithm: Optional[str] = "default"):
        """
        Initialize the priority queue engine.
        
        Args:
            algorithm: Algorithm name to use for prioritization
        """
        self.algorithm = algorithm
        self.queue = []
    
    def add_task(self, task: Task) -> None:
        """Add a task to the priority queue."""
        self.queue.append(task)
        self._reorder()
    
    def remove_task(self, task_id: int) -> Optional[Task]:
        """Remove a task from the priority queue by ID."""
        for i, task in enumerate(self.queue):
            if task.id == task_id:
                return self.queue.pop(i)
        return None
    
    def get_next_task(self) -> Optional[Task]:
        """Get the highest priority task without removing it."""
        return self.queue[0] if self.queue else None
    
    def pop_next_task(self) -> Optional[Task]:
        """Get and remove the highest priority task."""
        return self.queue.pop(0) if self.queue else None
    
    def reprioritize_all(self, tasks: List[Task]) -> List[Task]:
        """
        Reprioritize all tasks using the selected algorithm.
        
        Args:
            tasks: List of tasks to reprioritize
            
        Returns:
            List of tasks sorted by priority
        """
        self.queue = tasks
        self._reorder()
        return self.queue
    
    def _reorder(self) -> None:
        """Internal method to reorder the queue based on priority."""
        self.queue.sort(key=lambda x: x.priority_score, reverse=True)
    
    def get_queue_state(self) -> dict:
        """Get current state of the priority queue."""
        return {
            "algorithm": self.algorithm,
            "queue_size": len(self.queue),
            "tasks": [{"id": t.id, "title": t.title, "priority": t.priority_score} 
                     for t in self.queue]
        }


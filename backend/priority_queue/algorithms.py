"""
Priority queue algorithms.
Various algorithms for calculating task priorities.
"""

from typing import List
from models.task import Task
from datetime import datetime, timedelta

class PriorityAlgorithm:
    """
    Base class for priority calculation algorithms.
    Subclasses should implement calculate_priority method.
    """
    
    @staticmethod
    def calculate_priority(task: Task) -> float:
        """
        Calculate priority score for a task.
        
        Args:
            task: Task to calculate priority for
            
        Returns:
            Priority score (higher = more priority)
        """
        raise NotImplementedError("Subclasses must implement calculate_priority")
    
    @staticmethod
    def apply_to_tasks(tasks: List[Task]) -> List[Task]:
        """
        Apply priority calculation to a list of tasks.
        
        Args:
            tasks: List of tasks to prioritize
            
        Returns:
            List of tasks with updated priority scores
        """
        for task in tasks:
            task.priority_score = PriorityAlgorithm.calculate_priority(task)
        return tasks

class DefaultPriorityAlgorithm(PriorityAlgorithm):
    """
    Default priority algorithm.
    Simple algorithm based on urgency and difficulty.
    """
    
    @staticmethod
    def calculate_priority(task: Task) -> float:
        """Calculate priority using urgency and difficulty."""
        # Simple weighted calculation: urgency * 0.6 + difficulty * 0.4
        # Scale to 0-100 range
        urgency_score = (task.urgency / 5.0) * 60.0
        difficulty_score = (task.difficulty / 5.0) * 40.0
        base_score = urgency_score + difficulty_score
        
        return base_score

class EisenhowerMatrixAlgorithm(PriorityAlgorithm):
    """
    Eisenhower Matrix priority algorithm.
    Prioritizes based on urgency and importance quadrants.
    """
    
    @staticmethod
    def calculate_priority(task: Task) -> float:
        """
        Calculate priority using Eisenhower Matrix.
        Quadrant 1 (Urgent + Important): Highest priority
        Quadrant 2 (Not Urgent + Important): High priority
        Quadrant 3 (Urgent + Not Important): Medium priority
        Quadrant 4 (Not Urgent + Not Important): Low priority
        """
        if task.is_urgent and task.is_important:
            return 100.0  # Do first
        elif not task.is_urgent and task.is_important:
            return 75.0   # Schedule
        elif task.is_urgent and not task.is_important:
            return 50.0   # Delegate
        else:
            return 25.0   # Eliminate

class TimeDecayAlgorithm(PriorityAlgorithm):
    """
    Time-decay priority algorithm.
    Priority increases as due date approaches.
    """
    
    @staticmethod
    def calculate_priority(task: Task) -> float:
        """Calculate priority with time decay factor."""
        base_score = 50.0
        
        if task.due_date:
            time_remaining = (task.due_date - datetime.utcnow()).total_seconds()
            days_remaining = time_remaining / 86400  # Convert to days
            
            if days_remaining < 0:
                # Overdue: exponential increase
                base_score += 50.0 * abs(days_remaining)
            elif days_remaining <= 1:
                base_score += 40.0
            elif days_remaining <= 7:
                base_score += 30.0 / days_remaining
            else:
                base_score += 10.0
        
        # Adjust for importance
        if task.is_important:
            base_score *= 1.5
        
        return base_score


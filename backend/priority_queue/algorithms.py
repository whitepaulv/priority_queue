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
    Simple algorithm based on urgency and importance.
    """
    
    @staticmethod
    def calculate_priority(task: Task) -> float:
        """Calculate priority using urgency and importance."""
        base_score = 0.0
        
        # Urgency multiplier
        if task.is_urgent:
            base_score += 50.0
        
        # Importance multiplier
        if task.is_important:
            base_score += 30.0
        
        # Due date factor
        if task.due_date:
            days_until_due = (task.due_date - datetime.utcnow()).days
            if days_until_due < 0:
                base_score += 100.0  # Overdue tasks
            elif days_until_due <= 1:
                base_score += 40.0
            elif days_until_due <= 3:
                base_score += 20.0
        
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


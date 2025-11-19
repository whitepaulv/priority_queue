"""
Priority queue engine tests.
Tests for priority queue algorithms and engine functionality.
"""

import pytest
from datetime import datetime, timedelta
from priority_queue.engine import PriorityQueueEngine
from priority_queue.algorithms import (
    DefaultPriorityAlgorithm,
    EisenhowerMatrixAlgorithm,
    TimeDecayAlgorithm
)
from models.task import Task

def test_default_algorithm():
    """Test default priority algorithm."""
    task = Task(
        title="Test Task",
        is_urgent=True,
        is_important=True
    )
    score = DefaultPriorityAlgorithm.calculate_priority(task)
    assert score > 0

def test_eisenhower_algorithm():
    """Test Eisenhower Matrix algorithm."""
    # Urgent + Important
    task = Task(title="Task 1", is_urgent=True, is_important=True)
    score = EisenhowerMatrixAlgorithm.calculate_priority(task)
    assert score == 100.0

def test_priority_engine():
    """Test priority queue engine operations."""
    engine = PriorityQueueEngine()
    assert engine.queue == []
    
    # Test add_task, get_next_task, etc.
    # Add test implementations as needed


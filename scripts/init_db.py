#!/usr/bin/env python3
"""
Database initialization script.
Creates database tables and optionally seeds with initial data.
"""

import sys
import os

# Add backend directory to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..', 'backend'))

from database.connection import init_db
from models.task import Task
from database.session import SessionLocal
from datetime import datetime, timedelta

def init_database():
    """Initialize database with tables."""
    print("Initializing database...")
    init_db()
    print("Database initialized successfully!")

def seed_sample_data():
    """Seed database with sample tasks."""
    db = SessionLocal()
    try:
        # Check if tasks already exist
        existing_tasks = db.query(Task).count()
        if existing_tasks > 0:
            print(f"Database already contains {existing_tasks} tasks. Skipping seed.")
            return
        
        # Create sample tasks
        sample_tasks = [
            Task(
                title="Setup PriorityForge project",
                description="Initialize the project structure",
                is_urgent=True,
                is_important=True,
                due_date=datetime.utcnow() + timedelta(days=1)
            ),
            Task(
                title="Implement priority algorithms",
                description="Add custom priority queue algorithms",
                is_urgent=False,
                is_important=True,
                due_date=datetime.utcnow() + timedelta(days=7)
            ),
            Task(
                title="Write documentation",
                description="Create comprehensive documentation",
                is_urgent=False,
                is_important=False,
                due_date=datetime.utcnow() + timedelta(days=14)
            ),
        ]
        
        for task in sample_tasks:
            db.add(task)
        
        db.commit()
        print(f"Seeded {len(sample_tasks)} sample tasks.")
    except Exception as e:
        print(f"Error seeding data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_database()
    
    # Uncomment to seed sample data
    # seed_sample_data()


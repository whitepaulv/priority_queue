"""
Database connection configuration.
SQLAlchemy engine setup and connection string management.
"""

from sqlalchemy import create_engine
from sqlalchemy.ext.declarative import declarative_base
import os

# SQLite database path
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./priority_forge.db")

# Create SQLAlchemy engine
engine = create_engine(
    DATABASE_URL,
    connect_args={"check_same_thread": False}  # Required for SQLite
)

# Base class for declarative models
Base = declarative_base()

def init_db():
    """Initialize database tables."""
    from models import task, task_history  # Import all models
    Base.metadata.create_all(bind=engine)


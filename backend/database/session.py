"""
Database session management.
Session creation and lifecycle management for database operations.
"""

from sqlalchemy.orm import sessionmaker
from database.connection import engine

# Session factory
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def get_db():
    """
    Database session generator.
    Yields a database session and ensures proper cleanup.
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


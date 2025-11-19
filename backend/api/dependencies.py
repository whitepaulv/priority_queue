"""
API dependencies.
Shared dependencies for dependency injection (database sessions, auth, etc.).
"""

from database.session import get_db
from sqlalchemy.orm import Session

def get_database_session():
    """Dependency for database session injection."""
    db = next(get_db())
    try:
        yield db
    finally:
        db.close()


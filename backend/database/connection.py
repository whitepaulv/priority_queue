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
    migrate_schema()

def migrate_schema():
    """Migrate database schema to match current models."""
    from sqlalchemy import inspect, text, MetaData
    
    with engine.connect() as conn:
        inspector = inspect(engine)
        tables = inspector.get_table_names()
        
        if 'tasks' in tables:
            # Check if due_date column exists and if estimated_time needs to be removed
            columns = [col['name'] for col in inspector.get_columns('tasks')]
            has_estimated_time = 'estimated_time' in columns
            has_due_date = 'due_date' in columns
            
            # If estimated_time exists or due_date doesn't exist, we need to recreate
            if has_estimated_time or not has_due_date:
                try:
                    # SQLite doesn't support DROP COLUMN, so we recreate the table
                    print("Migrating tasks table schema...")
                    
                    # Create new table with correct schema
                    conn.execute(text("""
                        CREATE TABLE tasks_new (
                            id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                            title VARCHAR(200) NOT NULL,
                            description TEXT,
                            urgency INTEGER NOT NULL DEFAULT 3,
                            difficulty INTEGER NOT NULL DEFAULT 3,
                            due_date DATETIME,
                            completed BOOLEAN NOT NULL DEFAULT 0,
                            created_at DATETIME NOT NULL,
                            updated_at DATETIME,
                            CHECK (urgency >= 1 AND urgency <= 5),
                            CHECK (difficulty >= 1 AND difficulty <= 5)
                        )
                    """))
                    
                    # Copy data (excluding estimated_time, handling due_date)
                    conn.execute(text("""
                        INSERT INTO tasks_new (id, title, description, urgency, difficulty, due_date, completed, created_at, updated_at)
                        SELECT id, title, description, urgency, difficulty, NULL as due_date, completed, created_at, updated_at
                        FROM tasks
                    """))
                    
                    # Drop old table and rename new one
                    conn.execute(text("DROP TABLE tasks"))
                    conn.execute(text("ALTER TABLE tasks_new RENAME TO tasks"))
                    
                    # Recreate indexes
                    conn.execute(text("CREATE INDEX ix_tasks_title ON tasks (title)"))
                    conn.execute(text("CREATE INDEX ix_tasks_completed ON tasks (completed)"))
                    
                    conn.commit()
                    print("Successfully migrated tasks table")
                except Exception as e:
                    print(f"Error migrating schema: {e}")
                    conn.rollback()
            elif not has_due_date:
                # Just add due_date column
                try:
                    conn.execute(text("ALTER TABLE tasks ADD COLUMN due_date DATETIME"))
                    conn.commit()
                    print("Added due_date column to tasks table")
                except Exception as e:
                    print(f"Error adding due_date column: {e}")
                    conn.rollback()


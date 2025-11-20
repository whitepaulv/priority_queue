"""
FastAPI application entry point.
Main application setup, middleware configuration, and route registration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router
from database.connection import init_db
import os
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

app = FastAPI(
    title="PriorityForge API",
    description="API for PriorityForge task management system",
    version="1.0.0"
)

# Initialize database on startup if tables don't exist
@app.on_event("startup")
def startup_event():
    """Initialize database tables on application startup."""
    db_path = os.getenv("DATABASE_URL", "sqlite:///./priority_forge.db").replace("sqlite:///", "")
    if not os.path.exists(db_path) or os.path.getsize(db_path) == 0:
        print("Initializing database...")
        init_db()
        print("Database initialized successfully!")
    else:
        # Try to initialize anyway to ensure tables exist
        try:
            init_db()
        except Exception:
            pass  # Tables already exist

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174"],  # Vite default ports
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include API routes
app.include_router(router, prefix="/api", tags=["tasks"])

@app.get("/")
def read_root():
    """Health check endpoint."""
    return {"message": "PriorityForge API is running"}

@app.get("/health")
def health_check():
    """Detailed health check endpoint."""
    return {"status": "healthy"}


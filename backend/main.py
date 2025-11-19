"""
FastAPI application entry point.
Main application setup, middleware configuration, and route registration.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from api.routes import router

app = FastAPI(
    title="PriorityForge API",
    description="API for PriorityForge task management system",
    version="1.0.0"
)

# CORS middleware configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # Vite default port
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


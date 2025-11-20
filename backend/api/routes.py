"""
API route definitions.
RESTful endpoints for task management and priority queue operations.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from api.schemas import TaskCreate, TaskResponse, TaskUpdate
from api.dependencies import get_database_session
from services.task_service import TaskService

router = APIRouter()

@router.get("/tasks", response_model=dict)
def get_tasks(db: Session = Depends(get_database_session)):
    """Get all tasks."""
    try:
        service = TaskService(db)
        tasks = service.get_all_tasks()
        return {"tasks": [TaskResponse.model_validate(task).model_dump() for task in tasks]}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks", response_model=TaskResponse, status_code=201)
def create_task(task: TaskCreate, db: Session = Depends(get_database_session)):
    """Create a new task."""
    try:
        service = TaskService(db)
        task_data = task.model_dump(exclude_unset=True)
        created_task = service.create_task(task_data)
        db.refresh(created_task)
        return TaskResponse.model_validate(created_task)
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/tasks/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, db: Session = Depends(get_database_session)):
    """Get a specific task by ID."""
    try:
        service = TaskService(db)
        task = service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        return TaskResponse.model_validate(task)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.put("/tasks/{task_id}", response_model=TaskResponse)
def update_task(task_id: int, task_update: TaskUpdate, db: Session = Depends(get_database_session)):
    """Update a task."""
    try:
        service = TaskService(db)
        task_data = task_update.model_dump(exclude_unset=True)
        updated_task = service.update_task(task_id, task_data)
        if not updated_task:
            raise HTTPException(status_code=404, detail="Task not found")
        db.refresh(updated_task)
        return TaskResponse.model_validate(updated_task)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete("/tasks/{task_id}")
def delete_task(task_id: int, db: Session = Depends(get_database_session)):
    """Delete a task."""
    try:
        service = TaskService(db)
        success = service.delete_task(task_id)
        if not success:
            raise HTTPException(status_code=404, detail="Task not found")
        return {"message": "Task deleted successfully"}
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/tasks/{task_id}/complete", response_model=TaskResponse)
def toggle_task_complete(task_id: int, db: Session = Depends(get_database_session)):
    """Toggle task completion status."""
    try:
        service = TaskService(db)
        task = service.get_task(task_id)
        if not task:
            raise HTTPException(status_code=404, detail="Task not found")
        
        task.completed = not task.completed
        db.commit()
        db.refresh(task)
        return TaskResponse.model_validate(task)
    except HTTPException:
        raise
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/tasks/prioritize")
def prioritize_tasks():
    """Reprioritize all tasks using the priority queue engine."""
    return {"message": "Prioritization not yet implemented"}


"""
API route definitions.
RESTful endpoints for task management and priority queue operations.
"""

from fastapi import APIRouter, Depends, HTTPException
from typing import List
from sqlalchemy.orm import Session
from api.schemas import TaskCreate, TaskResponse, TaskUpdate, ChatMessage, ChatResponse, TaskActionRequest
from api.dependencies import get_database_session
from services.task_service import TaskService
from services.ai_service import AIService

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

@router.post("/assistant/chat", response_model=ChatResponse)
def chat_with_assistant(chat_msg: ChatMessage, db: Session = Depends(get_database_session)):
    """Chat with the AI assistant."""
    try:
        # Get current tasks for context
        task_service = TaskService(db)
        tasks = task_service.get_all_tasks()
        
        # Initialize AI service and get response
        ai_service = AIService()
        response_text = ai_service.chat(chat_msg.message, tasks)
        
        return ChatResponse(response=response_text)
    except ValueError as e:
        # API key not configured
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail="AI assistant is not configured. Please add GEMINI_API_KEY to your .env file and restart the server.")
    except Exception as e:
        import traceback
        error_trace = traceback.format_exc()
        print(f"Error in chat endpoint:\n{error_trace}")
        # Return the error message from the AI service (which already handles it)
        # If it's a different error, provide details
        error_msg = str(e)
        raise HTTPException(status_code=500, detail=f"Error: {error_msg}")

@router.post("/assistant/on-task-created", response_model=ChatResponse)
def on_task_created(request: TaskActionRequest = TaskActionRequest(task_title=None), db: Session = Depends(get_database_session)):
    """Get an encouraging message when a task is created."""
    try:
        ai_service = AIService()
        response_text = ai_service.get_motivational_message(request.task_title)
        return ChatResponse(response=response_text)
    except ValueError as e:
        # API key not configured - return default message
        return ChatResponse(response="Great! You're making progress.")
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Return default message on error
        return ChatResponse(response="Great! Keep up the good work!")

@router.post("/assistant/on-task-completed", response_model=ChatResponse)
def on_task_completed(request: TaskActionRequest = TaskActionRequest(task_title=None), db: Session = Depends(get_database_session)):
    """Get a congratulatory message when a task is completed."""
    try:
        ai_service = AIService()
        task_title = request.task_title
        # Use a different prompt for completion
        if task_title:
            prompt = f"""Generate a short, congratulatory message for someone who just completed a task called '{task_title}'. 
Tone: Lighthearted, happy, encouraging.
Length: Short and to the point (1-2 sentences max).
Format: No emojis. Use exclamation points after each sentence (unless the sentence is a question).
Style: Encouraging.
Content: 100% focused on the task '{task_title}'. Nothing else should be mentioned.
Example: "Woohoo! {task_title} is complete! Well done!" """
        else:
            prompt = """Generate a short, congratulatory message for someone who just completed a task. 
Tone: Lighthearted, happy, encouraging.
Length: Short and to the point (1-2 sentences max).
Format: No emojis. Use exclamation points after each sentence (unless the sentence is a question).
Style: Encouraging.
Content: 100% focused on the task. Nothing else should be mentioned."""
        
        response = ai_service.model.generate_content(prompt)
        response_text = response.text.strip() if response and response.text else f"Woohoo! {task_title if task_title else 'Your task'} is complete! Well done!"
        return ChatResponse(response=response_text)
    except ValueError as e:
        # API key not configured - return default message
        return ChatResponse(response=f"Woohoo! {task_title if task_title else 'Your task'} is complete! Well done!")
    except Exception as e:
        import traceback
        traceback.print_exc()
        # Return default message on error
        return ChatResponse(response=f"Woohoo! {task_title if task_title else 'Your task'} is complete! Well done!")


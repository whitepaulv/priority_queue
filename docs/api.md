# API Documentation

## Base URL
```
http://localhost:8000
```

## Endpoints

### Health Check
- `GET /` - Root endpoint
- `GET /health` - Health check endpoint

### Tasks
- `GET /tasks` - Get all tasks
- `POST /tasks` - Create a new task
- `GET /tasks/{task_id}` - Get a specific task
- `PUT /tasks/{task_id}` - Update a task
- `DELETE /tasks/{task_id}` - Delete a task
- `POST /tasks/prioritize` - Reprioritize all tasks

## Request/Response Examples

### Create Task
```json
POST /tasks
{
  "title": "Complete project",
  "description": "Finish the PriorityForge project",
  "is_urgent": true,
  "is_important": true,
  "due_date": "2024-12-31T23:59:59"
}
```

### Task Response
```json
{
  "id": 1,
  "title": "Complete project",
  "priority_score": 80.0,
  "status": "pending",
  "created_at": "2024-01-01T00:00:00"
}
```


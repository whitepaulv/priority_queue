/**
 * Main React application component.
 * Root component that contains the application layout and routing.
 */

import { useState, useEffect } from 'react'
import './App.css'

function App() {
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [editingTaskId, setEditingTaskId] = useState(null)
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    urgency: 3,
    difficulty: 3,
    days_until_due: null
  })
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    urgency: 3,
    difficulty: 3,
    days_until_due: null
  })

  // Fetch tasks from API
  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = () => {
    fetch('/api/tasks')
      .then(res => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        const tasksList = Array.isArray(data) ? data : (data.tasks || [])
        setTasks(tasksList)
        setError(null)
      })
      .catch(err => {
        console.error('Error fetching tasks:', err)
        setError(err.message)
        setTasks([])
      })
      .finally(() => {
        setLoading(false)
      })
  }

  const handleCreateTask = async (e) => {
    e.preventDefault()
    
    try {
      // Convert days until due to actual date
      const taskData = {
        title: newTask.title,
        description: newTask.description,
        urgency: newTask.urgency,
        difficulty: newTask.difficulty,
        due_date: calculateDateFromDays(newTask.days_until_due)
      }
      
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error(`Failed to create task: ${response.status}`)
      }

      // Close form and reset
      setShowCreateForm(false)
      setNewTask({ title: '', description: '', urgency: 3, difficulty: 3, days_until_due: null })
      
      // Refresh tasks list
      fetchTasks()
    } catch (err) {
      console.error('Error creating task:', err)
      setError(err.message)
    }
  }

  const handleEditTask = (task) => {
    setEditingTaskId(task.id)
    // Calculate days until due from the task's due_date
    let daysUntilDue = null
    if (task.due_date) {
      // Parse date and normalize both to midnight local time
      const dueDate = new Date(task.due_date)
      dueDate.setHours(0, 0, 0, 0)
      
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      const diffTime = dueDate - today
      daysUntilDue = Math.round(diffTime / (1000 * 60 * 60 * 24))
    }
    setEditTask({
      title: task.title,
      description: task.description || '',
      urgency: task.urgency,
      difficulty: task.difficulty,
      days_until_due: daysUntilDue
    })
  }

  const handleUpdateTask = async (e, taskId) => {
    e.preventDefault()
    
    try {
      // Convert days until due to actual date
      const taskData = {
        title: editTask.title,
        description: editTask.description,
        urgency: editTask.urgency,
        difficulty: editTask.difficulty,
        due_date: calculateDateFromDays(editTask.days_until_due)
      }
      
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(taskData),
      })

      if (!response.ok) {
        throw new Error(`Failed to update task: ${response.status}`)
      }

      setEditingTaskId(null)
      fetchTasks()
    } catch (err) {
      console.error('Error updating task:', err)
      setError(err.message)
    }
  }

  const handleDeleteTask = async (taskId) => {
    if (!confirm('deleteTask?')) {
      return
    }

    try {
      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error(`Failed to delete task: ${response.status}`)
      }

      fetchTasks()
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err.message)
    }
  }

  const handleToggleComplete = async (taskId) => {
    try {
      const response = await fetch(`/api/tasks/${taskId}/complete`, {
        method: 'PATCH',
      })

      if (!response.ok) {
        throw new Error(`Failed to toggle task: ${response.status}`)
      }

      fetchTasks()
    } catch (err) {
      console.error('Error toggling task:', err)
      setError(err.message)
    }
  }

  const cancelEdit = () => {
    setEditingTaskId(null)
    setEditTask({ title: '', description: '', urgency: 3, difficulty: 3, days_until_due: null })
  }

  const formatDueDate = (dateString) => {
    if (!dateString) return null
    
    // Parse date and normalize to midnight local time for consistent comparison
    const date = new Date(dateString)
    date.setHours(0, 0, 0, 0)
    
    const now = new Date()
    now.setHours(0, 0, 0, 0)
    
    const diffTime = date - now
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays < 0) {
      return `${Math.abs(diffDays)}dOverdue`
    } else if (diffDays === 0) {
      return 'today'
    } else if (diffDays === 1) {
      return 'tomorrow'
    } else if (diffDays <= 7) {
      return `${diffDays}d`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  }

  const calculateDateFromDays = (days) => {
    if (days === null || days === undefined || days === '') return null
    const numDays = parseInt(days)
    if (isNaN(numDays)) return null
    
    // Create date at midnight local time to avoid timezone issues
    const date = new Date()
    date.setHours(0, 0, 0, 0) // Set to midnight local time
    date.setDate(date.getDate() + numDays)
    
    // Format as YYYY-MM-DD to store as date-only (no time component)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}T00:00:00`
  }

  const formatDatePreview = (days) => {
    if (days === null || days === undefined || days === '') return ''
    const numDays = parseInt(days)
    if (isNaN(numDays)) return ''
    
    // Calculate date at midnight local time
    const date = new Date()
    date.setHours(0, 0, 0, 0)
    date.setDate(date.getDate() + numDays)
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    const year = String(date.getFullYear()).slice(-2)
    return `${month}/${day}/${year}`
  }

  const getPriorityColor = (urgency, difficulty) => {
    const score = urgency * 0.6 + difficulty * 0.4
    // Subtle opacity-based priority indicator
    if (score >= 4.5) return 'rgba(255, 255, 255, 0.16)'
    if (score >= 3.5) return 'rgba(255, 255, 255, 0.12)'
    if (score >= 2.5) return 'rgba(255, 255, 255, 0.08)'
    return 'rgba(255, 255, 255, 0.04)'
  }

  return (
    <div className="App">
      <header className="App-header">
        <div className="header-content">
          <h1>priorityForge</h1>
          <p className="subtitle">taskManagement</p>
        </div>
      </header>

      <main className="main-content">
        <div className="main-layout">
          <div className="container">
            <div className="tasks-section">
          <div className="section-header">
            <h2>tasks</h2>
            <button 
              className="btn btn-primary" 
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? 'cancel' : '+new'}
            </button>
          </div>

            {showCreateForm && (
              <div className="create-task-form">
                <h3>newTask</h3>
                <form onSubmit={handleCreateTask}>
                  <div className="form-group">
                    <label htmlFor="title">title</label>
                    <input
                      type="text"
                      id="title"
                      value={newTask.title}
                      onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
                      required
                      placeholder="taskTitle"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">description</label>
                    <textarea
                      id="description"
                      value={newTask.description}
                      onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
                      placeholder="optionalDescription"
                      rows="3"
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group">
                      <label htmlFor="urgency">urgency (1-5)</label>
                      <input
                        type="range"
                        id="urgency"
                        min="1"
                        max="5"
                        value={newTask.urgency}
                        onChange={(e) => setNewTask({ ...newTask, urgency: parseInt(e.target.value) })}
                      />
                      <div className="range-value mono">{newTask.urgency}</div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="difficulty">difficulty (1-5)</label>
                      <input
                        type="range"
                        id="difficulty"
                        min="1"
                        max="5"
                        value={newTask.difficulty}
                        onChange={(e) => setNewTask({ ...newTask, difficulty: parseInt(e.target.value) })}
                      />
                      <div className="range-value mono">{newTask.difficulty}</div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="days_until_due">daysUntilDue</label>
                      <div className="date-input-wrapper">
                        <input
                          type="number"
                          id="days_until_due"
                          min="0"
                          value={newTask.days_until_due !== null ? newTask.days_until_due : ''}
                          onChange={(e) => setNewTask({ ...newTask, days_until_due: e.target.value === '' ? null : parseInt(e.target.value) })}
                          placeholder="0"
                        />
                        {newTask.days_until_due !== null && newTask.days_until_due !== '' && (
                          <span className="date-preview">{formatDatePreview(newTask.days_until_due)}</span>
                        )}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-success">create</button>
                </form>
              </div>
            )}

            {loading ? (
              <div className="loading-state">
                <div className="spinner"></div>
                <p>loading...</p>
              </div>
            ) : error ? (
              <div className="error-state">
                <p className="error-message">{error}</p>
                <p className="error-hint">backendNotAvailable</p>
              </div>
            ) : tasks.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon">—</div>
                <h3>noTasks</h3>
                <p>createYourFirstTask</p>
              </div>
            ) : (
              <div className="tasks-grid">
                {tasks.map(task => (
                  <div key={task.id} className={`task-card ${task.completed ? 'task-completed' : ''}`}>
                    <div 
                      className="task-priority-indicator"
                      style={{ backgroundColor: getPriorityColor(task.urgency || 3, task.difficulty || 3) }}
                    ></div>
                    {editingTaskId === task.id ? (
                      <div className="task-edit-form">
                        <form onSubmit={(e) => handleUpdateTask(e, task.id)}>
                          <div className="form-group">
                            <input
                              type="text"
                              value={editTask.title}
                              onChange={(e) => setEditTask({ ...editTask, title: e.target.value })}
                              required
                              placeholder="taskTitle"
                            />
                          </div>
                          <div className="form-group">
                            <textarea
                              value={editTask.description}
                              onChange={(e) => setEditTask({ ...editTask, description: e.target.value })}
                              placeholder="description"
                              rows="2"
                            />
                          </div>
                          <div className="form-row">
                            <div className="form-group">
                              <label>urgency</label>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={editTask.urgency}
                                onChange={(e) => setEditTask({ ...editTask, urgency: parseInt(e.target.value) })}
                              />
                              <div className="range-value mono">{editTask.urgency}</div>
                            </div>
                            <div className="form-group">
                              <label>difficulty</label>
                              <input
                                type="range"
                                min="1"
                                max="5"
                                value={editTask.difficulty}
                                onChange={(e) => setEditTask({ ...editTask, difficulty: parseInt(e.target.value) })}
                              />
                              <div className="range-value mono">{editTask.difficulty}</div>
                            </div>
                            <div className="form-group">
                              <label>daysUntilDue</label>
                              <div className="date-input-wrapper">
                                <input
                                  type="number"
                                  min="0"
                                  value={editTask.days_until_due !== null ? editTask.days_until_due : ''}
                                  onChange={(e) => setEditTask({ ...editTask, days_until_due: e.target.value === '' ? null : parseInt(e.target.value) })}
                                  placeholder="0"
                                />
                                {editTask.days_until_due !== null && editTask.days_until_due !== '' && (
                                  <span className="date-preview">{formatDatePreview(editTask.days_until_due)}</span>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="form-actions">
                            <button type="submit" className="btn btn-success">save</button>
                            <button type="button" className="btn" onClick={cancelEdit}>cancel</button>
                          </div>
                        </form>
                      </div>
                    ) : (
                      <>
                        <div className="task-content">
                          <div className="task-header">
                            <input
                              type="checkbox"
                              checked={task.completed || false}
                              onChange={() => handleToggleComplete(task.id)}
                              className="task-checkbox"
                            />
                            <h3 className="task-title">{task.title}</h3>
                          </div>
                          {task.description && (
                            <p className="task-description">{task.description}</p>
                          )}
                          <div className="task-meta">
                            <span className="task-badge">
                              urg:{task.urgency || 'N/A'}
                            </span>
                            <span className="task-badge">
                              diff:{task.difficulty || 'N/A'}
                            </span>
                            {task.due_date && (
                              <span className="task-badge mono">
                                {formatDueDate(task.due_date)}
                              </span>
                            )}
                          </div>
                        </div>
                        <div className="task-actions">
                          <button 
                            className="btn-icon" 
                            title="Edit" 
                            aria-label="Edit"
                            onClick={() => handleEditTask(task)}
                          >
                            E
                          </button>
                          <button 
                            className="btn-icon" 
                            title="Delete" 
                            aria-label="Delete"
                            onClick={() => handleDeleteTask(task.id)}
                          >
                            D
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* AI Assistant Sidebar */}
        <aside className="assistant-sidebar">
          <div className="assistant-header">
            <h3>aiAssistant</h3>
          </div>
          <div className="assistant-content">
            <div className="robot-container">
              <img src="/robot_sprite.png" alt="AI Assistant Robot" className="robot-sprite-image" />
            </div>
            <div className="assistant-message">
              <p>readyToHelpYouStayProductive</p>
            </div>
          </div>
        </aside>
        </div>
      </main>
    </div>
  )
}

export default App


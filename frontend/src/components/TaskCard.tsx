/**
 * Task card component for displaying individual tasks.
 */

import React, { useRef, useEffect } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useChatStore } from '../store/useChatStore'
import { useTasks } from '../hooks/useTasks'
import { aiApi } from '../services/api'
import { formatDueDate, formatCompletedDate } from '../utils/dateUtils'
import { getPriorityColor, getUrgencyBorderColor } from '../utils/colorUtils'
import TaskForm from './TaskForm'
import type { Task, PendingTransition } from '../types'

interface TaskCardProps {
  task: Task
  viewMode: 'active' | 'history'
}

const TaskCard: React.FC<TaskCardProps> = ({ task, viewMode }) => {
  const { deleteTask, markComplete } = useTasks()
  const editingTaskId = useTaskStore((state) => state.editingTaskId)
  const setEditingTaskId = useTaskStore((state) => state.setEditingTaskId)
  const removePendingTransition = useTaskStore((state) => state.removePendingTransition)
  const addPendingTransition = useTaskStore((state) => state.addPendingTransition)
  const pendingTransitions = useTaskStore((state) => state.pendingTransitions)
  const setError = useTaskStore((state) => state.setError)
  const setChatHistory = useChatStore((state) => state.setChatHistory)
  
  const pendingTransitionsRef = useRef(pendingTransitions)

  useEffect(() => {
    pendingTransitionsRef.current = pendingTransitions
  }, [pendingTransitions])

  const handleEdit = () => {
    setEditingTaskId(task.id)
  }

  const handleDelete = async () => {
    if (!window.confirm('deleteTask?')) {
      return
    }

    try {
      await deleteTask(task.id)
      
      // Clear any pending transitions for this task
      const existing = pendingTransitions.get(task.id)
      if (existing) {
        clearTimeout(existing.timeoutId)
        removePendingTransition(task.id)
      }
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete task')
    }
  }

  const handleToggleComplete = async () => {
    // Check if there's already a pending transition for this task
    const existingPending = pendingTransitionsRef.current.get(task.id)
    if (existingPending) {
      // User clicked again - cancel the transition
      clearTimeout(existingPending.timeoutId)
      removePendingTransition(task.id)
      return
    }

    // Determine the intended new state (opposite of current)
    const intendedState = !task.completed
    const taskTitle = task.title

    // Start the 1.5 second delay
    const timeoutId = setTimeout(async () => {
      try {
        // Verify this specific timeout is still valid before executing
        const currentPendingEntry = pendingTransitionsRef.current.get(task.id)
        
        const isValidTransition =
          currentPendingEntry &&
          currentPendingEntry.timeoutId === timeoutId &&
          currentPendingEntry.intendedState === intendedState

        if (!isValidTransition) {
          return
        }

        await markComplete(task.id, intendedState)
        
        // Verify this is still the active transition before updating
        const stillPending = pendingTransitionsRef.current.get(task.id)
        const isStillValid =
          stillPending &&
          stillPending.timeoutId === timeoutId &&
          stillPending.intendedState === intendedState

        if (!isStillValid) {
          return
        }

        // Clear pending transition
        removePendingTransition(task.id)

        // If task was completed, get congratulatory message
        if (intendedState) {
          try {
            const aiResponse = await aiApi.onTaskCompleted(taskTitle)
            setChatHistory([{ role: 'assistant', text: aiResponse }])
          } catch (aiErr) {
            console.error('Error getting AI congratulations:', aiErr)
          }
        }
      } catch (err) {
        console.error('Error toggling task:', err)
        setError(err instanceof Error ? err.message : 'Failed to toggle task')
        
        // Clear pending transition on error only if it's still the same timeout
        const currentPending = pendingTransitionsRef.current.get(task.id)
        if (currentPending && currentPending.timeoutId === timeoutId) {
          removePendingTransition(task.id)
        }
      }
    }, 1500) // 1.5 seconds

    // Store the timeout ID and intended state
    addPendingTransition(task.id, { timeoutId, intendedState } as PendingTransition)
  }

  const cancelEdit = () => {
    setEditingTaskId(null)
  }

  const pending = pendingTransitions.get(task.id)
  const displayAsCompleted = pending ? pending.intendedState : task.completed
  const pendingClass = pending
    ? pending.intendedState
      ? 'task-pending-complete'
      : 'task-pending-uncomplete'
    : ''

  if (editingTaskId === task.id) {
    return (
      <div className="task-card task-card-editing">
        <TaskForm task={task} onCancel={cancelEdit} />
      </div>
    )
  }

  return (
    <div
      className={`task-card ${displayAsCompleted ? 'task-completed' : ''} ${pendingClass}`}
      style={{
        '--urgency-color': getUrgencyBorderColor(task.urgency || 3),
      } as React.CSSProperties}
    >
      <div
        className="task-priority-indicator"
        style={{ backgroundColor: getPriorityColor(task.urgency || 3, task.difficulty || 3) }}
      />
      
      <div className="task-content">
        <div className="task-header">
          <input
            type="checkbox"
            checked={pending ? pending.intendedState : task.completed || false}
            onChange={handleToggleComplete}
            className={`task-checkbox ${pendingTransitions.has(task.id) ? 'task-pending' : ''}`}
          />
          <h3 className="task-title">{task.title}</h3>
        </div>
        
        <div className="task-meta">
          <span className="task-badge">urg:{task.urgency || 'N/A'}</span>
          <span className="task-badge">diff:{task.difficulty || 'N/A'}</span>
          {task.due_date && (
            <span className="task-badge mono">{formatDueDate(task.due_date)}</span>
          )}
          {viewMode === 'history' && task.updated_at && (
            <span className="task-badge mono task-completed-date">
              completed: {formatCompletedDate(task.updated_at)}
            </span>
          )}
        </div>
        
        {task.description && <p className="task-description">{task.description}</p>}
      </div>
      
      <div className="task-actions">
        {viewMode === 'active' && (
          <button className="btn-icon" title="Edit" aria-label="Edit" onClick={handleEdit}>
            E
          </button>
        )}
        <button
          className="btn-icon"
          title="Delete"
          aria-label="Delete"
          onClick={handleDelete}
        >
          D
        </button>
      </div>
    </div>
  )
}

export default TaskCard


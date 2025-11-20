/**
 * Task form component for creating and editing tasks.
 */

import React, { useState, useEffect } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useChatStore } from '../store/useChatStore'
import { useTasks } from '../hooks/useTasks'
import { aiApi } from '../services/api'
import { calculateDateFromDays, formatDatePreview } from '../utils/dateUtils'
import type { Task } from '../types'

interface TaskFormData {
  title: string
  description: string
  urgency: number
  difficulty: number
  days_until_due: number | null
}

interface TaskFormProps {
  task?: Task | null
  onCancel: () => void
}

const TaskForm: React.FC<TaskFormProps> = ({ task, onCancel }) => {
  const [formData, setFormData] = useState<TaskFormData>({
    title: task?.title || '',
    description: task?.description || '',
    urgency: task?.urgency || 3,
    difficulty: task?.difficulty || 3,
    days_until_due: null,
  })

  const { addTask, updateTask } = useTasks()
  const setError = useTaskStore((state) => state.setError)
  const setShowCreateForm = useTaskStore((state) => state.setShowCreateForm)
  const setEditingTaskId = useTaskStore((state) => state.setEditingTaskId)
  const setChatHistory = useChatStore((state) => state.setChatHistory)

  useEffect(() => {
    if (task) {
      // Calculate days until due from task's due_date
      let daysUntilDue: number | null = null
      if (task.due_date) {
        const dueDate = new Date(task.due_date)
        dueDate.setHours(0, 0, 0, 0)
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const diffTime = dueDate.getTime() - today.getTime()
        daysUntilDue = Math.round(diffTime / (1000 * 60 * 60 * 24))
      }

      setFormData({
        title: task.title,
        description: task.description || '',
        urgency: task.urgency,
        difficulty: task.difficulty,
        days_until_due: daysUntilDue,
      })
    }
  }, [task])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    try {
      const taskData = {
        title: formData.title,
        description: formData.description,
        urgency: formData.urgency,
        difficulty: formData.difficulty,
        due_date: calculateDateFromDays(formData.days_until_due),
      }

      if (task) {
        // Update existing task
        await updateTask(task.id, taskData)
        setEditingTaskId(null)
      } else {
        // Create new task
        const createdTask = await addTask(taskData)
        setFormData({
          title: '',
          description: '',
          urgency: 3,
          difficulty: 3,
          days_until_due: null,
        })
        setShowCreateForm(false)

        // Get encouraging message from AI
        try {
          const aiResponse = await aiApi.onTaskCreated(createdTask.title)
          setChatHistory([{ role: 'assistant', text: aiResponse }])
        } catch (aiErr) {
          console.error('Error getting AI encouragement:', aiErr)
        }
      }
    } catch (err) {
      console.error('Error saving task:', err)
      setError(err instanceof Error ? err.message : 'Failed to save task')
    }
  }

  const isEdit = !!task

  return (
    <div className={isEdit ? 'task-edit-form' : 'create-task-form'}>
      {!isEdit && <h3>newTask</h3>}
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          {!isEdit && <label htmlFor="title">title</label>}
          <input
            type="text"
            id={!isEdit ? 'title' : undefined}
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
            placeholder="taskTitle"
          />
        </div>

        <div className="form-group">
          {!isEdit && <label htmlFor="description">description</label>}
          <textarea
            id={!isEdit ? 'description' : undefined}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder={isEdit ? 'description' : 'optionalDescription'}
            rows={isEdit ? 2 : 3}
          />
        </div>

        <div className="form-row">
          <div className="form-group">
            <label htmlFor={!isEdit ? 'urgency' : undefined}>urgency {!isEdit && '(1-5)'}</label>
            <input
              type="range"
              id={!isEdit ? 'urgency' : undefined}
              min="1"
              max="5"
              value={formData.urgency}
              onChange={(e) => setFormData({ ...formData, urgency: parseInt(e.target.value) })}
            />
            <div className="range-value mono">{formData.urgency}</div>
          </div>

          <div className="form-group">
            <label htmlFor={!isEdit ? 'difficulty' : undefined}>difficulty {!isEdit && '(1-5)'}</label>
            <input
              type="range"
              id={!isEdit ? 'difficulty' : undefined}
              min="1"
              max="5"
              value={formData.difficulty}
              onChange={(e) => setFormData({ ...formData, difficulty: parseInt(e.target.value) })}
            />
            <div className="range-value mono">{formData.difficulty}</div>
          </div>

          <div className="form-group">
            <label htmlFor={!isEdit ? 'days_until_due' : undefined}>daysUntilDue</label>
            <div className="date-input-wrapper">
              <input
                type="number"
                id={!isEdit ? 'days_until_due' : undefined}
                min="0"
                value={formData.days_until_due !== null ? formData.days_until_due : ''}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    days_until_due: e.target.value === '' ? null : parseInt(e.target.value),
                  })
                }
                placeholder="0"
              />
              {formData.days_until_due !== null && (
                <span className="date-preview">{formatDatePreview(formData.days_until_due)}</span>
              )}
            </div>
          </div>
        </div>

        <div className={isEdit ? 'form-actions' : ''}>
          <button type="submit" className="btn btn-success">
            {isEdit ? 'save' : 'create'}
          </button>
          {isEdit && (
            <button type="button" className="btn" onClick={onCancel}>
              cancel
            </button>
          )}
        </div>
      </form>
    </div>
  )
}

export default TaskForm


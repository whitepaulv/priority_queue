/**
 * API service for backend communication.
 */

import type { Task, TaskCreate, TaskUpdate } from '../types'

const API_BASE = '/api'

export const taskApi = {
  async fetchTasks(): Promise<Task[]> {
    const response = await fetch(`${API_BASE}/tasks`)
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }
    const data = await response.json()
    return Array.isArray(data) ? data : (data.tasks || [])
  },

  async createTask(task: TaskCreate): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Failed to create task: ${response.status}`)
    }
    return response.json()
  },

  async updateTask(taskId: number, task: TaskUpdate): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(task),
    })
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || `Failed to update task: ${response.status}`)
    }
    return response.json()
  },

  async deleteTask(taskId: number): Promise<void> {
    const response = await fetch(`${API_BASE}/tasks/${taskId}`, {
      method: 'DELETE',
    })
    if (!response.ok) {
      throw new Error(`Failed to delete task: ${response.status}`)
    }
  },

  async toggleComplete(taskId: number): Promise<Task> {
    const response = await fetch(`${API_BASE}/tasks/${taskId}/complete`, {
      method: 'PATCH',
    })
    if (!response.ok) {
      throw new Error(`Failed to toggle task: ${response.status}`)
    }
    return response.json()
  },
}

export const aiApi = {
  async chat(message: string): Promise<string> {
    const response = await fetch(`${API_BASE}/assistant/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ message }),
    })
    if (!response.ok) {
      throw new Error(`Failed to get AI response: ${response.status}`)
    }
    const data = await response.json()
    return data.response
  },

  async onTaskCreated(taskTitle: string): Promise<string> {
    const response = await fetch(`${API_BASE}/assistant/on-task-created`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_title: taskTitle }),
    })
    if (!response.ok) {
      throw new Error(`Failed to get AI message: ${response.status}`)
    }
    const data = await response.json()
    return data.response
  },

  async onTaskCompleted(taskTitle: string): Promise<string> {
    const response = await fetch(`${API_BASE}/assistant/on-task-completed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ task_title: taskTitle }),
    })
    if (!response.ok) {
      throw new Error(`Failed to get AI message: ${response.status}`)
    }
    const data = await response.json()
    return data.response
  },
}


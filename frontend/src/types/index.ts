/**
 * TypeScript type definitions for PriorityForge application.
 */

export interface Task {
  id: number
  title: string
  description?: string
  urgency: number // 1-5
  difficulty: number // 1-5
  due_date?: string | null
  completed: boolean
  created_at: string
  updated_at: string
  priority?: number
}

export interface TaskCreate {
  title: string
  description?: string
  urgency: number
  difficulty: number
  due_date?: string | null
  days_until_due?: number | null
}

export interface TaskUpdate {
  title?: string
  description?: string
  urgency?: number
  difficulty?: number
  due_date?: string | null
  days_until_due?: number | null
  completed?: boolean
  priority?: number
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  text: string
}

export interface PendingTransition {
  timeoutId: NodeJS.Timeout
  intendedState: boolean
}

export type SortBy = 'difficulty' | 'urgency' | 'due_date' | 'none'
export type ViewMode = 'active' | 'history'


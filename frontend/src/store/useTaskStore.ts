/**
 * Zustand store for global task management state.
 */

import { create } from 'zustand'
import type { Task, PendingTransition, SortBy, ViewMode } from '../types'

interface TaskStore {
  // State
  tasks: Task[]
  loading: boolean
  error: string | null
  currentView: ViewMode
  sortBy: SortBy
  editingTaskId: number | null
  showCreateForm: boolean
  pendingTransitions: Map<number, PendingTransition>
  
  // Actions
  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (taskId: number, task: Partial<Task>) => void
  removeTask: (taskId: number) => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  setCurrentView: (view: ViewMode) => void
  setSortBy: (sort: SortBy) => void
  setEditingTaskId: (id: number | null) => void
  setShowCreateForm: (show: boolean) => void
  addPendingTransition: (taskId: number, transition: PendingTransition) => void
  removePendingTransition: (taskId: number) => void
  clearPendingTransitions: () => void
}

export const useTaskStore = create<TaskStore>((set) => ({
  // Initial state
  tasks: [],
  loading: true,
  error: null,
  currentView: 'active',
  sortBy: 'difficulty',
  editingTaskId: null,
  showCreateForm: false,
  pendingTransitions: new Map(),
  
  // Actions
  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (taskId, updates) =>
    set((state) => ({
      tasks: state.tasks.map((t) =>
        t.id === taskId ? { ...t, ...updates } : t
      ),
    })),
  removeTask: (taskId) =>
    set((state) => ({
      tasks: state.tasks.filter((t) => t.id !== taskId),
    })),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCurrentView: (currentView) => set({ currentView }),
  setSortBy: (sortBy) => set({ sortBy }),
  setEditingTaskId: (editingTaskId) => set({ editingTaskId }),
  setShowCreateForm: (showCreateForm) => set({ showCreateForm }),
  addPendingTransition: (taskId, transition) =>
    set((state) => {
      const newMap = new Map(state.pendingTransitions)
      newMap.set(taskId, transition)
      return { pendingTransitions: newMap }
    }),
  removePendingTransition: (taskId) =>
    set((state) => {
      const newMap = new Map(state.pendingTransitions)
      newMap.delete(taskId)
      return { pendingTransitions: newMap }
    }),
  clearPendingTransitions: () => set({ pendingTransitions: new Map() }),
}))


/**
 * Custom hook for task CRUD operations with Supabase.
 * Includes realtime subscriptions and localStorage fallback.
 */

import { useState, useEffect, useCallback, useRef } from 'react'
import { supabase } from '../lib/supabase'
import { useTaskStore } from '../store/useTaskStore'
import type { Task, TaskCreate, TaskUpdate } from '../types'

// localStorage key for fallback
const LOCAL_STORAGE_KEY = 'priority_forge_tasks'

/**
 * Calculate priority based on urgency and difficulty
 */
const calculatePriority = (urgency: number, difficulty: number, dueDate?: string | null): number => {
  const basePriority = urgency * 0.6 + difficulty * 0.4
  let priority = basePriority

  if (dueDate) {
    const due = new Date(dueDate)
    const now = new Date()
    const daysUntilDue = Math.round((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    
    if (daysUntilDue < 0) {
      priority += 2 // Overdue tasks get high priority
    } else if (daysUntilDue === 0) {
      priority += 1.5 // Due today
    } else if (daysUntilDue <= 1) {
      priority += 1 // Due tomorrow
    } else if (daysUntilDue <= 3) {
      priority += 0.5 // Due in 3 days
    }
  }

  return priority
}

/**
 * Get tasks from localStorage as fallback
 */
const getTasksFromLocalStorage = (): Task[] => {
  try {
    const stored = localStorage.getItem(LOCAL_STORAGE_KEY)
    if (stored) {
      return JSON.parse(stored)
    }
  } catch (error) {
    console.error('Error reading from localStorage:', error)
  }
  return []
}

/**
 * Save tasks to localStorage as fallback
 */
const saveTasksToLocalStorage = (tasks: Task[]): void => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(tasks))
  } catch (error) {
    console.error('Error saving to localStorage:', error)
  }
}

/**
 * Check if user is logged in to Supabase
 * Also checks if Supabase is properly configured
 */
const isLoggedIn = async (): Promise<boolean> => {
  try {
    // Check if Supabase client exists
    if (!supabase) {
      return false
    }

    const { data: { session }, error } = await supabase.auth.getSession()
    if (error) {
      console.warn('Error checking Supabase session:', error)
      return false
    }
    return !!session
  } catch (error) {
    console.warn('Error checking if logged in:', error)
    return false
  }
}

/**
 * Custom hook for task management
 */
export const useTasks = () => {
  const [tasks, setTasks] = useState<Task[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isUsingLocalStorage, setIsUsingLocalStorage] = useState(false)
  
  // Get Zustand store setter for direct sync
  const setZustandTasks = useTaskStore((state) => state.setTasks)
  
  // Track if we have a pending local update to prevent fetchTasks from overwriting it
  const hasLocalUpdateRef = useRef(false)
  
  // Helper to update both local state and Zustand
  const updateTasksState = useCallback((newTasks: Task[]) => {
    setTasks(newTasks)
    // Directly sync to Zustand immediately
    setZustandTasks(newTasks)
  }, [setZustandTasks])

  /**
   * Fetch all tasks for the current user, ordered by priority then due date
   */
  const fetchTasks = useCallback(async () => {
    // Skip fetch if we just made a local update
    if (hasLocalUpdateRef.current) {
      return
    }
    setLoading(true)
    setError(null)

    try {
      // Check if Supabase client exists
      if (!supabase) {
        // No Supabase - use localStorage
        const localTasks = getTasksFromLocalStorage()
        updateTasksState(localTasks)
        setIsUsingLocalStorage(true)
        setLoading(false)
        return
      }

      const loggedIn = await isLoggedIn()
      
      // Try to fetch all tasks first (works if RLS allows it)
      // If user is logged in and RLS restricts, we'll filter below
      let query = (supabase.from('tasks') as any).select('*')
      
      if (loggedIn) {
        // Get current user and filter by their user_id
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user?.id) {
          query = query.eq('user_id', session.user.id)
        }
      }
      // If not logged in, try to fetch all tasks (RLS may allow or block this)

      // Order results
      const { data, error: fetchError } = await query
        .order('priority', { ascending: false })
        .order('due_date', { ascending: true })

      if (fetchError) {
        // If query fails (e.g., RLS blocking), try fetching all tasks without filter
        console.warn('Filtered query failed, trying to fetch all tasks:', fetchError)
        
        const { data: allData, error: allError } = await (supabase
          .from('tasks') as any)
          .select('*')
          .order('priority', { ascending: false })
          .order('due_date', { ascending: true })

        if (allError) {
          // If that also fails, fall back to localStorage
          const localTasks = getTasksFromLocalStorage()
          updateTasksState(localTasks)
          setIsUsingLocalStorage(true)
          setLoading(false)
          return
        }

        // Transform data to match Task interface
        const transformedTasks: Task[] = ((allData as any[]) || []).map((task: any) => ({
          id: task.id,
          title: task.title,
          description: task.description || undefined,
          urgency: task.urgency,
          difficulty: task.difficulty,
          due_date: task.due_date || null,
          completed: task.completed || false,
          created_at: task.created_at,
          updated_at: task.updated_at || task.created_at,
          priority: task.priority,
        }))

        updateTasksState(transformedTasks)
        setIsUsingLocalStorage(false)
        return
      }

      // Transform data to match Task interface
      const transformedTasks: Task[] = ((data as any[]) || []).map((task: any) => ({
        id: task.id,
        title: task.title,
        description: task.description || undefined,
        urgency: task.urgency,
        difficulty: task.difficulty,
        due_date: task.due_date || null,
        completed: task.completed || false,
        created_at: task.created_at,
        updated_at: task.updated_at || task.created_at,
        priority: task.priority,
      }))

      // If Supabase returns empty but localStorage has tasks, use localStorage instead
      if (transformedTasks.length === 0) {
        const localTasks = getTasksFromLocalStorage()
        if (localTasks.length > 0) {
          updateTasksState(localTasks)
          setIsUsingLocalStorage(true)
          setLoading(false)
          return
        }
      }

      updateTasksState(transformedTasks)
      setIsUsingLocalStorage(false)
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch tasks')
      
      // Fallback to localStorage on error
      const localTasks = getTasksFromLocalStorage()
      updateTasksState(localTasks)
      setIsUsingLocalStorage(true)
    } finally {
      setLoading(false)
    }
  }, [])

  /**
   * Add a new task
   */
  const addTask = useCallback(async (taskData: TaskCreate): Promise<Task> => {
    try {
      const loggedIn = await isLoggedIn()
      const priority = calculatePriority(taskData.urgency, taskData.difficulty, taskData.due_date)

      if (!loggedIn) {
        // Fallback to localStorage
        const newTask: Task = {
          id: Date.now(), // Use timestamp as ID for localStorage
          title: taskData.title,
          description: taskData.description,
          urgency: taskData.urgency,
          difficulty: taskData.difficulty,
          due_date: taskData.due_date || null,
          completed: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          priority,
        }

        const currentTasks = getTasksFromLocalStorage()
        const updatedTasks = [...currentTasks, newTask]
        saveTasksToLocalStorage(updatedTasks)
        
        // Mark that we have a local update to prevent fetchTasks from overwriting it
        hasLocalUpdateRef.current = true
        
        // Force a new array reference and directly sync to both states
        const newTasksArray = [...updatedTasks]
        updateTasksState(newTasksArray)
        
        // Clear the flag after a delay to allow the sync to happen
        setTimeout(() => {
          hasLocalUpdateRef.current = false
        }, 500)
        
        return newTask
      }

      // Check if Supabase client exists
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      // Get current user
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        throw new Error('User not authenticated')
      }

      // Insert into Supabase
      const { data, error: insertError } = await (supabase
        .from('tasks') as any)
        .insert({
          title: taskData.title,
          description: taskData.description || null,
          urgency: taskData.urgency,
          difficulty: taskData.difficulty,
          due_date: taskData.due_date || null,
          completed: false,
          priority,
          user_id: session.user.id,
        })
        .select()
        .single()

      if (insertError) {
        throw insertError
      }

      if (!data) {
        throw new Error('Task creation returned no data')
      }

      // Transform to Task interface
      const newTask: Task = {
        id: (data as any).id,
        title: (data as any).title,
        description: (data as any).description || undefined,
        urgency: (data as any).urgency,
        difficulty: (data as any).difficulty,
        due_date: (data as any).due_date || null,
        completed: (data as any).completed || false,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at || (data as any).created_at,
        priority: (data as any).priority,
      }

      // Note: Realtime will update the tasks list automatically
      return newTask
    } catch (err) {
      console.error('Error adding task:', err)
      setError(err instanceof Error ? err.message : 'Failed to add task')
      throw err
    }
  }, [])

  /**
   * Update an existing task
   */
  const updateTask = useCallback(async (taskId: number, updates: TaskUpdate): Promise<Task> => {
    try {
      const loggedIn = await isLoggedIn()

      if (!loggedIn) {
        // Fallback to localStorage
        const currentTasks = getTasksFromLocalStorage()
        const taskIndex = currentTasks.findIndex((t) => t.id === taskId)
        
        if (taskIndex === -1) {
          throw new Error('Task not found')
        }

        const existingTask = currentTasks[taskIndex]
        if (!existingTask) {
          throw new Error('Task not found')
        }

        const updatedTask: Task = {
          ...existingTask,
          ...updates,
          updated_at: new Date().toISOString(),
          priority: updates.due_date !== undefined || updates.urgency !== undefined || updates.difficulty !== undefined
            ? calculatePriority(
                updates.urgency ?? existingTask.urgency,
                updates.difficulty ?? existingTask.difficulty,
                updates.due_date !== undefined ? updates.due_date : existingTask.due_date
              )
            : existingTask.priority,
        }

        currentTasks[taskIndex] = updatedTask
        saveTasksToLocalStorage(currentTasks)
        updateTasksState([...currentTasks])
        return updatedTask
      }

      // Calculate updated priority if relevant fields changed
      const existingTask = tasks.find((t) => t.id === taskId)
      const updateData: Record<string, any> = { ...updates }
      
      if (existingTask && (updates.urgency !== undefined || updates.difficulty !== undefined || updates.due_date !== undefined)) {
        updateData.priority = calculatePriority(
          updates.urgency ?? existingTask.urgency,
          updates.difficulty ?? existingTask.difficulty,
          updates.due_date !== undefined ? updates.due_date : existingTask.due_date
        )
      }

      // Remove days_until_due from update (it's not a database field)
      delete updateData.days_until_due
      updateData.updated_at = new Date().toISOString()

      // Check if Supabase client exists
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      // Update in Supabase
      const { data, error: updateError } = await (supabase
        .from('tasks') as any)
        .update(updateData)
        .eq('id', taskId)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      if (!data) {
        throw new Error('Task update returned no data')
      }

      // Transform to Task interface
      const updatedTask: Task = {
        id: (data as any).id,
        title: (data as any).title,
        description: (data as any).description || undefined,
        urgency: (data as any).urgency,
        difficulty: (data as any).difficulty,
        due_date: (data as any).due_date || null,
        completed: (data as any).completed || false,
        created_at: (data as any).created_at,
        updated_at: (data as any).updated_at || (data as any).created_at,
        priority: (data as any).priority,
      }

      // Note: Realtime will update the tasks list automatically
      return updatedTask
    } catch (err) {
      console.error('Error updating task:', err)
      setError(err instanceof Error ? err.message : 'Failed to update task')
      throw err
    }
  }, [tasks])

  /**
   * Delete a task
   */
  const deleteTask = useCallback(async (taskId: number): Promise<void> => {
    try {
      const loggedIn = await isLoggedIn()

      if (!loggedIn) {
        // Fallback to localStorage
        const currentTasks = getTasksFromLocalStorage()
        const filteredTasks = currentTasks.filter((t) => t.id !== taskId)
        saveTasksToLocalStorage(filteredTasks)
        updateTasksState(filteredTasks)
        return
      }

      // Check if Supabase client exists
      if (!supabase) {
        throw new Error('Supabase client not initialized')
      }

      // Delete from Supabase
      const { error: deleteError } = await (supabase
        .from('tasks') as any)
        .delete()
        .eq('id', taskId)

      if (deleteError) {
        throw deleteError
      }

      // Note: Realtime will update the tasks list automatically
    } catch (err) {
      console.error('Error deleting task:', err)
      setError(err instanceof Error ? err.message : 'Failed to delete task')
      throw err
    }
  }, [])

  /**
   * Mark a task as complete/incomplete
   */
  const markComplete = useCallback(async (taskId: number, completed: boolean): Promise<Task> => {
    return updateTask(taskId, { completed })
  }, [updateTask])

  // Set up realtime subscription
  useEffect(() => {
    let channel: any = null

    const setupRealtime = async () => {
      const loggedIn = await isLoggedIn()
      
      if (!loggedIn) {
        return // No realtime for localStorage fallback
      }

      // Check if Supabase client exists
      if (!supabase) {
        return
      }

      // Get current user for filtering
      const { data: { session } } = await supabase.auth.getSession()
      const userId = session?.user?.id

      if (!userId) {
        return
      }

      // Create a channel for realtime updates
      // Use a unique channel name per user to avoid conflicts
      channel = supabase
        .channel(`tasks-changes-${userId}`)
        .on(
          'postgres_changes',
          {
            event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
            schema: 'public',
            table: 'tasks',
            filter: `user_id=eq.${userId}`, // Only listen to changes for this user
          },
          (payload) => {
            if (payload.eventType === 'INSERT') {
              // New task added
              const newTask: Task = {
                id: payload.new.id,
                title: payload.new.title,
                description: payload.new.description || undefined,
                urgency: payload.new.urgency,
                difficulty: payload.new.difficulty,
                due_date: payload.new.due_date || null,
                completed: payload.new.completed || false,
                created_at: payload.new.created_at,
                updated_at: payload.new.updated_at || payload.new.created_at,
                priority: payload.new.priority,
              }

              setTasks((prev) => {
                // Check if task already exists (avoid duplicates)
                if (prev.some((t) => t.id === newTask.id)) {
                  return prev
                }
                // Add new task and sort
                const updated = [...prev, newTask]
                return updated.sort((a, b) => {
                  // Sort by priority (descending), then due_date (ascending)
                  if (b.priority !== a.priority) {
                    return (b.priority || 0) - (a.priority || 0)
                  }
                  if (a.due_date && b.due_date) {
                    return new Date(a.due_date).getTime() - new Date(b.due_date).getTime()
                  }
                  if (a.due_date) return -1
                  if (b.due_date) return 1
                  return 0
                })
              })
            } else if (payload.eventType === 'UPDATE') {
              // Task updated
              const updatedTask: Task = {
                id: payload.new.id,
                title: payload.new.title,
                description: payload.new.description || undefined,
                urgency: payload.new.urgency,
                difficulty: payload.new.difficulty,
                due_date: payload.new.due_date || null,
                completed: payload.new.completed || false,
                created_at: payload.new.created_at,
                updated_at: payload.new.updated_at || payload.new.created_at,
                priority: payload.new.priority,
              }

              setTasks((prev) =>
                prev.map((t) => (t.id === updatedTask.id ? updatedTask : t))
              )
            } else if (payload.eventType === 'DELETE') {
              // Task deleted
              const deletedId = payload.old.id
              setTasks((prev) => prev.filter((t) => t.id !== deletedId))
            }
          }
        )
        .subscribe()
    }

    setupRealtime()

    // Cleanup subscription on unmount
    return () => {
      if (channel && supabase) {
        supabase.removeChannel(channel)
      }
    }
  }, [])

  // Initial fetch on mount (only once)
  useEffect(() => {
    fetchTasks()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []) // Only run once on mount, not when fetchTasks changes

  return {
    tasks,
    loading,
    error,
    isUsingLocalStorage,
    fetchTasks,
    addTask,
    updateTask,
    deleteTask,
    markComplete,
  }
}


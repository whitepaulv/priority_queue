/**
 * Main React application component.
 * Root component that contains the application layout and routing.
 */

import { useState, useEffect, useRef } from 'react'
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
  const [chatMessage, setChatMessage] = useState('')
  const [chatHistory, setChatHistory] = useState([])
  const [displayedText, setDisplayedText] = useState('Hi there! Let me know if you need any help!')
  const [isTyping, setIsTyping] = useState(false)
  const [currentView, setCurrentView] = useState('active') // 'active' or 'history'
  const [pendingTransitions, setPendingTransitions] = useState(new Map()) // taskId -> { timeoutId, intendedState }
  const pendingTransitionsRef = useRef(new Map()) // Ref to track current pending transitions
  const [sortBy, setSortBy] = useState('difficulty') // 'difficulty', 'urgency', 'due_date'

  // Fetch tasks from API
  useEffect(() => {
    fetchTasks()
  }, [])

  // Keep ref in sync with state
  useEffect(() => {
    pendingTransitionsRef.current = pendingTransitions
  }, [pendingTransitions])

  // Cleanup pending transitions on unmount
  useEffect(() => {
    return () => {
      // Clear all pending timeouts when component unmounts
      pendingTransitionsRef.current.forEach(pending => {
        clearTimeout(pending.timeoutId)
      })
    }
  }, [])

  // Typing animation effect
  useEffect(() => {
    const lastAssistantMessage = chatHistory
      .filter(msg => msg.role === 'assistant')
      .slice(-1)[0]
    
    if (lastAssistantMessage && lastAssistantMessage.text) {
      const fullText = lastAssistantMessage.text
      setDisplayedText('')
      setIsTyping(true)
      
      let currentIndex = 0
      let timeoutId = null
      const typingSpeed = 15 // milliseconds per character (adjust for faster/slower)
      let cancelled = false
      
      const typeChar = () => {
        if (cancelled) return
        
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.substring(0, currentIndex + 1))
          currentIndex++
          timeoutId = setTimeout(typeChar, typingSpeed)
        } else {
          setIsTyping(false)
        }
      }
      
      // Small delay before starting to type
      timeoutId = setTimeout(typeChar, 100)
      
      return () => {
        cancelled = true
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        setIsTyping(false)
      }
    }
    // Don't clear displayedText if no messages - keep the initial welcome message
  }, [chatHistory])

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

      const createdTask = await response.json()
      const taskTitle = createdTask.title || newTask.title

      // Close form and reset
      setShowCreateForm(false)
      setNewTask({ title: '', description: '', urgency: 3, difficulty: 3, days_until_due: null })
      
      // Refresh tasks list
      fetchTasks()

      // Get encouraging message from AI
      try {
        const aiResponse = await fetch('/api/assistant/on-task-created', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ task_title: taskTitle }),
        })

        if (aiResponse.ok) {
          const aiData = await aiResponse.json()
          // Show the AI's encouraging message
          setChatHistory([{ role: 'assistant', text: aiData.response }])
        }
      } catch (aiErr) {
        // Silently fail - AI message is optional
        console.error('Error getting AI encouragement:', aiErr)
      }
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

  const handleToggleComplete = async (taskId, currentCompletedState) => {
    // Check if there's already a pending transition for this task
    const existingPending = pendingTransitions.get(taskId)
    if (existingPending) {
      // User clicked again - cancel the transition
      clearTimeout(existingPending.timeoutId)
      setPendingTransitions(prev => {
        const newMap = new Map(prev)
        newMap.delete(taskId)
        return newMap
      })
      return
    }

    // Determine the intended new state (opposite of current)
    const intendedState = !currentCompletedState
    
    // Get task title for AI message if completing (capture at creation time)
    const task = tasks.find(t => t.id === taskId)
    const taskTitle = task?.title || ''

    // Start the 1.5 second delay
    // Use a closure to capture timeoutId and intendedState to verify it matches when callback executes
    const timeoutId = setTimeout(async () => {
      console.log(`⏰ TIMEOUT CALLBACK EXECUTING for task ${taskId} after 1.5s`)
      try {
        // Verify this specific timeout is still valid before executing
        // Use the ref to get the latest state without triggering React re-renders
        const currentPendingEntry = pendingTransitionsRef.current.get(taskId)
        
        console.log(`🔍 Checking transition validity for task ${taskId}:`, {
          hasCurrentPending: !!currentPendingEntry,
          currentTimeoutId: currentPendingEntry?.timeoutId,
          expectedTimeoutId: timeoutId,
          timeoutIdsMatch: currentPendingEntry?.timeoutId === timeoutId,
          timeoutIdType: typeof currentPendingEntry?.timeoutId,
          expectedTimeoutIdType: typeof timeoutId,
          currentIntendedState: currentPendingEntry?.intendedState,
          expectedIntendedState: intendedState,
          intendedStatesMatch: currentPendingEntry?.intendedState === intendedState,
          refMapSize: pendingTransitionsRef.current.size,
          refMapKeys: Array.from(pendingTransitionsRef.current.keys())
        })
        
        // Check if this transition is still valid
        const isValidTransition = currentPendingEntry && 
                                  currentPendingEntry.timeoutId === timeoutId &&
                                  currentPendingEntry.intendedState === intendedState
        
        if (!isValidTransition) {
          // This transition was cancelled or replaced, don't proceed
          console.log(`❌ Transition NOT valid for task ${taskId}, aborting update. Details:`, {
            hasEntry: !!currentPendingEntry,
            timeoutMatch: currentPendingEntry?.timeoutId === timeoutId,
            stateMatch: currentPendingEntry?.intendedState === intendedState,
            entry: currentPendingEntry
          })
          return
        }
        
        console.log(`✅ Transition valid, proceeding with API call for task ${taskId}`)

        const response = await fetch(`/api/tasks/${taskId}/complete`, {
          method: 'PATCH',
        })

        if (!response.ok) {
          throw new Error(`Failed to toggle task: ${response.status}`)
        }

        // The PATCH endpoint returns the updated task, so use that directly
        // No need to make a separate GET request
        const apiResponse = await response.json()
        
        // Debug: Log API response
        console.log(`API response for task ${taskId}:`, apiResponse)
        
        // Ensure completed is a boolean - the API should return it correctly, but be explicit
        // Use intendedState as the source of truth since that's what we requested
        const updatedTask = {
          ...apiResponse,
          completed: Boolean(intendedState)
        }
        
        // Debug: Log the update
        console.log(`Preparing to update task ${taskId}:`, { 
          apiResponseCompleted: apiResponse.completed, 
          intendedState, 
          finalCompleted: updatedTask.completed,
          fullTask: updatedTask
        })

        // Verify this is still the active transition before updating
        // Use the ref to check the latest state
        const stillPending = pendingTransitionsRef.current.get(taskId)
        const isStillValid = stillPending && 
                            stillPending.timeoutId === timeoutId && 
                            stillPending.intendedState === intendedState
        
        if (!isStillValid) {
          // Transition was cancelled/replaced, don't update
          console.log(`❌ Second validation failed for task ${taskId}, aborting update`)
          return
        }
        
        console.log(`✅ Second validation passed for task ${taskId}, proceeding with state update`)

        // Update tasks state FIRST - this ensures React detects the change
        // Create a completely new array and new task object to ensure React detects the change
        setTasks(prevTasks => {
          console.log(`Updating tasks state. Current tasks:`, prevTasks.map(t => ({ id: t.id, title: t.title, completed: t.completed })))
          
          // Create completely new objects for ALL tasks to ensure React detects the change
          const newTasks = prevTasks.map(t => {
            if (t.id === taskId) {
              // Create a completely new task object with all fields preserved
              // Explicitly set completed to ensure it's correct
              const newTask = {
                id: t.id,
                title: updatedTask.title || t.title,
                description: updatedTask.description !== undefined ? updatedTask.description : t.description,
                urgency: updatedTask.urgency !== undefined ? updatedTask.urgency : t.urgency,
                difficulty: updatedTask.difficulty !== undefined ? updatedTask.difficulty : t.difficulty,
                due_date: updatedTask.due_date !== undefined ? updatedTask.due_date : t.due_date,
                completed: Boolean(intendedState), // CRITICAL: Use intendedState directly
                created_at: updatedTask.created_at || t.created_at,
                updated_at: updatedTask.updated_at || t.updated_at
              }
              console.log(`Task ${taskId} updated in state:`, { 
                oldCompleted: t.completed, 
                apiCompleted: updatedTask.completed,
                intendedState,
                newCompleted: newTask.completed,
                oldTask: JSON.parse(JSON.stringify(t)),
                newTask: JSON.parse(JSON.stringify(newTask))
              })
              return newTask
            }
            // For other tasks, still create a new object to ensure React detects changes
            return { ...t }
          })
          
          console.log(`Tasks state updated. New tasks:`, newTasks.map(t => ({ id: t.id, title: t.title, completed: t.completed })))
          console.log(`Total tasks: ${newTasks.length}, Completed: ${newTasks.filter(t => t.completed).length}, Active: ${newTasks.filter(t => !t.completed).length}`)
          
          return newTasks
        })
        
        // THEN clear the pending transition - this allows React to process the task update first
        setPendingTransitions(prev => {
          const currentPending = prev.get(taskId)
          // Double-check this is still the active transition
          if (!currentPending || 
              currentPending.timeoutId !== timeoutId || 
              currentPending.intendedState !== intendedState) {
            return prev // Transition was cancelled/replaced, don't clear
          }
          
          // This transition is still valid - clear it
          const newMap = new Map(prev)
          newMap.delete(taskId)
          return newMap
        })

        // If task was completed (intendedState is true), get congratulatory message
        // Do this after state update to ensure it's the latest task info
        if (intendedState) {
          try {
            const aiResponse = await fetch('/api/assistant/on-task-completed', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ task_title: taskTitle }),
            })

            if (aiResponse.ok) {
              const aiData = await aiResponse.json()
              // Show the AI's congratulatory message
              setChatHistory([{ role: 'assistant', text: aiData.response }])
            }
          } catch (aiErr) {
            // Silently fail - AI message is optional
            console.error('Error getting AI congratulations:', aiErr)
          }
        }
      } catch (err) {
        console.error('Error toggling task:', err)
        setError(err.message)
        // Clear pending transition on error only if it's still the same timeout
        setPendingTransitions(prev => {
          const currentPending = prev.get(taskId)
          if (currentPending && currentPending.timeoutId === timeoutId) {
            const newMap = new Map(prev)
            newMap.delete(taskId)
            return newMap
          }
          return prev
        })
      }
    }, 1500) // 1.5 seconds

    // Store the timeout ID and intended state
    console.log(`⏱️ Setting timeout for task ${taskId}, intendedState: ${intendedState}, timeoutId: ${timeoutId}`)
    setPendingTransitions(prev => {
      const newMap = new Map(prev)
      newMap.set(taskId, { timeoutId, intendedState })
      // Also update the ref immediately so it's available in the timeout callback
      pendingTransitionsRef.current = newMap
      console.log(`✅ Stored pending transition for task ${taskId} in state and ref:`, {
        timeoutId,
        intendedState,
        refSize: pendingTransitionsRef.current.size,
        refKeys: Array.from(pendingTransitionsRef.current.keys())
      })
      return newMap
    })
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

  const formatCompletedDate = (dateString) => {
    if (!dateString) return 'unknown'
    
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = now - date
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
    
    if (diffDays === 0) {
      // Check if it was today
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      const compDate = new Date(date)
      compDate.setHours(0, 0, 0, 0)
      
      if (compDate.getTime() === today.getTime()) {
        return 'today'
      }
      return 'today'
    } else if (diffDays === 1) {
      return 'yesterday'
    } else if (diffDays < 7) {
      return `${diffDays}dAgo`
    } else if (diffDays < 30) {
      const weeks = Math.floor(diffDays / 7)
      return `${weeks}wAgo`
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    }
  }

  const getPriorityColor = (urgency, difficulty) => {
    const score = urgency * 0.6 + difficulty * 0.4
    // Subtle opacity-based priority indicator
    if (score >= 4.5) return 'rgba(255, 255, 255, 0.16)'
    if (score >= 3.5) return 'rgba(255, 255, 255, 0.12)'
    if (score >= 2.5) return 'rgba(255, 255, 255, 0.08)'
    return 'rgba(255, 255, 255, 0.04)'
  }

  const getUrgencyBorderColor = (urgency) => {
    // Get border color based on urgency level
    switch (urgency) {
      case 1:
        return '#2d5016' // dark green
      case 2:
        return '#5a9a3a' // light green
      case 3:
        return '#e6c200' // yellow
      case 4:
        return '#e67e7e' // light red
      case 5:
        return '#8b0000' // dark red
      default:
        return '#e6c200' // default to yellow
    }
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
            <div className="view-tabs">
              <button 
                className={`view-tab ${currentView === 'active' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('active')
                  setShowCreateForm(false)
                  setEditingTaskId(null)
                }}
              >
                activeTasks
              </button>
              <button 
                className={`view-tab ${currentView === 'history' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentView('history')
                  setShowCreateForm(false)
                  setEditingTaskId(null)
                }}
              >
                history
              </button>
            </div>
            {currentView === 'active' && (
              <div className="header-actions">
                <div className="sort-dropdown-wrapper">
                  <span className="sort-label">sort:</span>
                  <select
                    className="sort-dropdown"
                    value={sortBy}
                    onChange={(e) => setSortBy(e.target.value)}
                  >
                    <option value="difficulty">difficulty</option>
                    <option value="urgency">urgency</option>
                    <option value="due_date">dueDate</option>
                  </select>
                </div>
                <button 
                  className="btn btn-primary" 
                  onClick={() => setShowCreateForm(!showCreateForm)}
                >
                  {showCreateForm ? 'cancel' : 'new'}
                </button>
              </div>
            )}
          </div>

            {currentView === 'active' && showCreateForm && (
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
            ) : (() => {
              // Filter tasks based on current view
              // During the 1.5 second delay, tasks stay in their current screen
              // Only after the delay completes do they move to the other screen
              const filteredTasks = tasks.filter(task => {
                const pending = pendingTransitions.get(task.id)
                // If there's a pending transition, keep the task in its CURRENT screen
                // Don't filter based on intended state - that would make it move immediately
                // Use actual completed state for filtering, so task stays in current view during delay
                const completedState = task.completed
                
                // Debug logging
                if (pending) {
                  console.log(`Filtering task ${task.id} (${task.title}):`, {
                    currentView,
                    completedState,
                    pendingTransition: pending.intendedState,
                    willShowInActive: !completedState,
                    willShowInHistory: completedState
                  })
                }
                
                if (currentView === 'active') {
                  // Show in active if not completed (regardless of pending transitions)
                  const show = !completedState
                  if (show && pending) {
                    console.log(`Task ${task.id} showing in active (has pending transition to ${pending.intendedState ? 'completed' : 'incomplete'})`)
                  }
                  return show
                } else {
                  // Show in history if completed (regardless of pending transitions)
                  const show = completedState
                  if (show && pending) {
                    console.log(`Task ${task.id} showing in history (has pending transition to ${pending.intendedState ? 'completed' : 'incomplete'})`)
                  }
                  return show
                }
              })
              
              // Sort tasks based on sortBy selection
              let sortedTasks = [...filteredTasks]
              sortedTasks.sort((a, b) => {
                if (sortBy === 'difficulty') {
                  // Sort by difficulty (higher first)
                  return (b.difficulty || 0) - (a.difficulty || 0)
                } else if (sortBy === 'urgency') {
                  // Sort by urgency (higher first)
                  return (b.urgency || 0) - (a.urgency || 0)
                } else if (sortBy === 'due_date') {
                  // Sort by due date (sooner first, then tasks without due dates)
                  if (!a.due_date && !b.due_date) return 0
                  if (!a.due_date) return 1 // Tasks without due dates go to end
                  if (!b.due_date) return -1
                  const dateA = new Date(a.due_date)
                  const dateB = new Date(b.due_date)
                  return dateA - dateB // Sooner dates first
                }
                return 0
              })
              
              console.log(`Filtered tasks for ${currentView}:`, sortedTasks.map(t => ({ id: t.id, title: t.title, completed: t.completed })))
              
              if (sortedTasks.length === 0) {
                return (
                  <div className="empty-state">
                    <div className="empty-icon">—</div>
                    <h3>{currentView === 'active' ? 'noTasks' : 'noCompletedTasks'}</h3>
                    <p>{currentView === 'active' ? 'createYourFirstTask' : 'completedTasksWillAppearHere'}</p>
                  </div>
                )
              }
              
              return (
                <div className="tasks-grid">
                  {sortedTasks.map(task => {
                    const pending = pendingTransitions.get(task.id)
                    // If there's a pending transition, use the intended state for styling
                    // Otherwise, use the actual completed state
                    const displayAsCompleted = pending ? pending.intendedState : task.completed
                    // For pending transitions, add class based on intended state
                    const pendingClass = pending 
                      ? (pending.intendedState ? 'task-pending-complete' : 'task-pending-uncomplete')
                      : ''
                    
                    return (
                  <div 
                    key={task.id} 
                    className={`task-card task-urgency-${task.urgency || 3} ${displayAsCompleted ? 'task-completed' : ''} ${pendingClass}`}
                    style={{ 
                      '--urgency-color': getUrgencyBorderColor(task.urgency || 3)
                    }}
                  >
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
                              checked={(() => {
                                const pending = pendingTransitions.get(task.id)
                                // If there's a pending transition, show the intended state
                                // Otherwise, show the actual state
                                return pending ? pending.intendedState : (task.completed || false)
                              })()}
                              onChange={() => handleToggleComplete(task.id, task.completed)}
                              className={`task-checkbox ${pendingTransitions.has(task.id) ? 'task-pending' : ''}`}
                            />
                            <h3 className="task-title">{task.title}</h3>
                          </div>
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
                            {currentView === 'history' && task.updated_at && (
                              <span className="task-badge mono task-completed-date">
                                completed: {formatCompletedDate(task.updated_at)}
                              </span>
                            )}
                          </div>
                          {task.description && (
                            <p className="task-description">{task.description}</p>
                          )}
                        </div>
                        {currentView === 'active' && (
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
                        )}
                        {currentView === 'history' && (
                          <div className="task-actions">
                            <button 
                              className="btn-icon" 
                              title="Delete" 
                              aria-label="Delete"
                              onClick={() => handleDeleteTask(task.id)}
                            >
                              D
                            </button>
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  )
                  })}
                </div>
              )
            })()}
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
            {displayedText && (
              <div className="assistant-message">
                <p>
                  {displayedText}
                  {isTyping && <span className="typing-cursor">|</span>}
                </p>
              </div>
            )}
            
            <div className="chat-container">
              <form 
                className="chat-input-form"
                onSubmit={async (e) => {
                  e.preventDefault()
                  if (chatMessage.trim()) {
                    const userMsg = chatMessage.trim()
                    setChatMessage('')
                    // Reset textarea height
                    const textarea = e.target.querySelector('.chat-input')
                    if (textarea) {
                      textarea.style.height = 'auto'
                    }
                    
                    try {
                      // Send to backend API
                      const response = await fetch('/api/assistant/chat', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ message: userMsg }),
                      })
                      
                      if (!response.ok) {
                        throw new Error(`Failed to get AI response: ${response.status}`)
                      }
                      
                      const data = await response.json()
                      
                      // Store only the last assistant response for white box display
                      setChatHistory([{ role: 'assistant', text: data.response }])
                    } catch (err) {
                      console.error('Error chatting with AI:', err)
                      setChatHistory([{ 
                        role: 'assistant', 
                        text: 'Sorry, I encountered an error. Please check that your API key is configured correctly.' 
                      }])
                    }
                  }
                }}
              >
                <textarea
                  value={chatMessage}
                  onChange={(e) => {
                    setChatMessage(e.target.value)
                    // Auto-resize textarea
                    e.target.style.height = 'auto'
                    e.target.style.height = e.target.scrollHeight + 'px'
                  }}
                  onKeyDown={(e) => {
                    // Allow Enter to submit, Shift+Enter for new line
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      // Trigger form submit
                      const form = e.target.closest('form')
                      if (form) {
                        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
                      }
                    }
                  }}
                  placeholder="typeMessageHere"
                  className="chat-input"
                  rows="1"
                />
                <button type="submit" className="chat-send-btn">send</button>
              </form>
            </div>
          </div>
        </aside>
        </div>
      </main>
    </div>
  )
}

export default App


/**
 * Main application component.
 */

import React, { useEffect, useRef } from 'react'
import { useTaskStore } from '../store/useTaskStore'
import { useTasks } from '../hooks/useTasks'
import Header from './Header'
import ViewTabs from './ViewTabs'
import SortDropdown from './SortDropdown'
import TaskForm from './TaskForm'
import TaskList from './TaskList'
import Sidebar from './Sidebar'
import '../App.css'

const App: React.FC = () => {
  const currentView = useTaskStore((state) => state.currentView)
  const showCreateForm = useTaskStore((state) => state.showCreateForm)
  const pendingTransitions = useTaskStore((state) => state.pendingTransitions)

  const setTasks = useTaskStore((state) => state.setTasks)
  const setLoading = useTaskStore((state) => state.setLoading)
  const setError = useTaskStore((state) => state.setError)
  const setShowCreateForm = useTaskStore((state) => state.setShowCreateForm)

  // Use the useTasks hook for Supabase integration
  const { tasks, loading, error } = useTasks()

  // Sync tasks from useTasks hook to Zustand store
  // Note: This is now handled directly in useTasks hook via updateTasksState
  // Keeping this as a backup sync
  useEffect(() => {
    setTasks(tasks)
  }, [tasks, setTasks])

  // Sync loading and error states
  useEffect(() => {
    setLoading(loading)
  }, [loading, setLoading])

  useEffect(() => {
    setError(error)
  }, [error, setError])

  // Keep ref in sync with pending transitions
  const pendingTransitionsRef = useRef(pendingTransitions)

  useEffect(() => {
    pendingTransitionsRef.current = pendingTransitions
  }, [pendingTransitions])

  // Cleanup pending transitions on unmount
  useEffect(() => {
    return () => {
      pendingTransitionsRef.current.forEach((pending) => {
        clearTimeout(pending.timeoutId)
      })
    }
  }, [])

  return (
    <div className="App">
      <Header />

      <main className="main-content">
        <div className="main-layout">
          <div className="container">
            <div className="tasks-section">
              <div className="section-header">
                <ViewTabs />
                {currentView === 'active' && (
                  <div className="header-actions">
                    <SortDropdown />
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
                <TaskForm onCancel={() => setShowCreateForm(false)} />
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
              ) : (
                <TaskList />
              )}
            </div>
          </div>

          <Sidebar />
        </div>
      </main>
    </div>
  )
}

export default App


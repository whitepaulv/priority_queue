/**
 * Main React application component.
 * Root component that contains the application layout and routing.
 */

import { useState, useEffect } from 'react'
import './App.css'

function App() {
  console.log('App component rendering...')
  const [tasks, setTasks] = useState([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    console.log('App useEffect running, fetching tasks...')
    // Fetch tasks from API (using Vite proxy)
    fetch('/api/tasks')
      .then(res => {
        if (!res.ok) {
          throw new Error(`API error: ${res.status}`)
        }
        return res.json()
      })
      .then(data => {
        // Handle both array and object responses
        const tasksList = Array.isArray(data) ? data : (data.tasks || [])
        setTasks(tasksList)
        setError(null)
      })
      .catch(err => {
        console.error('Error fetching tasks:', err)
        setError(err.message)
        // Don't crash the app if API isn't ready
        setTasks([])
      })
      .finally(() => {
        setLoading(false)
      })
  }, [])

  console.log('App render - loading:', loading, 'error:', error, 'tasks:', tasks.length)

  return (
    <div className="App" style={{ minHeight: '100vh', backgroundColor: '#667eea', padding: '20px' }}>
      <header className="App-header">
        <h1 style={{ color: 'white', margin: 0 }}>PriorityForge</h1>
        <p style={{ color: 'white' }}>Task Management with Intelligent Prioritization</p>
      </header>
      <main>
        {/* Task list and management UI will go here */}
        <div className="task-container" style={{ backgroundColor: 'white', padding: '2rem', marginTop: '2rem', borderRadius: '12px' }}>
          <h2>Tasks</h2>
          {loading ? (
            <p>Loading tasks...</p>
          ) : error ? (
            <div>
              <p style={{ color: 'red' }}>Error: {error}</p>
              <p>Make sure the backend is running on http://localhost:8000</p>
            </div>
          ) : tasks.length === 0 ? (
            <p>No tasks yet. Create your first task!</p>
          ) : (
            <ul>
              {tasks.map(task => (
                <li key={task.id}>{task.title}</li>
              ))}
            </ul>
          )}
        </div>
      </main>
    </div>
  )
}

export default App


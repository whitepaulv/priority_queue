/**
 * React application entry point.
 * Initializes the React app and renders the root component.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import ErrorBoundary from './ErrorBoundary.jsx'
import './index.css'

// Check if root element exists
console.log('Starting React app initialization...')
const rootElement = document.getElementById('root')
console.log('Root element:', rootElement)

if (!rootElement) {
  console.error('Root element not found!')
  throw new Error('Root element not found!')
}

try {
  console.log('Creating React root...')
  const root = ReactDOM.createRoot(rootElement)
  console.log('React root created, rendering...')
  
  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
  
  console.log('React app rendered successfully!')
} catch (error) {
  console.error('Failed to render app:', error)
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; background: red; color: white;">
        <h1>Failed to load app</h1>
        <p>${error.message}</p>
        <p>Check the console for details.</p>
      </div>
    `
  }
}


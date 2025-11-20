/**
 * React application entry point.
 * Initializes the React app and renders the root component.
 */

import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './components/App'
import ErrorBoundary from './ErrorBoundary'
import './index.css'

// Check if root element exists
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error('Root element not found!')
}

try {
  const root = ReactDOM.createRoot(rootElement)

  root.render(
    <React.StrictMode>
      <ErrorBoundary>
        <App />
      </ErrorBoundary>
    </React.StrictMode>,
  )
} catch (error) {
  console.error('Failed to render app:', error)
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 2rem; text-align: center; background: red; color: white;">
        <h1>Failed to load app</h1>
        <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
        <p>Check the console for details.</p>
      </div>
    `
  }
}


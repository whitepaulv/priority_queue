/**
 * View tabs component for switching between active and history views.
 */

import React from 'react'
import { useTaskStore } from '../store/useTaskStore'
import type { ViewMode } from '../types'

const ViewTabs: React.FC = () => {
  const currentView = useTaskStore((state) => state.currentView)
  const setCurrentView = useTaskStore((state) => state.setCurrentView)
  const setShowCreateForm = useTaskStore((state) => state.setShowCreateForm)
  const setEditingTaskId = useTaskStore((state) => state.setEditingTaskId)

  const handleViewChange = (view: ViewMode) => {
    setCurrentView(view)
    setShowCreateForm(false)
    setEditingTaskId(null)
  }

  return (
    <div className="view-tabs">
      <button
        className={`view-tab ${currentView === 'active' ? 'active' : ''}`}
        onClick={() => handleViewChange('active')}
      >
        activeTasks
      </button>
      <button
        className={`view-tab ${currentView === 'history' ? 'active' : ''}`}
        onClick={() => handleViewChange('history')}
      >
        history
      </button>
    </div>
  )
}

export default ViewTabs


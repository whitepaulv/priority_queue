/**
 * Sort dropdown component for sorting tasks.
 */

import React from 'react'
import { useTaskStore } from '../store/useTaskStore'
import type { SortBy } from '../types'

const SortDropdown: React.FC = () => {
  const sortBy = useTaskStore((state) => state.sortBy)
  const setSortBy = useTaskStore((state) => state.setSortBy)

  return (
    <div className="sort-dropdown-wrapper">
      <span className="sort-label">sort:</span>
      <select
        className="sort-dropdown"
        value={sortBy}
        onChange={(e) => setSortBy(e.target.value as SortBy)}
      >
        <option value="difficulty">difficulty</option>
        <option value="urgency">urgency</option>
        <option value="due_date">dueDate</option>
      </select>
    </div>
  )
}

export default SortDropdown


/**
 * Header component with title and subtitle.
 */

import React from 'react'

const Header: React.FC = () => {
  return (
    <header className="App-header">
      <div className="header-content">
        <h1>priorityForge</h1>
        <p className="subtitle">taskManagement</p>
      </div>
    </header>
  )
}

export default Header


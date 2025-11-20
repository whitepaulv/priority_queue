/**
 * Sidebar component for AI assistant.
 */

import React from 'react'
import ChatPanel from './ChatPanel'

const Sidebar: React.FC = () => {
  return (
    <aside className="assistant-sidebar">
      <div className="assistant-header">
        <h3>aiAssistant</h3>
      </div>
      <div className="assistant-content">
        <div className="robot-container">
          <img
            src="/robot_sprite.png"
            alt="AI Assistant Robot"
            className="robot-sprite-image"
          />
        </div>
        <ChatPanel />
      </div>
    </aside>
  )
}

export default Sidebar


/**
 * Chat panel component for AI assistant interaction.
 */

import React, { useEffect, useRef } from 'react'
import { useChatStore } from '../store/useChatStore'
import { aiApi } from '../services/api'

const ChatPanel: React.FC = () => {
  const chatMessage = useChatStore((state) => state.chatMessage)
  const chatHistory = useChatStore((state) => state.chatHistory)
  const displayedText = useChatStore((state) => state.displayedText)
  const isTyping = useChatStore((state) => state.isTyping)
  const setChatMessage = useChatStore((state) => state.setChatMessage)
  const setChatHistory = useChatStore((state) => state.setChatHistory)
  const setDisplayedText = useChatStore((state) => state.setDisplayedText)
  const setIsTyping = useChatStore((state) => state.setIsTyping)

  const textareaRef = useRef<HTMLTextAreaElement>(null)

  // Typing animation effect
  useEffect(() => {
    const lastAssistantMessage = chatHistory
      .filter((msg) => msg.role === 'assistant')
      .slice(-1)[0]

    if (lastAssistantMessage && lastAssistantMessage.text) {
      const fullText = lastAssistantMessage.text
      setDisplayedText('')
      setIsTyping(true)

      let currentIndex = 0
      let timeoutId: NodeJS.Timeout | null = null
      let cancelled = false

      const typeChar = () => {
        if (cancelled) return

        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.substring(0, currentIndex + 1))
          currentIndex++
          timeoutId = setTimeout(typeChar, 15)
        } else {
          setIsTyping(false)
        }
      }

      timeoutId = setTimeout(typeChar, 100)

      return () => {
        cancelled = true
        if (timeoutId) {
          clearTimeout(timeoutId)
        }
        setIsTyping(false)
      }
    }
  }, [chatHistory, setDisplayedText, setIsTyping])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!chatMessage.trim()) return

    const userMsg = chatMessage.trim()
    setChatMessage('')

    // Reset textarea height
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }

    try {
      const response = await aiApi.chat(userMsg)
      setChatHistory([{ role: 'assistant', text: response }])
    } catch (err) {
      console.error('Error chatting with AI:', err)
      setChatHistory([
        {
          role: 'assistant',
          text: 'Sorry, I encountered an error. Please check that your API key is configured correctly.',
        },
      ])
    }
  }

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setChatMessage(e.target.value)
    // Auto-resize textarea
    e.target.style.height = 'auto'
    e.target.style.height = e.target.scrollHeight + 'px'
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      // Allow Enter to submit, Shift+Enter for new line
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      const form = (e.target as HTMLElement).closest('form')
      if (form) {
        form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }))
      }
    }
  }

  return (
    <div className="chat-container">
      {displayedText && (
        <div className="assistant-message">
          <p>
            {displayedText}
            {isTyping && <span className="typing-cursor">|</span>}
          </p>
        </div>
      )}

      <form className="chat-input-form" onSubmit={handleSubmit}>
        <textarea
          ref={textareaRef}
          value={chatMessage}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder="typeMessageHere"
          className="chat-input"
          rows={1}
        />
        <button type="submit" className="chat-send-btn">
          send
        </button>
      </form>
    </div>
  )
}

export default ChatPanel


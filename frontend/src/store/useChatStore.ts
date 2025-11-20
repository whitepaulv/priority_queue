/**
 * Zustand store for AI chat state.
 */

import { create } from 'zustand'
import type { ChatMessage } from '../types'

interface ChatStore {
  // State
  chatMessage: string
  chatHistory: ChatMessage[]
  displayedText: string
  isTyping: boolean
  
  // Actions
  setChatMessage: (message: string) => void
  setChatHistory: (history: ChatMessage[]) => void
  setDisplayedText: (text: string) => void
  setIsTyping: (typing: boolean) => void
  addChatMessage: (message: ChatMessage) => void
}

export const useChatStore = create<ChatStore>((set) => ({
  // Initial state
  chatMessage: '',
  chatHistory: [],
  displayedText: 'Hi there! Let me know if you need any help!',
  isTyping: false,
  
  // Actions
  setChatMessage: (chatMessage) => set({ chatMessage }),
  setChatHistory: (chatHistory) => set({ chatHistory }),
  setDisplayedText: (displayedText) => set({ displayedText }),
  setIsTyping: (isTyping) => set({ isTyping }),
  addChatMessage: (message) =>
    set((state) => ({
      chatHistory: [...state.chatHistory, message],
    })),
}))


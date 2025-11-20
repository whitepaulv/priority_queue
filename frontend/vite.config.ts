/**
 * Vite configuration file.
 * Build tool configuration for the React frontend application.
 */

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8000',
        changeOrigin: true,
        // Keep the /api prefix since backend routes are at /api/*
        secure: false,
      },
    },
  },
})


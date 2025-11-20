/**
 * Utility functions for date formatting and calculations.
 */

export const formatDueDate = (dateString: string | null | undefined): string | null => {
  if (!dateString) return null
  
  // Parse date and normalize to midnight local time for consistent comparison
  const date = new Date(dateString)
  date.setHours(0, 0, 0, 0)
  
  const now = new Date()
  now.setHours(0, 0, 0, 0)
  
  const diffTime = date.getTime() - now.getTime()
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays < 0) {
    return `${Math.abs(diffDays)}dOverdue`
  } else if (diffDays === 0) {
    return 'today'
  } else if (diffDays === 1) {
    return 'tomorrow'
  } else if (diffDays <= 7) {
    return `${diffDays}d`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }
}

export const calculateDateFromDays = (days: number | null | undefined): string | null => {
  if (days === null || days === undefined) return null
  const numDays = parseInt(String(days))
  if (isNaN(numDays)) return null
  
  // Create date at midnight local time to avoid timezone issues
  const date = new Date()
  date.setHours(0, 0, 0, 0) // Set to midnight local time
  date.setDate(date.getDate() + numDays)
  
  // Format as YYYY-MM-DD to store as date-only (no time component)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}T00:00:00`
}

export const formatDatePreview = (days: number | null | undefined): string => {
  if (days === null || days === undefined) return ''
  const numDays = parseInt(String(days))
  if (isNaN(numDays)) return ''
  
  // Calculate date at midnight local time
  const date = new Date()
  date.setHours(0, 0, 0, 0)
  date.setDate(date.getDate() + numDays)
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const year = String(date.getFullYear()).slice(-2)
  return `${month}/${day}/${year}`
}

export const formatCompletedDate = (dateString: string | null | undefined): string => {
  if (!dateString) return 'unknown'
  
  const date = new Date(dateString)
  const now = new Date()
  const diffTime = now.getTime() - date.getTime()
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24))
  
  if (diffDays === 0) {
    // Check if it was today
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const compDate = new Date(date)
    compDate.setHours(0, 0, 0, 0)
    
    if (compDate.getTime() === today.getTime()) {
      return 'today'
    }
    return 'today'
  } else if (diffDays === 1) {
    return 'yesterday'
  } else if (diffDays < 7) {
    return `${diffDays}dAgo`
  } else if (diffDays < 30) {
    const weeks = Math.floor(diffDays / 7)
    return `${weeks}wAgo`
  } else {
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }
}


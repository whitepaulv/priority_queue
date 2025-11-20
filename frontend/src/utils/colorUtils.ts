/**
 * Utility functions for color calculations.
 */

export const getPriorityColor = (urgency: number, difficulty: number): string => {
  const score = urgency * 0.6 + difficulty * 0.4
  // Subtle opacity-based priority indicator
  if (score >= 4.5) return 'rgba(255, 255, 255, 0.16)'
  if (score >= 3.5) return 'rgba(255, 255, 255, 0.12)'
  if (score >= 2.5) return 'rgba(255, 255, 255, 0.08)'
  return 'rgba(255, 255, 255, 0.04)'
}

export const getUrgencyBorderColor = (urgency: number): string => {
  // Get border color based on urgency level
  switch (urgency) {
    case 1:
      return '#2d5016' // dark green
    case 2:
      return '#5a9a3a' // light green
    case 3:
      return '#e6c200' // yellow
    case 4:
      return '#e67e7e' // light red
    case 5:
      return '#8b0000' // dark red
    default:
      return '#e6c200' // default to yellow
  }
}


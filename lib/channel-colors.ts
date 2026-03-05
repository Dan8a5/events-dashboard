// Predefined colors for common channels
const channelColorMap: Record<string, string> = {
  // E-commerce
  orders: "#10b981",      // emerald
  payments: "#3b82f6",    // blue
  signups: "#8b5cf6",     // violet
  reviews: "#f59e0b",     // amber
  support: "#ef4444",     // red
  marketing: "#ec4899",   // pink
  
  // SaaS
  auth: "#6366f1",        // indigo
  billing: "#10b981",     // emerald
  errors: "#ef4444",      // red
  features: "#8b5cf6",    // violet
  onboarding: "#06b6d4",  // cyan
  
  // DevOps
  deploys: "#22c55e",     // green
  builds: "#f59e0b",      // amber
  alerts: "#ef4444",      // red
  metrics: "#3b82f6",     // blue
  
  // Metals
  gold: "#f59e0b",        // amber
  silver: "#94a3b8",      // slate
  platinum: "#e2e8f0",    // light slate
  palladium: "#a78bfa",   // violet

  // General
  system: "#64748b",      // slate
  notifications: "#f97316", // orange
  users: "#8b5cf6",       // violet
  api: "#06b6d4",         // cyan
}

// Generate a consistent color from a string (for unknown channels)
function stringToColor(str: string): string {
  let hash = 0
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash)
  }
  
  // Use a set of visually pleasing colors
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#84cc16",
    "#22c55e", "#10b981", "#14b8a6", "#06b6d4",
    "#0ea5e9", "#3b82f6", "#6366f1", "#8b5cf6",
    "#a855f7", "#d946ef", "#ec4899", "#f43f5e"
  ]
  
  const index = Math.abs(hash) % colors.length
  return colors[index]
}

export function getChannelColor(channel: string): string {
  const normalizedChannel = channel.toLowerCase()
  return channelColorMap[normalizedChannel] || stringToColor(channel)
}

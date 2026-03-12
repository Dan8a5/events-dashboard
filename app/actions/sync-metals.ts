"use server"

import { syncMetals } from "@/lib/sync-metals"

let lastSyncTime = 0
const RATE_LIMIT_MS = 60_000 // 1 minute

export async function syncMetalsAction() {
  const now = Date.now()
  if (now - lastSyncTime < RATE_LIMIT_MS) {
    const secondsLeft = Math.ceil((RATE_LIMIT_MS - (now - lastSyncTime)) / 1000)
    return { error: `Rate limited — please wait ${secondsLeft}s before syncing again`, status: 429 }
  }
  lastSyncTime = now
  return syncMetals()
}

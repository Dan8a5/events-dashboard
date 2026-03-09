"use server"

import { syncMetals } from "@/lib/sync-metals"

export async function syncMetalsAction() {
  return syncMetals()
}

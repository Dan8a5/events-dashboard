import { NextResponse } from "next/server"
import { syncMetals } from "@/lib/sync-metals"

// GET — triggered by Vercel Cron (includes Authorization header with CRON_SECRET)
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET

  if (!cronSecret) {
    return NextResponse.json(
      { error: "Server configuration error: CRON_SECRET is not set" },
      { status: 500 }
    )
  }

  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const result = await syncMetals()
  const { status, ...body } = result
  return NextResponse.json(body, { status })
}

import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const TEMPLATES = [
  { channel: "auth", title: "User logged in", icon: "🔐" },
  { channel: "auth", title: "Password reset requested", icon: "🔑" },
  { channel: "auth", title: "New session started", icon: "✅" },
  { channel: "payments", title: "Payment processed", icon: "💳" },
  { channel: "payments", title: "Subscription renewed", icon: "🔄" },
  { channel: "payments", title: "Refund issued", icon: "↩️" },
  { channel: "errors", title: "500 Internal Server Error", icon: "🔴", tags: ["critical"] },
  { channel: "errors", title: "Database timeout", icon: "⚠️", tags: ["db"] },
  { channel: "signups", title: "New user registered", icon: "🎉" },
  { channel: "signups", title: "Email verified", icon: "📧" },
  { channel: "api", title: "Rate limit exceeded", icon: "🚫", tags: ["rate-limit"] },
  { channel: "api", title: "Webhook delivered", icon: "📤" },
  { channel: "jobs", title: "Background job completed", icon: "✅" },
  { channel: "jobs", title: "Job failed after retries", icon: "❌", tags: ["failed"] },
  { channel: "alerts", title: "High memory usage", icon: "📈", tags: ["infra"] },
]

export async function POST(request: Request) {
  try {
    const { projectId, count } = await request.json()

    const allowedCounts = [25, 50, 100, 250]
    if (!projectId || count === undefined || count === null) {
      return NextResponse.json({ error: "Missing projectId or count" }, { status: 400 })
    }

    if (typeof count !== "number" || !Number.isInteger(count) || !allowedCounts.includes(count)) {
      return NextResponse.json({ error: "Invalid count. Allowed values are 25, 50, 100, or 250." }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { data: project } = await supabase
      .from("projects")
      .select("id, name")
      .eq("id", projectId)
      .single()

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 })
    }

    if (project.name === "Metals Tracker") {
      return NextResponse.json({ error: "Cannot seed events into this project" }, { status: 403 })
    }

    const events = Array.from({ length: count }, () => {
      const template = TEMPLATES[Math.floor(Math.random() * TEMPLATES.length)]
      return {
        project_id: projectId,
        channel: template.channel,
        title: template.title,
        icon: template.icon ?? null,
        description: "description" in template ? template.description ?? null : null,
        tags: "tags" in template ? template.tags ?? [] : [],
        created_at: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
      }
    })

    const { error } = await supabase.from("events").insert(events)

    if (error) {
      return NextResponse.json({ error: "Failed to insert events", details: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, count })
  } catch (error) {
    console.error("Seed events error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

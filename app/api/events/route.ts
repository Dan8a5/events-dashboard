import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"
import type { EventInput } from "@/lib/types"

export async function POST(request: NextRequest) {
  try {
    // Get API key from header
    const apiKey = request.headers.get("x-api-key")
    
    if (!apiKey) {
      return NextResponse.json(
        { error: "Missing API key. Include x-api-key header." },
        { status: 401 }
      )
    }

    // Validate API key and get project
    const supabase = createAdminClient()
    const { data: project, error: projectError } = await supabase
      .from("projects")
      .select("id")
      .eq("api_key", apiKey)
      .single()

    if (projectError || !project) {
      return NextResponse.json(
        { error: "Invalid API key" },
        { status: 401 }
      )
    }

    // Parse request body
    const body: EventInput = await request.json()

    // Validate required fields
    if (!body.channel || typeof body.channel !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'channel' field" },
        { status: 400 }
      )
    }

    if (!body.title || typeof body.title !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid 'title' field" },
        { status: 400 }
      )
    }

    // Insert event
    const { data: event, error: insertError } = await supabase
      .from("events")
      .insert({
        project_id: project.id,
        channel: body.channel.trim(),
        title: body.title.trim(),
        description: body.description?.trim() || null,
        icon: body.icon?.trim() || null,
        tags: body.tags || [],
      })
      .select()
      .single()

    if (insertError) {
      console.error("Error inserting event:", insertError)
      return NextResponse.json(
        { error: "Failed to create event" },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, event }, { status: 201 })
  } catch (error) {
    console.error("Error processing request:", error)
    return NextResponse.json(
      { error: "Invalid request body" },
      { status: 400 }
    )
  }
}

// Allow CORS for external services to send events
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, x-api-key",
    },
  })
}

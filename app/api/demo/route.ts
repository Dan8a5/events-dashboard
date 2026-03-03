import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { ecommerceDemo, flattenTags, minutesAgoToTimestamp } from "@/lib/demo-data/ecommerce"
import { saasDemo } from "@/lib/demo-data/saas"

type DemoScenario = "ecommerce" | "saas"

const demos = {
  ecommerce: ecommerceDemo,
  saas: saasDemo
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const scenario = (searchParams.get("scenario") || "ecommerce") as DemoScenario
    const demo = demos[scenario]

    const supabase = createAdminClient()

    // Find the demo project
    const { data: project } = await supabase
      .from("projects")
      .select("id")
      .eq("name", demo.project.name)
      .single()

    if (!project) {
      return NextResponse.json(
        { error: "Demo project not found" },
        { status: 404 }
      )
    }

    // Delete the project (events will cascade delete)
    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", project.id)

    if (error) {
      return NextResponse.json(
        { error: "Failed to delete demo project", details: error.message },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      message: "Demo data removed successfully"
    })

  } catch (error) {
    console.error("Demo delete error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const scenario = (searchParams.get("scenario") || "ecommerce") as DemoScenario
    const demo = demos[scenario]

    const supabase = createAdminClient()

    // Check if project already exists
    const { data: existingProject } = await supabase
      .from("projects")
      .select("id")
      .eq("name", demo.project.name)
      .single()

    let projectId: string

    if (existingProject) {
      projectId = existingProject.id
      
      // Delete existing events for this project to reset demo
      await supabase
        .from("events")
        .delete()
        .eq("project_id", projectId)
    } else {
      // Create the demo project
      const { data: newProject, error: projectError } = await supabase
        .from("projects")
        .insert({ name: demo.project.name })
        .select("id")
        .single()

      if (projectError || !newProject) {
        return NextResponse.json(
          { error: "Failed to create project" },
          { status: 500 }
        )
      }

      projectId = newProject.id
    }

    // Transform and insert all events
    const eventsToInsert = demo.events.map((event) => ({
      project_id: projectId,
      channel: event.channel,
      title: event.title,
      description: event.description,
      icon: event.icon,
      tags: flattenTags(event.tags as Record<string, unknown>),
      created_at: minutesAgoToTimestamp(event.minutes_ago)
    }))

    const { error: eventsError } = await supabase
      .from("events")
      .insert(eventsToInsert)

    if (eventsError) {
      return NextResponse.json(
        { error: "Failed to insert events", details: eventsError.message },
        { status: 500 }
      )
    }

    // Get the project with API key to return
    const { data: project } = await supabase
      .from("projects")
      .select("*")
      .eq("id", projectId)
      .single()

    return NextResponse.json({
      success: true,
      message: `Loaded ${eventsToInsert.length} events for ${demo.project.name}`,
      project,
      eventsCount: eventsToInsert.length
    })

  } catch (error) {
    console.error("Demo load error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

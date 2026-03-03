import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardContent } from "@/components/dashboard-content"
import type { Event, Project } from "@/lib/types"

export const dynamic = "force-dynamic"

export default async function DashboardPage() {
  const supabase = await createClient()

  // Fetch projects
  const { data: projects } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  // Fetch events, ordered by most recent first
  const { data: events, error } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(100)

  if (error) {
    console.error("Error fetching events:", error)
  }

  const projectList: Project[] = projects || []
  const eventList: Event[] = events || []

  // Get unique channels for filtering
  const channels = [...new Set(eventList.map((e) => e.channel))].sort()

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <DashboardContent 
          initialEvents={eventList} 
          channels={channels} 
          projects={projectList}
        />
      </main>
    </div>
  )
}

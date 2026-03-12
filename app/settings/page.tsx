import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { ProjectForm } from "@/components/project-form"
import { ProjectCard } from "@/components/project-card"
import { LoadDemoData } from "@/components/load-demo-data"
import { MetalsSync } from "@/components/metals-sync"
import { SeedEvents } from "@/components/seed-events"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import type { Project } from "@/lib/types"
import { METALS_PROJECT_NAME } from "@/lib/constants"
import { headers } from "next/headers"

export const dynamic = "force-dynamic"

export default async function SettingsPage() {
  const supabase = await createClient()
  const headersList = await headers()

  // Get the host for the API URL
  const host = headersList.get("host") || "localhost:3000"
  const protocol = host.includes("localhost") ? "http" : "https"
  const apiUrl = `${protocol}://${host}`

  // Fetch all projects
  const { data: projects, error } = await supabase
    .from("projects")
    .select("*")
    .order("created_at", { ascending: false })

  if (error) {
    console.error("Error fetching projects:", error)
  }

  const projectList: Project[] = (projects || []).filter(p => p.name !== METALS_PROJECT_NAME)

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-3xl mx-auto space-y-6">
          <div>
            <h2 className="text-2xl font-bold text-foreground">Settings</h2>
            <p className="text-muted-foreground mt-1">
              Manage your projects and API keys
            </p>
          </div>

          <LoadDemoData />

          <MetalsSync />

          <SeedEvents projects={projectList} />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">Create New Project</CardTitle>
              <CardDescription>
                Each project gets a unique API key for sending events
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProjectForm />
            </CardContent>
          </Card>

          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Your Projects</h3>
            {projectList.length === 0 ? (
              <Card>
                <CardContent className="py-8 text-center">
                  <p className="text-muted-foreground">
                    No projects yet. Create one to get started.
                  </p>
                </CardContent>
              </Card>
            ) : (
              projectList.map((project) => (
                <ProjectCard key={project.id} project={project} apiUrl={apiUrl} />
              ))
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

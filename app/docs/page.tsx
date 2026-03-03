import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { DocsContent } from "@/components/docs-content"

export const metadata = {
  title: "API Documentation - Events Dashboard",
  description: "Learn how to integrate with the Events Dashboard API",
}

export default async function DocsPage() {
  const supabase = await createClient()
  const { data: projects } = await supabase
    .from("projects")
    .select("api_key")
    .limit(1)
    .single()

  const apiKey = projects?.api_key || ""

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <DocsContent apiKey={apiKey} />
    </div>
  )
}

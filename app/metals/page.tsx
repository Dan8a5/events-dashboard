import { createClient } from "@/lib/supabase/server"
import { DashboardHeader } from "@/components/dashboard-header"
import { MetalsPriceChart } from "@/components/metals-price-chart"
import { MetalsSync } from "@/components/metals-sync"
import type { Event } from "@/lib/types"

export const dynamic = "force-dynamic"

const METALS_PROJECT_NAME = "Metals Tracker"
const METAL_CHANNELS = ["gold", "silver", "platinum", "palladium"]

export default async function MetalsPage() {
  const supabase = await createClient()

  const { data: project } = await supabase
    .from("projects")
    .select("id")
    .eq("name", METALS_PROJECT_NAME)
    .single()

  let events: Event[] = []
  if (project) {
    const { data } = await supabase
      .from("events")
      .select("*")
      .eq("project_id", project.id)
      .in("channel", METAL_CHANNELS)
      .order("created_at", { ascending: true })
      .limit(500)

    events = data || []
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-foreground">Metals Prices</h2>
              <p className="text-muted-foreground mt-1">
                Live precious metals spot prices — synced hourly from Metal Price API
              </p>
            </div>
          </div>

          <MetalsPriceChart events={events} hasProject={!!project} />

          <div className="max-w-sm">
            <MetalsSync />
          </div>
        </div>
      </main>
    </div>
  )
}

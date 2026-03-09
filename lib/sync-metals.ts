import { createAdminClient } from "@/lib/supabase/admin"

const METALS_PROJECT_NAME = "Metals Tracker"
const SYMBOLS = ["XAU", "XAG", "XPT", "XPD"]

const SYMBOL_META: Record<string, { name: string; icon: string; channel: string }> = {
  XAU: { name: "Gold",      icon: "🥇", channel: "gold"      },
  XAG: { name: "Silver",    icon: "🥈", channel: "silver"    },
  XPT: { name: "Platinum",  icon: "⬜", channel: "platinum"  },
  XPD: { name: "Palladium", icon: "🔘", channel: "palladium" },
}

export type SyncResult =
  | { success: true; eventsCreated: number; prices: Record<string, string>; status: 200 }
  | { error: string; status: number }

export async function syncMetals(): Promise<SyncResult> {
  const apiKey = process.env.METALS_API_KEY

  if (!apiKey) {
    return { error: "METALS_API_KEY is not configured", status: 500 }
  }

  let data: { success: boolean; rates: Record<string, number>; error?: { info: string } }
  try {
    const res = await fetch(
      `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=${SYMBOLS.join(",")}`,
      { cache: "no-store" }
    )
    if (!res.ok) {
      return { error: `Metal Price API request failed: ${res.statusText}`, status: 502 }
    }
    data = await res.json()
  } catch {
    return { error: "Failed to fetch or parse response from Metal Price API", status: 502 }
  }

  if (!data.success) {
    return { error: data.error?.info || "Metal Price API returned an error", status: 502 }
  }

  const supabase = createAdminClient()

  let projectId: string
  const { data: existingProject } = await supabase
    .from("projects")
    .select("id")
    .eq("name", METALS_PROJECT_NAME)
    .single()

  if (existingProject) {
    projectId = existingProject.id
  } else {
    const { data: newProject, error } = await supabase
      .from("projects")
      .insert({ name: METALS_PROJECT_NAME })
      .select("id")
      .single()

    if (error || !newProject) {
      return { error: "Failed to create Metals Tracker project", status: 500 }
    }

    projectId = newProject.id
  }

  const { data: lastEvents } = await supabase
    .from("events")
    .select("channel, description, created_at")
    .eq("project_id", projectId)
    .in("channel", ["gold", "silver", "platinum", "palladium"])
    .order("created_at", { ascending: false })
    .limit(4)

  const eventsToInsert: {
    project_id: string
    channel: string
    title: string
    description: string
    icon: string
    tags: string[]
  }[] = []

  const prices: Record<string, string> = {}

  for (const symbol of SYMBOLS) {
    const rate = data.rates[symbol]
    if (!rate) continue

    const meta = SYMBOL_META[symbol]
    const pricePerOz = 1 / rate
    prices[symbol] = `$${pricePerOz.toFixed(2)}`

    eventsToInsert.push({
      project_id: projectId,
      channel: meta.channel,
      title: `${meta.name} price update`,
      description: `${symbol}/USD: $${pricePerOz.toFixed(2)} per troy oz`,
      icon: meta.icon,
      tags: [symbol, "USD", "spot-price"],
    })

    const lastEvent = lastEvents?.find((e) => e.channel === meta.channel)
    if (lastEvent?.description) {
      const match = lastEvent.description.match(/\$([0-9.]+)/)
      if (match) {
        const previousPrice = parseFloat(match[1])
        const changePct = ((pricePerOz - previousPrice) / previousPrice) * 100

        if (Math.abs(changePct) >= 1) {
          const direction = changePct > 0 ? "up" : "down"
          const arrow = changePct > 0 ? "📈" : "📉"

          eventsToInsert.push({
            project_id: projectId,
            channel: "alerts",
            title: `${meta.name} moved ${direction} ${Math.abs(changePct).toFixed(2)}%`,
            description: `${meta.name} ${direction} from $${previousPrice.toFixed(2)} to $${pricePerOz.toFixed(2)}`,
            icon: arrow,
            tags: [symbol, direction, `${Math.abs(changePct).toFixed(1)}%`],
          })
        }
      }
    }
  }

  if (eventsToInsert.length === 0) {
    return { error: "No prices returned from Metal Price API", status: 502 }
  }

  const { error: insertError } = await supabase.from("events").insert(eventsToInsert)

  if (insertError) {
    return { error: `Failed to insert events: ${insertError.message}`, status: 500 }
  }

  return { success: true, eventsCreated: eventsToInsert.length, prices, status: 200 }
}

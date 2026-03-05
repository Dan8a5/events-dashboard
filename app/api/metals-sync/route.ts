import { NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"

const METALS_PROJECT_NAME = "Metals Tracker"
const SYMBOLS = ["XAU", "XAG", "XPT", "XPD"]

const SYMBOL_META: Record<string, { name: string; icon: string; channel: string }> = {
  XAU: { name: "Gold",      icon: "🥇", channel: "gold"      },
  XAG: { name: "Silver",    icon: "🥈", channel: "silver"    },
  XPT: { name: "Platinum",  icon: "⬜", channel: "platinum"  },
  XPD: { name: "Palladium", icon: "🔘", channel: "palladium" },
}

async function syncMetals() {
  const apiKey = process.env.METALS_API_KEY

  if (!apiKey) {
    return { error: "METALS_API_KEY is not configured", status: 500 }
  }

  // Fetch latest spot prices from Metal Price API
  const res = await fetch(
    `https://api.metalpriceapi.com/v1/latest?api_key=${apiKey}&base=USD&currencies=${SYMBOLS.join(",")}`,
    { cache: "no-store" }
  )

  if (!res.ok) {
    return { error: `Metal Price API request failed: ${res.statusText}`, status: 502 }
  }

  const data = await res.json()

  if (!data.success) {
    return { error: data.error?.info || "Metal Price API returned an error", status: 502 }
  }

  const supabase = createAdminClient()

  // Get or create the Metals Tracker project
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

  // Fetch previous price events to detect significant moves
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
    // Metals API returns ounces per USD — invert to get USD per troy oz
    const pricePerOz = 1 / rate
    prices[symbol] = `$${pricePerOz.toFixed(2)}`

    // Price update event
    eventsToInsert.push({
      project_id: projectId,
      channel: meta.channel,
      title: `${meta.name} price update`,
      description: `${symbol}/USD: $${pricePerOz.toFixed(2)} per troy oz`,
      icon: meta.icon,
      tags: [symbol, "USD", "spot-price"],
    })

    // Check for significant price moves (≥1% change vs last logged price)
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

  const { error: insertError } = await supabase.from("events").insert(eventsToInsert)

  if (insertError) {
    return { error: `Failed to insert events: ${insertError.message}`, status: 500 }
  }

  return { success: true, eventsCreated: eventsToInsert.length, prices, status: 200 }
}

// POST — triggered manually from the Settings UI
export async function POST() {
  const result = await syncMetals()
  const { status, ...body } = result
  return NextResponse.json(body, { status })
}

// GET — triggered by Vercel Cron (includes Authorization header with CRON_SECRET)
export async function GET(request: Request) {
  const cronSecret = process.env.CRON_SECRET
  if (cronSecret) {
    const authHeader = request.headers.get("authorization")
    if (authHeader !== `Bearer ${cronSecret}`) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
  }

  const result = await syncMetals()
  const { status, ...body } = result
  return NextResponse.json(body, { status })
}

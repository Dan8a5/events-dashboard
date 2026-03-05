"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, CheckCircle, RefreshCw, TrendingUp } from "lucide-react"

interface SyncResult {
  eventsCreated?: number
  prices?: Record<string, string>
  error?: string
}

export function MetalsSync() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<SyncResult | null>(null)
  const router = useRouter()

  const handleSync = async () => {
    setLoading(true)
    setResult(null)

    try {
      const res = await fetch("/api/metals-sync", { method: "POST" })
      const data = await res.json()
      setResult(data)
      if (res.ok) router.refresh()
    } catch {
      setResult({ error: "Network error — could not reach the sync endpoint" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          Metals API Integration
        </CardTitle>
        <CardDescription>
          Fetch live precious metals spot prices and log them as events
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {result && !result.error && (
          <div className="flex items-start gap-2 text-sm rounded-md p-3 text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30">
            <CheckCircle className="h-4 w-4 mt-0.5 shrink-0" />
            <div className="space-y-1">
              <p className="font-medium">{result.eventsCreated} events created</p>
              {result.prices && (
                <div className="grid grid-cols-2 gap-x-6 gap-y-0.5 text-xs text-green-700 dark:text-green-300 font-mono">
                  {Object.entries(result.prices).map(([symbol, price]) => (
                    <span key={symbol}>{symbol}: {price}/oz</span>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {result?.error && (
          <div className="text-sm rounded-md p-3 text-destructive bg-destructive/10">
            {result.error}
          </div>
        )}

        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <p className="text-sm text-muted-foreground">
            Pulls spot prices for Gold, Silver, Platinum, and Palladium from the Metals API.
            Price moves of 1% or more since the last sync generate an alert event.
          </p>
          <div className="flex flex-wrap gap-2">
            {[
              { icon: "🥇", label: "Gold" },
              { icon: "🥈", label: "Silver" },
              { icon: "⬜", label: "Platinum" },
              { icon: "🔘", label: "Palladium" },
              { icon: "📈", label: "Alerts" },
            ].map(({ icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1 text-xs bg-background border border-border rounded-md px-2 py-1"
              >
                {icon} {label}
              </span>
            ))}
          </div>
          <Button onClick={handleSync} disabled={loading} size="sm" className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Syncing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Sync Now
              </>
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground">
          Requires <code className="font-mono bg-muted px-1 py-0.5 rounded">METALS_API_KEY</code> in your environment variables.
          Auto-syncs hourly when deployed to Vercel.
        </p>
      </CardContent>
    </Card>
  )
}

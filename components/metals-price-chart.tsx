"use client"

import { useMemo } from "react"
import type { Event } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { LineChart, Line, XAxis, YAxis } from "recharts"
import { TrendingUp, TrendingDown } from "lucide-react"
import { format, subHours } from "date-fns"
import { getChannelColor } from "@/lib/channel-colors"

const METALS = [
  { channel: "gold",      symbol: "XAU", name: "Gold",      icon: "🥇" },
  { channel: "silver",    symbol: "XAG", name: "Silver",    icon: "🥈" },
  { channel: "platinum",  symbol: "XPT", name: "Platinum",  icon: "⬜" },
  { channel: "palladium", symbol: "XPD", name: "Palladium", icon: "🔘" },
]

function parsePrice(description: string | null): number | null {
  if (!description) return null
  const match = description.match(/\$([0-9]+\.?[0-9]*)/)
  return match ? parseFloat(match[1]) : null
}

interface MetalsPriceChartProps {
  events: Event[]
  hasProject: boolean
}

export function MetalsPriceChart({ events, hasProject }: MetalsPriceChartProps) {
  const metalData = useMemo(() => {
    return METALS.map((metal) => {
      const channelEvents = [...events]
        .filter((e) => e.channel === metal.channel)
        .sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())

      const chartData = channelEvents
        .map((e) => {
          const price = parsePrice(e.description)
          if (price === null) return null
          return {
            time: format(new Date(e.created_at), "MMM d HH:mm"),
            price,
          }
        })
        .filter(Boolean) as { time: string; price: number }[]

      const currentPrice = chartData[chartData.length - 1]?.price ?? null

      // Find oldest price within the last 24h to calculate the 24h change
      const cutoff = subHours(new Date(), 24)
      const oldest24h = channelEvents
        .filter((e) => new Date(e.created_at) >= cutoff)
        .map((e) => parsePrice(e.description))
        .find((p) => p !== null) ?? null

      const change24h = currentPrice !== null && oldest24h !== null ? currentPrice - oldest24h : null
      const changePct24h = change24h !== null && oldest24h !== null && oldest24h !== 0 ? (change24h / oldest24h) * 100 : null

      return { ...metal, chartData, currentPrice, change24h, changePct24h }
    })
  }, [events])

  if (!hasProject) {
    return (
      <Card>
        <CardContent className="py-16 text-center space-y-2">
          <p className="text-muted-foreground font-medium">No metals data yet</p>
          <p className="text-sm text-muted-foreground">
            Go to Settings and click "Sync Now" to fetch your first prices.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Current price KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {metalData.map((metal) => (
          <Card key={metal.channel}>
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-muted-foreground font-medium">{metal.symbol}/USD</span>
                <span className="text-base">{metal.icon}</span>
              </div>
              <p className="text-xl font-bold text-foreground">
                {metal.currentPrice !== null ? `$${metal.currentPrice.toFixed(2)}` : "—"}
              </p>
              {metal.changePct24h !== null ? (
                <div
                  className={`flex items-center gap-1 text-xs mt-0.5 ${
                    metal.changePct24h >= 0 ? "text-emerald-500" : "text-red-500"
                  }`}
                >
                  {metal.changePct24h >= 0 ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {metal.changePct24h >= 0 ? "+" : ""}
                  {metal.changePct24h.toFixed(2)}% (24h)
                </div>
              ) : (
                <p className="text-xs text-muted-foreground mt-0.5">Sync more for trend</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Price charts — 2×2 grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {metalData.map((metal) => {
          const color = getChannelColor(metal.channel)
          const chartConfig = {
            price: { label: `${metal.name} (USD/oz)`, color },
          }

          if (metal.chartData.length === 0) {
            return (
              <Card key={metal.channel}>
                <CardHeader className="pb-2">
                  <CardTitle className="text-base flex items-center gap-2">
                    <span>{metal.icon}</span> {metal.name}
                  </CardTitle>
                </CardHeader>
                <CardContent className="flex items-center justify-center h-[200px]">
                  <p className="text-sm text-muted-foreground">No data — sync to populate</p>
                </CardContent>
              </Card>
            )
          }

          const prices = metal.chartData.map((d) => d.price)
          const minPrice = Math.min(...prices)
          const maxPrice = Math.max(...prices)
          const padding = (maxPrice - minPrice) * 0.15 || 5

          return (
            <Card key={metal.channel}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <span>{metal.icon}</span> {metal.name}
                </CardTitle>
                <CardDescription>{metal.symbol}/USD · per troy oz · {metal.chartData.length} data points</CardDescription>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[200px] w-full">
                  <LineChart data={metal.chartData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                    <XAxis
                      dataKey="time"
                      tickLine={false}
                      axisLine={false}
                      tickMargin={8}
                      tick={{ fontSize: 10 }}
                      interval="preserveStartEnd"
                    />
                    <YAxis
                      domain={[minPrice - padding, maxPrice + padding]}
                      tickLine={false}
                      axisLine={false}
                      tickMargin={4}
                      tick={{ fontSize: 10 }}
                      tickFormatter={(v) => `$${Number(v).toFixed(0)}`}
                      width={58}
                    />
                    <ChartTooltip
                      content={
                        <ChartTooltipContent
                          formatter={(value) => `Price: $${Number(value).toFixed(2)}`}
                        />
                      }
                    />
                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke={color}
                      strokeWidth={2}
                      dot={metal.chartData.length <= 20}
                      activeDot={{ r: 4 }}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}

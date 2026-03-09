"use client"

import { useMemo } from "react"
import type { Event } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, Cell } from "recharts"
import { getChannelColor } from "@/lib/channel-colors"

interface ChannelBreakdownChartProps {
  events: Event[]
}

export function ChannelBreakdownChart({ events }: ChannelBreakdownChartProps) {
  const chartData = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const event of events) {
      counts[event.channel] = (counts[event.channel] ?? 0) + 1
    }
    return Object.entries(counts)
      .map(([channel, count]) => ({ channel, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8)
  }, [events])

  const chartConfig = {
    count: { label: "Events" },
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Channels</CardTitle>
        <CardDescription>Event volume by channel</CardDescription>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="flex items-center justify-center h-[200px]">
            <p className="text-sm text-muted-foreground">No events yet</p>
          </div>
        ) : (
          <ChartContainer config={chartConfig} className="h-[200px] w-full">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 0, right: 10, left: 0, bottom: 0 }}
            >
              <YAxis
                dataKey="channel"
                type="category"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                width={72}
              />
              <XAxis
                type="number"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
                allowDecimals={false}
              />
              <ChartTooltip
                content={<ChartTooltipContent indicator="dot" />}
              />
              <Bar dataKey="count" radius={[0, 4, 4, 0]}>
                {chartData.map((entry) => (
                  <Cell key={entry.channel} fill={getChannelColor(entry.channel)} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

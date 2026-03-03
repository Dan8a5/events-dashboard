"use client"

import { useMemo } from "react"
import type { Event } from "@/lib/types"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis } from "recharts"
import { format, subDays, startOfDay, eachDayOfInterval } from "date-fns"

interface ActivityChartProps {
  events: Event[]
}

export function ActivityChart({ events }: ActivityChartProps) {
  const chartData = useMemo(() => {
    const now = new Date()
    const days = eachDayOfInterval({
      start: subDays(now, 6),
      end: now,
    })

    return days.map((day) => {
      const dayStart = startOfDay(day)
      const dayEnd = new Date(dayStart)
      dayEnd.setDate(dayEnd.getDate() + 1)

      const count = events.filter((event) => {
        const eventDate = new Date(event.created_at)
        return eventDate >= dayStart && eventDate < dayEnd
      }).length

      return {
        date: format(day, "MMM d"),
        events: count,
      }
    })
  }, [events])

  const chartConfig = {
    events: {
      label: "Events",
      color: "#3b82f6",
    },
  }

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base">Activity</CardTitle>
        <CardDescription>Events over the last 7 days</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="fillEvents" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="date"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tick={{ fontSize: 12 }}
              allowDecimals={false}
            />
            <ChartTooltip
              content={<ChartTooltipContent indicator="line" />}
            />
            <Area
              type="monotone"
              dataKey="events"
              stroke="#3b82f6"
              strokeWidth={2}
              fill="url(#fillEvents)"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

"use client"

import { useMemo } from "react"
import type { Event } from "@/lib/types"
import { Card, CardContent } from "@/components/ui/card"
import { Activity, Calendar, Hash, TrendingUp } from "lucide-react"
import { startOfDay, startOfHour, subHours } from "date-fns"

interface KpiCardsProps {
  events: Event[]
}

export function KpiCards({ events }: KpiCardsProps) {
  const metrics = useMemo(() => {
    const now = new Date()
    const todayStart = startOfDay(now)
    const lastHour = subHours(now, 1)
    const last24Hours = subHours(now, 24)

    const eventsToday = events.filter(
      (e) => new Date(e.created_at) >= todayStart
    ).length

    const eventsLastHour = events.filter(
      (e) => new Date(e.created_at) >= lastHour
    ).length

    const eventsLast24Hours = events.filter(
      (e) => new Date(e.created_at) >= last24Hours
    ).length

    const uniqueChannels = new Set(events.map((e) => e.channel)).size

    // Calculate trend (compare last 12 hours to previous 12 hours)
    const twelveHoursAgo = subHours(now, 12)
    const twentyFourHoursAgo = subHours(now, 24)
    
    const recentCount = events.filter(
      (e) => new Date(e.created_at) >= twelveHoursAgo
    ).length
    
    const previousCount = events.filter((e) => {
      const date = new Date(e.created_at)
      return date >= twentyFourHoursAgo && date < twelveHoursAgo
    }).length

    let trendPercent = 0
    if (previousCount > 0) {
      trendPercent = Math.round(((recentCount - previousCount) / previousCount) * 100)
    } else if (recentCount > 0) {
      trendPercent = 100
    }

    return {
      total: events.length,
      today: eventsToday,
      lastHour: eventsLastHour,
      last24Hours: eventsLast24Hours,
      channels: uniqueChannels,
      trend: trendPercent,
    }
  }, [events])

  return (
    <div className="grid grid-cols-2 gap-3">
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-blue-500/10">
              <Activity className="h-4 w-4 text-blue-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{metrics.total}</p>
              <p className="text-xs text-muted-foreground">Total Events</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-green-500/10">
              <Calendar className="h-4 w-4 text-green-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{metrics.today}</p>
              <p className="text-xs text-muted-foreground">Events Today</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-md bg-amber-500/10">
              <Hash className="h-4 w-4 text-amber-500" />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{metrics.channels}</p>
              <p className="text-xs text-muted-foreground">Channels</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-md ${metrics.trend >= 0 ? 'bg-emerald-500/10' : 'bg-red-500/10'}`}>
              <TrendingUp className={`h-4 w-4 ${metrics.trend >= 0 ? 'text-emerald-500' : 'text-red-500 rotate-180'}`} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">
                {metrics.trend >= 0 ? '+' : ''}{metrics.trend}%
              </p>
              <p className="text-xs text-muted-foreground">12h Trend</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

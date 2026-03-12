"use client"

import { useState, useEffect, useMemo } from "react"
import type { Event, Project } from "@/lib/types"
import { EventFeed } from "@/components/event-feed"
import { ActivityChart } from "@/components/activity-chart"
import { KpiCards } from "@/components/kpi-cards"
import { ProjectSelector } from "@/components/project-selector"
import { DateRangeFilter, type DateRange } from "@/components/date-range-filter"
import { createClient } from "@/lib/supabase/client"

const DATE_RANGE_HOURS: Record<Exclude<DateRange, "all">, number> = {
  "24h": 24,
  "7d": 7 * 24,
  "30d": 30 * 24,
}

interface DashboardContentProps {
  initialEvents: Event[]
  channels: string[]
  projects: Project[]
}

export function DashboardContent({
  initialEvents,
  channels: initialChannels,
  projects
}: DashboardContentProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [channels, setChannels] = useState<string[]>(initialChannels)
  const [selectedProjectId, setSelectedProjectId] = useState<string>("all")
  const [dateRange, setDateRange] = useState<DateRange>("all")
  const [now, setNow] = useState(() => Date.now())

  // Set up real-time subscription for KPI updates
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("dashboard-realtime")
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "events",
        },
        (payload) => {
          const newEvent = payload.new as Event
          setEvents((prev) => [newEvent, ...prev])

          // Update channels if new channel
          if (!channels.includes(newEvent.channel)) {
            setChannels((prev) => [...prev, newEvent.channel].sort())
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [channels])

  // Tick every minute so date-range cutoffs stay current for non-"all" ranges
  useEffect(() => {
    if (dateRange === "all") return
    const id = setInterval(() => setNow(Date.now()), 60_000)
    return () => clearInterval(id)
  }, [dateRange])

  const filteredEvents = useMemo(() => {
    let result = selectedProjectId === "all" ? events : events.filter(e => e.project_id === selectedProjectId)

    if (dateRange !== "all") {
      const cutoffMs = now - DATE_RANGE_HOURS[dateRange as Exclude<DateRange, "all">] * 60 * 60 * 1000
      result = result.filter(e => Date.parse(e.created_at) >= cutoffMs)
    }

    return result
  }, [events, selectedProjectId, dateRange, now])

  // Get channels for filtered events
  const filteredChannels = useMemo(() => {
    return [...new Set(filteredEvents.map(e => e.channel))].sort()
  }, [filteredEvents])

  // Create a project lookup map for event cards
  const projectMap = useMemo(() => {
    return projects.reduce((acc, p) => {
      acc[p.id] = p.name
      return acc
    }, {} as Record<string, string>)
  }, [projects])

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <ProjectSelector
          projects={projects}
          selectedProjectId={selectedProjectId}
          onProjectChange={setSelectedProjectId}
        />
        <DateRangeFilter value={dateRange} onChange={setDateRange} />
      </div>
      {selectedProjectId !== "all" && (
        <p className="text-sm text-muted-foreground">
          Showing events from {projects.find(p => p.id === selectedProjectId)?.name}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <EventFeed
          key={`${selectedProjectId}-${dateRange}`}
          initialEvents={filteredEvents}
          channels={filteredChannels}
          projectMap={projectMap}
          showProject={selectedProjectId === "all"}
        />
        <div className="space-y-6">
          <KpiCards events={filteredEvents} />
          <ActivityChart events={filteredEvents} />
        </div>
      </div>
    </div>
  )
}

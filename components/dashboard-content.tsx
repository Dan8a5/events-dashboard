"use client"

import { useState, useEffect, useMemo } from "react"
import type { Event, Project } from "@/lib/types"
import { EventFeed } from "@/components/event-feed"
import { ActivityChart } from "@/components/activity-chart"
import { KpiCards } from "@/components/kpi-cards"
import { ProjectSelector } from "@/components/project-selector"
import { createClient } from "@/lib/supabase/client"

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

  // Filter events by selected project
  const filteredEvents = useMemo(() => {
    if (selectedProjectId === "all") return events
    return events.filter(e => e.project_id === selectedProjectId)
  }, [events, selectedProjectId])

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
        {selectedProjectId !== "all" && (
          <p className="text-sm text-muted-foreground">
            Showing events from {projects.find(p => p.id === selectedProjectId)?.name}
          </p>
        )}
      </div>
      
      <div className="grid gap-6 lg:grid-cols-[1fr_350px]">
        <EventFeed 
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

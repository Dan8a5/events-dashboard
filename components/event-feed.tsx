"use client"

import { useState, useEffect, useMemo } from "react"
import type { Event } from "@/lib/types"
import { EventCard } from "@/components/event-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { createClient } from "@/lib/supabase/client"
import { Search, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"

interface EventFeedProps {
  initialEvents: Event[]
  channels: string[]
  projectMap?: Record<string, string>
  showProject?: boolean
}

export function EventFeed({ 
  initialEvents, 
  channels, 
  projectMap = {},
  showProject = false 
}: EventFeedProps) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [searchQuery, setSearchQuery] = useState("")

  // Sync local state when the parent project filter changes
  useEffect(() => {
    setEvents(initialEvents)
  }, [initialEvents])
  const [selectedChannel, setSelectedChannel] = useState<string>("all")
  const [pageSize, setPageSize] = useState<string>("50")
  const [currentPage, setCurrentPage] = useState(1)

  // Set up real-time subscription
  useEffect(() => {
    const supabase = createClient()

    const channel = supabase
      .channel("events-realtime")
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
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [])

  // Filter events based on search and channel
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      // Channel filter
      if (selectedChannel !== "all" && event.channel !== selectedChannel) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesTitle = event.title.toLowerCase().includes(query)
        const matchesDescription = event.description?.toLowerCase().includes(query)
        const matchesTags = event.tags?.some((tag) => tag.toLowerCase().includes(query))
        
        if (!matchesTitle && !matchesDescription && !matchesTags) {
          return false
        }
      }

      return true
    })
  }, [events, selectedChannel, searchQuery])

  // Pagination logic
  const paginatedEvents = useMemo(() => {
    if (pageSize === "all") return filteredEvents
    const size = parseInt(pageSize, 10)
    const start = (currentPage - 1) * size
    return filteredEvents.slice(start, start + size)
  }, [filteredEvents, pageSize, currentPage])

  const totalPages = useMemo(() => {
    if (pageSize === "all") return 1
    return Math.ceil(filteredEvents.length / parseInt(pageSize, 10))
  }, [filteredEvents.length, pageSize])

  // Reset to page 1 when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedChannel, pageSize])

  // Handle event deletion
  const handleDeleteEvent = (eventId: string) => {
    setEvents((prev) => prev.filter((e) => e.id !== eventId))
  }

  return (
    <Card className="flex-1">
      <CardHeader className="pb-4">
        <CardTitle className="text-base">Event Feed</CardTitle>
        <div className="flex flex-col gap-3 mt-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Select value={selectedChannel} onValueChange={setSelectedChannel}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="All channels" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All channels</SelectItem>
              {channels.map((channel) => (
                <SelectItem key={channel} value={channel}>
                  {channel}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={pageSize} onValueChange={setPageSize}>
            <SelectTrigger className="w-full sm:w-[140px]">
              <SelectValue placeholder="Per page" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="50">50 per page</SelectItem>
              <SelectItem value="100">100 per page</SelectItem>
              <SelectItem value="all">All events</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent className="p-0">
        <div className="max-h-[600px] overflow-y-auto">
          {filteredEvents.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <p className="text-muted-foreground">No events found</p>
              <p className="text-sm text-muted-foreground mt-1">
                {events.length === 0
                  ? "Send your first event using the API"
                  : "Try adjusting your filters"}
              </p>
            </div>
          ) : (
            paginatedEvents.map((event) => (
              <EventCard 
                key={event.id} 
                event={event} 
                projectName={showProject ? projectMap[event.project_id] : undefined}
                onDelete={handleDeleteEvent}
              />
            ))
          )}
        </div>
        
        {/* Pagination controls */}
        {filteredEvents.length > 0 && pageSize !== "all" && totalPages > 1 && (
          <div className="flex items-center justify-between border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing {((currentPage - 1) * parseInt(pageSize, 10)) + 1}-{Math.min(currentPage * parseInt(pageSize, 10), filteredEvents.length)} of {filteredEvents.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
                <span className="sr-only">Previous</span>
              </Button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
                <span className="sr-only">Next</span>
              </Button>
            </div>
          </div>
        )}
        
        {/* Event count for "all" mode */}
        {filteredEvents.length > 0 && pageSize === "all" && (
          <div className="border-t border-border px-4 py-3">
            <p className="text-sm text-muted-foreground">
              Showing all {filteredEvents.length} events
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

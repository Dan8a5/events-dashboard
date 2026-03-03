"use client"

import { useState, useEffect } from "react"
import type { Event } from "@/lib/types"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { formatDistanceToNow } from "date-fns"
import { Trash2, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { getChannelColor } from "@/lib/channel-colors"

interface EventCardProps {
  event: Event
  projectName?: string
  onDelete?: (eventId: string) => void
}

export function EventCard({ event, projectName, onDelete }: EventCardProps) {
  const [timeAgo, setTimeAgo] = useState<string>("")
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const updateTime = () => {
      setTimeAgo(formatDistanceToNow(new Date(event.created_at), { addSuffix: true }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000) // Update every minute
    return () => clearInterval(interval)
  }, [event.created_at])

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("events")
        .delete()
        .eq("id", event.id)

      if (!error && onDelete) {
        onDelete(event.id)
      }
    } catch (error) {
      console.error("Failed to delete event:", error)
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div className="group flex items-start gap-4 p-4 border-b border-border last:border-b-0 hover:bg-muted/50 transition-colors">
      {event.icon && (
        <div className="flex-shrink-0 text-2xl" aria-hidden="true">
          {event.icon}
        </div>
      )}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1 flex-wrap">
          {projectName && (
            <Badge variant="secondary" className="text-xs">
              {projectName}
            </Badge>
          )}
          <Badge variant="outline" className="text-xs font-medium flex items-center gap-1.5">
            <span 
              className="h-2 w-2 rounded-full flex-shrink-0" 
              style={{ backgroundColor: getChannelColor(event.channel) }}
              aria-hidden="true"
            />
            {event.channel}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {timeAgo}
          </span>
        </div>
        <h3 className="font-medium text-foreground truncate">{event.title}</h3>
        {event.description && (
          <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
            {event.description}
          </p>
        )}
        {event.tags && event.tags.length > 0 && (
          <div className="flex flex-wrap gap-1 mt-2">
            {event.tags.map((tag) => (
              <Badge key={tag} variant="secondary" className="text-xs">
                {tag}
              </Badge>
            ))}
          </div>
        )}
      </div>
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        disabled={deleting}
        className="opacity-0 group-hover:opacity-100 transition-opacity h-8 w-8 text-muted-foreground hover:text-destructive flex-shrink-0"
      >
        {deleting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Trash2 className="h-4 w-4" />
        )}
        <span className="sr-only">Delete event</span>
      </Button>
    </div>
  )
}

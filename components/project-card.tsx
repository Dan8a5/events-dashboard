"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import type { Project } from "@/lib/types"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Copy, Check, Eye, EyeOff, Trash2, Loader2 } from "lucide-react"
import { formatDistanceToNow } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

interface ProjectCardProps {
  project: Project
  apiUrl: string
}

export function ProjectCard({ project, apiUrl }: ProjectCardProps) {
  const [copied, setCopied] = useState(false)
  const [showKey, setShowKey] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const copyApiKey = async () => {
    await navigator.clipboard.writeText(project.api_key)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from("projects")
        .delete()
        .eq("id", project.id)
      
      if (error) {
        console.error("Failed to delete project:", error)
      } else {
        router.refresh()
      }
    } catch (error) {
      console.error("Error deleting project:", error)
    } finally {
      setDeleting(false)
    }
  }

  const curlExample = `curl -X POST "${apiUrl}/api/events" \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${project.api_key}" \\
  -d '{
    "channel": "orders",
    "title": "New order received",
    "description": "Order #1234 for $99.00",
    "icon": "🛒",
    "tags": ["ecommerce", "revenue"]
  }'`

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{project.name}</CardTitle>
          <div className="flex items-center gap-2">
            <Badge variant="outline">
              Created {formatDistanceToNow(new Date(project.created_at), { addSuffix: true })}
            </Badge>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon"
                  className="h-8 w-8 text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-foreground">Delete {project.name}?</AlertDialogTitle>
                  <AlertDialogDescription className="text-muted-foreground">
                    This will permanently delete this project and all its events. This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-white hover:bg-destructive/90"
                  >
                    {deleting ? (
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    ) : null}
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            API Key
          </label>
          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm font-mono overflow-hidden">
              {showKey ? project.api_key : "••••••••••••••••••••••••"}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowKey(!showKey)}
              aria-label={showKey ? "Hide API key" : "Show API key"}
            >
              {showKey ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={copyApiKey}
              aria-label="Copy API key"
            >
              {copied ? <Check className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </div>
        <div>
          <label className="text-sm font-medium text-foreground block mb-2">
            Example Request
          </label>
          <pre className="bg-muted p-4 rounded-md text-xs font-mono overflow-x-auto whitespace-pre-wrap">
            {curlExample}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}

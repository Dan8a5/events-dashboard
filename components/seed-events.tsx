"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, CheckCircle, AlertCircle, FlaskConical } from "lucide-react"
import type { Project } from "@/lib/types"

// Excluded from seeding because it is a live data project, not a test project.
const EXCLUDED_SEED_PROJECT_NAME = "Metals Tracker"

const COUNTS = [25, 50, 100, 250]

export function SeedEvents({ projects }: { projects: Project[] }) {
  const filtered = projects.filter((p) => p.name !== EXCLUDED_SEED_PROJECT_NAME)
  const [projectId, setProjectId] = useState("")
  const [count, setCount] = useState("50")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleGenerate = async () => {
    if (!projectId) return
    setLoading(true)
    setMessage(null)

    try {
      const response = await fetch("/api/seed-events", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ projectId, count: Number(count) }),
      })

      const data = await response.json()

      if (response.ok) {
        setMessage({ type: "success", text: `Generated ${data.count} events successfully` })
        router.refresh()
      } else {
        setMessage({ type: "error", text: data.error || "Something went wrong" })
      }
    } catch {
      setMessage({ type: "error", text: "Request failed" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <FlaskConical className="h-5 w-5" />
          Generate Test Events
        </CardTitle>
        <CardDescription>
          Seed a project with realistic fake events to test dashboard analytics
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div className={`flex items-center gap-2 text-sm rounded-md p-3 ${
            message.type === "success"
              ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
              : "text-destructive bg-destructive/10"
          }`}>
            {message.type === "success" ? (
              <CheckCircle className="h-4 w-4" />
            ) : (
              <AlertCircle className="h-4 w-4" />
            )}
            <span>{message.text}</span>
          </div>
        )}

        <div className="space-y-3">
          <Select value={projectId} onValueChange={setProjectId}>
            <SelectTrigger>
              <SelectValue placeholder="Select a project" />
            </SelectTrigger>
            <SelectContent>
              {filtered.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={count} onValueChange={setCount}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {COUNTS.map((n) => (
                <SelectItem key={n} value={String(n)}>
                  {n} events
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button onClick={handleGenerate} disabled={!projectId || loading} className="w-full">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              "Generate Events"
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

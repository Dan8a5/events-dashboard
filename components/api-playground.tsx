"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Play, Loader2, CheckCircle2, XCircle } from "lucide-react"

interface ApiPlaygroundProps {
  defaultApiKey?: string
}

export function ApiPlayground({ defaultApiKey = "" }: ApiPlaygroundProps) {
  const [apiKey, setApiKey] = useState(defaultApiKey)
  const [channel, setChannel] = useState("orders")
  const [title, setTitle] = useState("New order received")
  const [description, setDescription] = useState("Order #12345 from John Doe")
  const [icon, setIcon] = useState("")
  const [tags, setTags] = useState("ecommerce, orders")
  const [loading, setLoading] = useState(false)
  const [response, setResponse] = useState<{ success: boolean; data: string } | null>(null)

  const handleSubmit = async () => {
    setLoading(true)
    setResponse(null)

    try {
      const res = await fetch("/api/events", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-api-key": apiKey,
        },
        body: JSON.stringify({
          channel: channel.trim(),
          title: title.trim(),
          description: description.trim() || undefined,
          icon: icon.trim() || undefined,
          tags: tags ? tags.split(",").map((t) => t.trim()).filter(Boolean) : undefined,
        }),
      })

      const data = await res.json()
      setResponse({
        success: res.ok,
        data: JSON.stringify(data, null, 2),
      })
    } catch (error) {
      setResponse({
        success: false,
        data: JSON.stringify({ error: "Network error" }, null, 2),
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card className="border-border">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Play className="h-5 w-5" />
          API Playground
        </CardTitle>
        <CardDescription>
          Test the API directly from your browser. Fill in the fields below and click Send to create an event.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div className="space-y-2">
            <Label htmlFor="apiKey">API Key *</Label>
            <Input
              id="apiKey"
              type="password"
              placeholder="Enter your API key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">
              Find your API key on the Settings page
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="channel">Channel *</Label>
              <Input
                id="channel"
                placeholder="e.g., orders, signups, deploys"
                value={channel}
                onChange={(e) => setChannel(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="icon">Icon (optional)</Label>
              <Input
                id="icon"
                placeholder="e.g., a]"
                value={icon}
                onChange={(e) => setIcon(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              placeholder="Event title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Additional details about the event"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags (optional, comma-separated)</Label>
            <Input
              id="tags"
              placeholder="e.g., production, urgent, v1.0"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
            />
          </div>
        </div>

        <Button
          onClick={handleSubmit}
          disabled={loading || !apiKey || !channel || !title}
          className="w-full"
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Play className="h-4 w-4 mr-2" />
              Send Event
            </>
          )}
        </Button>

        {response && (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">Response</span>
              <Badge variant={response.success ? "default" : "destructive"} className="gap-1">
                {response.success ? (
                  <>
                    <CheckCircle2 className="h-3 w-3" />
                    Success
                  </>
                ) : (
                  <>
                    <XCircle className="h-3 w-3" />
                    Error
                  </>
                )}
              </Badge>
            </div>
            <pre className="bg-zinc-950 text-zinc-100 rounded-lg p-4 overflow-x-auto text-sm font-mono">
              <code>{response.data}</code>
            </pre>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

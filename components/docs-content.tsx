"use client"

import { useState, useEffect } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CodeBlock } from "@/components/code-block"
import { ApiPlayground } from "@/components/api-playground"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Book, Code2, Zap, Terminal, FileJson, Globe } from "lucide-react"

interface DocsContentProps {
  apiKey: string
}

export function DocsContent({ apiKey }: DocsContentProps) {
  const [baseUrl, setBaseUrl] = useState("https://your-app.vercel.app")

  useEffect(() => {
    setBaseUrl(window.location.origin)
  }, [])

  const curlExample = `curl -X POST ${baseUrl}/api/events \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: ${apiKey || "YOUR_API_KEY"}" \\
  -d '{
    "channel": "orders",
    "title": "New order received",
    "description": "Order #12345 from John Doe",
    "icon": "a]",
    "tags": ["ecommerce", "high-value"]
  }'`

  const javascriptExample = `// Using fetch
const response = await fetch("${baseUrl}/api/events", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": "${apiKey || "YOUR_API_KEY"}",
  },
  body: JSON.stringify({
    channel: "signups",
    title: "New user signed up",
    description: "user@example.com created an account",
    icon: "b0",
    tags: ["organic", "newsletter"]
  }),
});

const data = await response.json();
console.log(data);`

  const nodejsExample = `// Node.js example
const https = require('https');

const data = JSON.stringify({
  channel: "deploys",
  title: "Production deployment",
  description: "v2.1.0 deployed to production",
  icon: "b2",
  tags: ["production", "v2.1.0"]
});

const options = {
  hostname: '${baseUrl.replace(/^https?:\/\//, '')}',
  path: '/api/events',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': '${apiKey || "YOUR_API_KEY"}',
    'Content-Length': Buffer.byteLength(data)
  }
};

const req = https.request(options, (res) => {
  let body = '';
  res.on('data', chunk => body += chunk);
  res.on('end', () => console.log(JSON.parse(body)));
});

req.write(data);
req.end();`

  const pythonExample = `import requests

response = requests.post(
    "${baseUrl}/api/events",
    headers={
        "Content-Type": "application/json",
        "x-api-key": "${apiKey || "YOUR_API_KEY"}"
    },
    json={
        "channel": "payments",
        "title": "Payment received",
        "description": "$49.99 from customer@email.com",
        "icon": "b4",
        "tags": ["stripe", "subscription"]
    }
)

print(response.json())`

  const goExample = `package main

import (
    "bytes"
    "encoding/json"
    "fmt"
    "net/http"
)

func main() {
    event := map[string]interface{}{
        "channel":     "errors",
        "title":       "Database connection failed",
        "description": "PostgreSQL timeout after 30s",
        "icon":        "a6",
        "tags":        []string{"critical", "database"},
    }

    body, _ := json.Marshal(event)
    req, _ := http.NewRequest("POST", "${baseUrl}/api/events", bytes.NewBuffer(body))
    req.Header.Set("Content-Type", "application/json")
    req.Header.Set("x-api-key", "${apiKey || "YOUR_API_KEY"}")

    client := &http.Client{}
    resp, _ := client.Do(req)
    defer resp.Body.Close()

    fmt.Println("Status:", resp.Status)
}`

  const phpExample = `<?php

$curl = curl_init();

curl_setopt_array($curl, [
    CURLOPT_URL => "${baseUrl}/api/events",
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST => true,
    CURLOPT_HTTPHEADER => [
        "Content-Type: application/json",
        "x-api-key: ${apiKey || "YOUR_API_KEY"}"
    ],
    CURLOPT_POSTFIELDS => json_encode([
        "channel" => "alerts",
        "title" => "Server CPU high",
        "description" => "CPU usage exceeded 90%",
        "icon" => "a8",
        "tags" => ["monitoring", "infrastructure"]
    ])
]);

$response = curl_exec($curl);
curl_close($curl);

echo $response;`

  const webhookExample = `// GitHub Webhook Handler (Next.js API Route)
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  const payload = await request.json();
  const event = request.headers.get("x-github-event");

  // Forward to Events Dashboard
  await fetch("${baseUrl}/api/events", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": "${apiKey || "YOUR_API_KEY"}",
    },
    body: JSON.stringify({
      channel: "github",
      title: \`GitHub: \${event}\`,
      description: payload.action || payload.ref || "Event received",
      icon: "b1",
      tags: ["github", event || "webhook"]
    }),
  });

  return NextResponse.json({ received: true });
}`

  const successResponse = `{
  "success": true,
  "event": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "project_id": "123e4567-e89b-12d3-a456-426614174000",
    "channel": "orders",
    "title": "New order received",
    "description": "Order #12345 from John Doe",
    "icon": "a]",
    "tags": ["ecommerce", "high-value"],
    "created_at": "2025-03-03T12:00:00.000Z"
  }
}`

  const errorResponses = `// 401 Unauthorized - Missing API key
{ "error": "Missing API key. Include x-api-key header." }

// 401 Unauthorized - Invalid API key
{ "error": "Invalid API key" }

// 400 Bad Request - Missing channel
{ "error": "Missing or invalid 'channel' field" }

// 400 Bad Request - Missing title
{ "error": "Missing or invalid 'title' field" }

// 400 Bad Request - Invalid JSON
{ "error": "Invalid request body" }

// 500 Internal Server Error
{ "error": "Failed to create event" }`

  return (
    <main className="container mx-auto px-4 py-8 max-w-5xl">
      <div className="space-y-2 mb-8">
        <h1 className="text-3xl font-bold text-foreground">API Documentation</h1>
        <p className="text-muted-foreground text-lg">
          Everything you need to integrate the Events Dashboard with your applications.
        </p>
      </div>

      {/* Quick Start */}
      <Card className="mb-8 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Quick Start
          </CardTitle>
          <CardDescription>
            Send your first event in under a minute
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">1</div>
              <div>
                <p className="font-medium text-foreground">Get your API key</p>
                <p className="text-sm text-muted-foreground">Go to Settings to copy your API key</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">2</div>
              <div>
                <p className="font-medium text-foreground">Make a POST request</p>
                <p className="text-sm text-muted-foreground">Send JSON to /api/events</p>
              </div>
            </div>
            <div className="flex gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-sm font-medium">3</div>
              <div>
                <p className="font-medium text-foreground">Watch events appear</p>
                <p className="text-sm text-muted-foreground">Events show up in real-time</p>
              </div>
            </div>
          </div>
          <CodeBlock code={curlExample} language="bash" />
        </CardContent>
      </Card>

      {/* API Reference */}
      <Card className="mb-8 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Book className="h-5 w-5" />
            API Reference
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-green-600 hover:bg-green-600">POST</Badge>
              <code className="text-sm bg-muted px-2 py-1 rounded font-mono">/api/events</code>
            </div>
            <p className="text-muted-foreground">Create a new event in your dashboard.</p>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground">Headers</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Header</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">Content-Type</TableCell>
                  <TableCell><Badge variant="secondary">Required</Badge></TableCell>
                  <TableCell>Must be <code className="bg-muted px-1 rounded">application/json</code></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">x-api-key</TableCell>
                  <TableCell><Badge variant="secondary">Required</Badge></TableCell>
                  <TableCell>Your project API key from the Settings page</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground">Request Body</h4>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Field</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Required</TableHead>
                  <TableHead>Description</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-sm">channel</TableCell>
                  <TableCell>string</TableCell>
                  <TableCell><Badge variant="secondary">Required</Badge></TableCell>
                  <TableCell>Category for the event (e.g., "orders", "signups", "deploys")</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">title</TableCell>
                  <TableCell>string</TableCell>
                  <TableCell><Badge variant="secondary">Required</Badge></TableCell>
                  <TableCell>Short description of the event</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">description</TableCell>
                  <TableCell>string</TableCell>
                  <TableCell><Badge variant="outline">Optional</Badge></TableCell>
                  <TableCell>Longer description with additional details</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">icon</TableCell>
                  <TableCell>string</TableCell>
                  <TableCell><Badge variant="outline">Optional</Badge></TableCell>
                  <TableCell>Emoji icon for the event</TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-sm">tags</TableCell>
                  <TableCell>string[]</TableCell>
                  <TableCell><Badge variant="outline">Optional</Badge></TableCell>
                  <TableCell>Array of tags for filtering and searching</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground">Response</h4>
            <p className="text-sm text-muted-foreground mb-2">Success (201 Created)</p>
            <CodeBlock code={successResponse} language="json" />
          </div>

          <div>
            <h4 className="font-semibold mb-3 text-foreground">Error Responses</h4>
            <CodeBlock code={errorResponses} language="json" />
          </div>
        </CardContent>
      </Card>

      {/* Code Examples */}
      <Card className="mb-8 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Code2 className="h-5 w-5" />
            Code Examples
          </CardTitle>
          <CardDescription>
            Copy-paste examples for your favorite language or framework
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="curl" className="w-full">
            <TabsList className="mb-4 flex-wrap h-auto gap-1">
              <TabsTrigger value="curl" className="gap-1">
                <Terminal className="h-3 w-3" />
                cURL
              </TabsTrigger>
              <TabsTrigger value="javascript" className="gap-1">
                <FileJson className="h-3 w-3" />
                JavaScript
              </TabsTrigger>
              <TabsTrigger value="nodejs">Node.js</TabsTrigger>
              <TabsTrigger value="python">Python</TabsTrigger>
              <TabsTrigger value="go">Go</TabsTrigger>
              <TabsTrigger value="php">PHP</TabsTrigger>
            </TabsList>
            <TabsContent value="curl">
              <CodeBlock code={curlExample} language="bash" />
            </TabsContent>
            <TabsContent value="javascript">
              <CodeBlock code={javascriptExample} language="javascript" />
            </TabsContent>
            <TabsContent value="nodejs">
              <CodeBlock code={nodejsExample} language="javascript" />
            </TabsContent>
            <TabsContent value="python">
              <CodeBlock code={pythonExample} language="python" />
            </TabsContent>
            <TabsContent value="go">
              <CodeBlock code={goExample} language="go" />
            </TabsContent>
            <TabsContent value="php">
              <CodeBlock code={phpExample} language="php" />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Integration Examples */}
      <Card className="mb-8 border-border">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Integration Examples
          </CardTitle>
          <CardDescription>
            Real-world examples for common use cases
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div>
            <h4 className="font-semibold mb-2 text-foreground">GitHub Webhook Handler</h4>
            <p className="text-sm text-muted-foreground mb-3">
              Forward GitHub events (pushes, pull requests, issues) to your dashboard.
            </p>
            <CodeBlock code={webhookExample} language="typescript" />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Deployment Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Track deployments from CI/CD:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Vercel deployment hooks</li>
                  <li>GitHub Actions workflows</li>
                  <li>CircleCI, Jenkins, etc.</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">E-commerce Events</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Monitor sales activity:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>New orders and checkouts</li>
                  <li>Subscription changes</li>
                  <li>Payment failures</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">User Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Track user milestones:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>New signups</li>
                  <li>Upgrades and downgrades</li>
                  <li>Feature usage</li>
                </ul>
              </CardContent>
            </Card>
            <Card className="border-border">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">System Alerts</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-2">Monitor infrastructure:</p>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  <li>Error spikes</li>
                  <li>Performance issues</li>
                  <li>Security alerts</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </CardContent>
      </Card>

      {/* Interactive Playground */}
      <ApiPlayground defaultApiKey={apiKey} />
    </main>
  )
}

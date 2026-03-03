# Events Dashboard

A real-time event monitoring dashboard for your applications. Send events from any application via REST API and view them in a live-updating feed with filtering, search, and analytics.

## Features

- **REST API** — POST events from any application with simple JSON payloads
- **API Key Authentication** — Each project gets a unique API key for secure event submission
- **Real-time Updates** — Events appear instantly via Supabase Realtime subscriptions
- **Multi-Project Support** — Create separate projects for different apps or environments
- **Channel Filtering** — Organize events by channel (e.g., orders, payments, errors, auth)
- **Search** — Full-text search across event titles, descriptions, and tags
- **Activity Charts** — Visualize event volume over the last 7 days
- **KPI Cards** — Live metrics showing total events, events today, channels, and trends
- **Pagination** — View 50, 100, or all events per page
- **Dark/Light Mode** — Toggle between themes with system preference detection
- **Interactive API Docs** — Built-in documentation with live playground for testing

## Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router)
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Real-time**: [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **UI Components**: [shadcn/ui](https://ui.shadcn.com/)
- **Charts**: [Recharts](https://recharts.org/)
- **Language**: [TypeScript](https://www.typescriptlang.org/)

## Getting Started

### Prerequisites

- Node.js 18+
- A [Supabase](https://supabase.com/) account and project

### Environment Variables

Create a `.env.local` file in the project root:

```plaintext
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

Get these values from your Supabase project: **Settings → API**

### Database Setup

Run these SQL migrations in your Supabase SQL Editor:

```sql
-- Create projects table
CREATE TABLE IF NOT EXISTS projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  api_key TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(24), 'hex'),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create events table
CREATE TABLE IF NOT EXISTS events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  channel TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_events_project_id ON events(project_id);
CREATE INDEX IF NOT EXISTS idx_events_channel ON events(channel);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);

-- Enable RLS
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Allow read projects" ON projects FOR SELECT USING (true);
CREATE POLICY "Allow insert projects" ON projects FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow delete projects" ON projects FOR DELETE USING (true);
CREATE POLICY "Allow read events" ON events FOR SELECT USING (true);
CREATE POLICY "Allow delete events" ON events FOR DELETE USING (true);

-- Enable realtime for events
ALTER PUBLICATION supabase_realtime ADD TABLE events;
```

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Usage

### Creating a Project

1. Go to **Settings**
2. Enter a project name and click **Create Project**
3. Copy the generated API key

### Sending Events

Send events to your dashboard using the REST API:

```bash
curl -X POST http://localhost:3000/api/events \
  -H "Content-Type: application/json" \
  -H "x-api-key: YOUR_API_KEY" \
  -d '{
    "channel": "orders",
    "title": "New order received",
    "description": "Order #12345 for $99.00",
    "icon": "🛒",
    "tags": ["premium", "usa"]
  }'
```

**Response**

```json
{
  "success": true,
  "event": {
    "id": "uuid",
    "channel": "orders",
    "title": "New order received",
    "description": "Order #12345 for $99.00",
    "icon": "🛒",
    "tags": ["premium", "usa"],
    "created_at": "2024-01-01T00:00:00Z"
  }
}
```

### Event Schema

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `channel` | string | Yes | Category for the event (e.g., `orders`, `errors`) |
| `title` | string | Yes | Short title describing the event |
| `description` | string | No | Additional details about the event |
| `icon` | string | No | Emoji to display with the event |
| `tags` | string[] | No | Array of tags for filtering/searching |

### Integration Examples

**JavaScript/Node.js**

```javascript
await fetch('https://your-domain.com/api/events', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.EVENTS_API_KEY
  },
  body: JSON.stringify({
    channel: 'deployments',
    title: 'Production deploy completed',
    description: `Version ${version} deployed successfully`,
    icon: '🚀',
    tags: ['production', version]
  })
});
```

**Python**

```python
import requests

requests.post(
    'https://your-domain.com/api/events',
    headers={
        'Content-Type': 'application/json',
        'x-api-key': os.environ['EVENTS_API_KEY']
    },
    json={
        'channel': 'errors',
        'title': 'Exception caught',
        'description': str(error),
        'icon': '❌',
        'tags': ['critical', 'api']
    }
)
```

### Demo Data

The dashboard includes pre-built demo scenarios for testing:

1. Go to **Settings**
2. Click **Load E-Commerce Demo** or **Load SaaS Demo**
3. View sample events on the dashboard

## Project Structure

```
├── app/
│   ├── api/
│   │   ├── demo/route.ts      # Demo data endpoints
│   │   └── events/route.ts    # Events API endpoint
│   ├── docs/page.tsx          # API documentation
│   ├── settings/page.tsx      # Project management
│   └── page.tsx               # Main dashboard
├── components/
│   ├── ui/                    # shadcn/ui components
│   ├── activity-chart.tsx     # Event activity visualization
│   ├── event-card.tsx         # Individual event display
│   ├── event-feed.tsx         # Event list with filters
│   ├── kpi-cards.tsx          # Dashboard metrics
│   └── ...
├── lib/
│   ├── supabase/              # Supabase client setup
│   ├── demo-data/             # Sample data for demos
│   ├── channel-colors.ts      # Channel color assignments
│   └── types.ts               # TypeScript types
```

## Deployment

This project is optimized for deployment on [Vercel](https://vercel.com/). Connect your repository and add the three environment variables from `.env.local` to your Vercel project settings.

## License

MIT

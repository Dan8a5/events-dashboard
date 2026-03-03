export interface Project {
  id: string
  name: string
  api_key: string
  created_at: string
}

export interface Event {
  id: string
  project_id: string
  channel: string
  title: string
  description: string | null
  icon: string | null
  tags: string[]
  created_at: string
}

export interface EventInput {
  channel: string
  title: string
  description?: string
  icon?: string
  tags?: string[]
}

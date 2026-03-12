"use client"

import type { Project } from "@/lib/types"
import { METALS_PROJECT_NAME } from "@/lib/constants"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FolderOpen } from "lucide-react"

interface ProjectSelectorProps {
  projects: Project[]
  selectedProjectId: string
  onProjectChange: (projectId: string) => void
}

export function ProjectSelector({ 
  projects, 
  selectedProjectId, 
  onProjectChange 
}: ProjectSelectorProps) {
  const selectedProject = projects.find(p => p.id === selectedProjectId)

  return (
    <div className="flex items-center gap-3">
      <FolderOpen className="h-5 w-5 text-muted-foreground" />
      <Select value={selectedProjectId} onValueChange={onProjectChange}>
        <SelectTrigger className="w-50">
          <SelectValue placeholder="Select project">
            {selectedProjectId === "all" ? "All Projects" : selectedProject?.name}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Projects</SelectItem>
          {/* Metals Tracker is system-managed and hidden here; its events still appear under "All Projects" */}
          {projects.filter(p => p.name !== METALS_PROJECT_NAME).map((project) => (
            <SelectItem key={project.id} value={project.id}>
              {project.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Settings, Activity, Book, TrendingUp } from "lucide-react"
import { ThemeToggle } from "@/components/theme-toggle"

export function DashboardHeader() {
  return (
    <header className="border-b border-border bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2">
          <Activity className="h-6 w-6 text-foreground" />
          <h1 className="text-xl font-semibold text-foreground">Events</h1>
        </Link>
        <nav className="flex items-center gap-1">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/metals">
              <TrendingUp className="h-4 w-4 mr-2" />
              Metals
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/docs">
              <Book className="h-4 w-4 mr-2" />
              Docs
            </Link>
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/settings">
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Link>
          </Button>
          <ThemeToggle />
        </nav>
      </div>
    </header>
  )
}

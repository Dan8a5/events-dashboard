"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  ShoppingCart, 
  Loader2, 
  CheckCircle, 
  Package, 
  CreditCard, 
  Star, 
  Users, 
  Trash2,
  Rocket,
  Key,
  AlertCircle,
  Zap,
  UserPlus
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

type DemoScenario = "ecommerce" | "saas"

interface DemoState {
  exists: boolean
  loading: boolean
  deleting: boolean
}

export function LoadDemoData() {
  const [ecommerce, setEcommerce] = useState<DemoState>({ exists: false, loading: false, deleting: false })
  const [saas, setSaas] = useState<DemoState>({ exists: false, loading: false, deleting: false })
  const [message, setMessage] = useState<{ type: "success" | "deleted"; text: string } | null>(null)
  const router = useRouter()

  // Check if demo projects exist on mount
  useEffect(() => {
    const checkDemosExist = async () => {
      const supabase = createClient()
      
      const { data: quickshop } = await supabase
        .from("projects")
        .select("id")
        .eq("name", "QuickShop")
        .single()
      
      const { data: launchpad } = await supabase
        .from("projects")
        .select("id")
        .eq("name", "LaunchPad")
        .single()
      
      setEcommerce(prev => ({ ...prev, exists: !!quickshop }))
      setSaas(prev => ({ ...prev, exists: !!launchpad }))
    }
    checkDemosExist()
  }, [])

  const handleLoadDemo = async (scenario: DemoScenario) => {
    const setState = scenario === "ecommerce" ? setEcommerce : setSaas
    setState(prev => ({ ...prev, loading: true }))
    setMessage(null)

    try {
      const response = await fetch(`/api/demo?scenario=${scenario}`, {
        method: "POST",
      })

      const data = await response.json()

      if (response.ok) {
        setState(prev => ({ ...prev, exists: true }))
        setMessage({
          type: "success",
          text: `Loaded ${data.eventsCount} events for ${data.project?.name}`
        })
        router.refresh()
      } else {
        console.error("Failed to load demo:", data.error)
      }
    } catch (error) {
      console.error("Error loading demo:", error)
    } finally {
      setState(prev => ({ ...prev, loading: false }))
    }
  }

  const handleRemoveDemo = async (scenario: DemoScenario) => {
    const setState = scenario === "ecommerce" ? setEcommerce : setSaas
    setState(prev => ({ ...prev, deleting: true }))
    setMessage(null)

    try {
      const response = await fetch(`/api/demo?scenario=${scenario}`, {
        method: "DELETE",
      })

      if (response.ok) {
        setState(prev => ({ ...prev, exists: false }))
        setMessage({
          type: "deleted",
          text: `${scenario === "ecommerce" ? "QuickShop" : "LaunchPad"} demo removed`
        })
        router.refresh()
      } else {
        const data = await response.json()
        console.error("Failed to remove demo:", data.error)
      }
    } catch (error) {
      console.error("Error removing demo:", error)
    } finally {
      setState(prev => ({ ...prev, deleting: false }))
    }
  }

  return (
    <Card className="border-dashed">
      <CardHeader>
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="h-5 w-5" />
          Load Demo Data
        </CardTitle>
        <CardDescription>
          Try the dashboard with sample data from different scenarios
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <div className={`flex items-center gap-2 text-sm rounded-md p-3 ${
            message.type === "success" 
              ? "text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-950/30"
              : "text-muted-foreground bg-muted"
          }`}>
            <CheckCircle className="h-4 w-4" />
            <span>{message.text}</span>
          </div>
        )}

        {/* E-Commerce Demo */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">QuickShop (E-Commerce)</p>
          </div>
          <p className="text-sm text-muted-foreground">
            41 events: orders, payments, signups, reviews, and support tickets.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs bg-background border border-border rounded-md px-2 py-1">
              <Package className="h-3 w-3" /> Orders
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-background border border-border rounded-md px-2 py-1">
              <CreditCard className="h-3 w-3" /> Payments
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-background border border-border rounded-md px-2 py-1">
              <Users className="h-3 w-3" /> Signups
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-background border border-border rounded-md px-2 py-1">
              <Star className="h-3 w-3" /> Reviews
            </span>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => handleLoadDemo("ecommerce")}
              disabled={ecommerce.loading || ecommerce.deleting}
              variant={ecommerce.exists ? "outline" : "default"}
              size="sm"
              className="flex-1"
            >
              {ecommerce.loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : ecommerce.exists ? (
                "Reload"
              ) : (
                "Load Demo"
              )}
            </Button>
            {ecommerce.exists && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRemoveDemo("ecommerce")}
                disabled={ecommerce.deleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {ecommerce.deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {/* SaaS Demo */}
        <div className="rounded-lg bg-muted/50 p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Rocket className="h-4 w-4 text-muted-foreground" />
            <p className="text-sm font-medium text-foreground">LaunchPad (SaaS)</p>
          </div>
          <p className="text-sm text-muted-foreground">
            36 events: auth, billing, errors, feature usage, and onboarding.
          </p>
          <div className="flex flex-wrap gap-2">
            <span className="inline-flex items-center gap-1 text-xs bg-background border border-border rounded-md px-2 py-1">
              <Key className="h-3 w-3" /> Auth
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-background border border-border rounded-md px-2 py-1">
              <CreditCard className="h-3 w-3" /> Billing
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-background border border-border rounded-md px-2 py-1">
              <AlertCircle className="h-3 w-3" /> Errors
            </span>
            <span className="inline-flex items-center gap-1 text-xs bg-background border border-border rounded-md px-2 py-1">
              <UserPlus className="h-3 w-3" /> Onboarding
            </span>
          </div>
          <div className="flex gap-2 pt-1">
            <Button
              onClick={() => handleLoadDemo("saas")}
              disabled={saas.loading || saas.deleting}
              variant={saas.exists ? "outline" : "default"}
              size="sm"
              className="flex-1"
            >
              {saas.loading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Loading...
                </>
              ) : saas.exists ? (
                "Reload"
              ) : (
                "Load Demo"
              )}
            </Button>
            {saas.exists && (
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => handleRemoveDemo("saas")}
                disabled={saas.deleting}
                className="text-destructive hover:text-destructive hover:bg-destructive/10"
              >
                {saas.deleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            )}
          </div>
        </div>

        {(ecommerce.exists || saas.exists) && (
          <Button variant="outline" onClick={() => router.push("/")} className="w-full">
            View Dashboard
          </Button>
        )}
      </CardContent>
    </Card>
  )
}

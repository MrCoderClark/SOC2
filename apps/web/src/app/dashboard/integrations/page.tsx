"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Link2, 
  Plus,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Settings,
  Trash2,
  RefreshCw,
  ExternalLink
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Integration = {
  id: string
  type: string
  name: string
  config: any
  status: "ACTIVE" | "INACTIVE" | "ERROR"
  lastSyncAt: string | null
  createdAt: string
}

const integrationTypes = [
  { type: "AWS", name: "Amazon Web Services", description: "Connect your AWS account for infrastructure compliance" },
  { type: "AZURE", name: "Microsoft Azure", description: "Connect your Azure account for cloud compliance" },
  { type: "GCP", name: "Google Cloud Platform", description: "Connect your GCP account for cloud compliance" },
  { type: "GITHUB", name: "GitHub", description: "Connect GitHub for code repository compliance" },
  { type: "JIRA", name: "Jira", description: "Connect Jira for issue tracking integration" },
  { type: "SLACK", name: "Slack", description: "Connect Slack for notifications and alerts" },
  { type: "OKTA", name: "Okta", description: "Connect Okta for identity management compliance" },
]

const statusConfig = {
  ACTIVE: { icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100", label: "Active" },
  INACTIVE: { icon: XCircle, color: "text-gray-500", bg: "bg-gray-100", label: "Inactive" },
  ERROR: { icon: AlertCircle, color: "text-red-600", bg: "bg-red-100", label: "Error" },
}

export default function IntegrationsPage() {
  const [integrations, setIntegrations] = useState<Integration[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [selectedType, setSelectedType] = useState<string | null>(null)

  useEffect(() => {
    fetchIntegrations()
  }, [])

  const fetchIntegrations = async () => {
    try {
      const res = await fetch("/api/integrations")
      if (res.ok) {
        const data = await res.json()
        setIntegrations(data)
      }
    } catch (error) {
      console.error("Failed to fetch integrations:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleAddIntegration = async (type: string) => {
    // Handle OAuth-based integrations
    if (type === "GITHUB") {
      try {
        const res = await fetch("/api/integrations/github/connect")
        if (res.ok) {
          const data = await res.json()
          window.location.href = data.url
        }
      } catch (error) {
        console.error("Failed to connect GitHub:", error)
      }
      return
    }

    // Handle other integrations
    const typeInfo = integrationTypes.find(t => t.type === type)
    if (!typeInfo) return

    try {
      const res = await fetch("/api/integrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          name: typeInfo.name,
          config: {},
        }),
      })

      if (res.ok) {
        await fetchIntegrations()
        setShowAddModal(false)
        setSelectedType(null)
      }
    } catch (error) {
      console.error("Failed to add integration:", error)
    }
  }

  const handleToggleStatus = async (integration: Integration) => {
    const newStatus = integration.status === "ACTIVE" ? "INACTIVE" : "ACTIVE"
    
    try {
      const res = await fetch(`/api/integrations/${integration.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })

      if (res.ok) {
        await fetchIntegrations()
      }
    } catch (error) {
      console.error("Failed to update integration:", error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this integration?")) return

    try {
      const res = await fetch(`/api/integrations/${id}`, {
        method: "DELETE",
      })

      if (res.ok) {
        await fetchIntegrations()
      }
    } catch (error) {
      console.error("Failed to delete integration:", error)
    }
  }

  const connectedTypes = integrations.map(i => i.type)
  const availableTypes = integrationTypes.filter(t => !connectedTypes.includes(t.type))

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Integrations</h1>
          <p className="text-muted-foreground mt-1">Connect your tools and services for automated compliance</p>
        </div>
        <Button onClick={() => setShowAddModal(true)} disabled={availableTypes.length === 0}>
          <Plus className="h-4 w-4 mr-2" />
          Add Integration
        </Button>
      </div>

      {/* Connected Integrations */}
      <section className="mb-8">
        <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
          Connected ({integrations.length})
        </h2>
        
        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading integrations...</div>
        ) : integrations.length === 0 ? (
          <Card className="shadow-sm">
            <CardContent className="p-8 text-center">
              <Link2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <p className="text-lg font-medium text-foreground">No integrations connected</p>
              <p className="text-sm text-muted-foreground mt-1">
                Connect your first integration to start automating compliance
              </p>
              <Button className="mt-4" onClick={() => setShowAddModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Integration
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {integrations.map((integration) => {
              const status = statusConfig[integration.status]
              const StatusIcon = status.icon
              
              return (
                <Card key={integration.id} className="shadow-sm">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                          <Link2 className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-foreground">{integration.name}</h3>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={cn("flex items-center gap-1 text-xs px-2 py-0.5 rounded-full", status.bg, status.color)}>
                              <StatusIcon className="h-3 w-3" />
                              {status.label}
                            </span>
                            {integration.lastSyncAt && (
                              <span className="text-xs text-muted-foreground">
                                Last sync: {new Date(integration.lastSyncAt).toLocaleDateString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-1">
                        {integration.type === "GITHUB" && integration.status === "ACTIVE" && (
                          <Link href="/dashboard/integrations/github">
                            <Button variant="ghost" size="sm" title="View Details">
                              <ExternalLink className="h-4 w-4" />
                            </Button>
                          </Link>
                        )}
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleStatus(integration)}
                          title={integration.status === "ACTIVE" ? "Deactivate" : "Activate"}
                        >
                          <RefreshCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(integration.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </section>

      {/* Available Integrations */}
      {availableTypes.length > 0 && (
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
            Available ({availableTypes.length})
          </h2>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {availableTypes.map((type) => (
              <Card key={type.type} className="shadow-sm hover:shadow-md transition-shadow cursor-pointer border-dashed">
                <CardContent className="p-6" onClick={() => handleAddIntegration(type.type)}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                      <Link2 className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <h3 className="font-semibold text-foreground">{type.name}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">{type.description}</p>
                  <Button variant="outline" size="sm" className="mt-4 w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Connect
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

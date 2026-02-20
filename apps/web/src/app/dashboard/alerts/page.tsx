"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Bell,
  AlertTriangle,
  AlertCircle,
  Info,
  CheckCircle2,
  Clock,
  Shield,
  FileText,
  FolderOpen,
  RefreshCw,
  Eye,
  Check,
  X,
  RotateCcw
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Alert = {
  id: string
  type: string
  severity: string
  title: string
  description: string
  status: string
  createdAt: string
  acknowledgedAt: string | null
  resolvedAt: string | null
  control?: {
    id: string
    code: string
    name: string
  }
  evidence?: {
    id: string
    title: string
  }
  policy?: {
    id: string
    title: string
  }
  acknowledger?: {
    id: string
    name: string
  }
  resolver?: {
    id: string
    name: string
  }
}

const severityConfig = {
  CRITICAL: { label: "Critical", icon: AlertTriangle, color: "text-red-600", bg: "bg-red-100", border: "border-red-200" },
  HIGH: { label: "High", icon: AlertTriangle, color: "text-orange-600", bg: "bg-orange-100", border: "border-orange-200" },
  MEDIUM: { label: "Medium", icon: AlertCircle, color: "text-yellow-600", bg: "bg-yellow-100", border: "border-yellow-200" },
  LOW: { label: "Low", icon: Info, color: "text-blue-600", bg: "bg-blue-100", border: "border-blue-200" },
}

const statusConfig = {
  OPEN: { label: "Open", color: "text-red-600", bg: "bg-red-100" },
  ACKNOWLEDGED: { label: "Acknowledged", color: "text-yellow-600", bg: "bg-yellow-100" },
  RESOLVED: { label: "Resolved", color: "text-green-600", bg: "bg-green-100" },
  DISMISSED: { label: "Dismissed", color: "text-gray-600", bg: "bg-gray-100" },
}

const typeLabels: Record<string, string> = {
  CONTROL_NOT_STARTED: "Control Not Started",
  CONTROL_STALE: "Control Needs Review",
  EVIDENCE_MISSING: "Missing Evidence",
  EVIDENCE_EXPIRING: "Evidence Expiring",
  EVIDENCE_EXPIRED: "Evidence Expired",
  EVIDENCE_REJECTED: "Evidence Rejected",
  POLICY_MISSING: "Missing Policy",
  POLICY_DRAFT: "Policy in Draft",
  COMPLIANCE_DROP: "Compliance Score Drop",
}

export default function AlertsPage() {
  const [alerts, setAlerts] = useState<Alert[]>([])
  const [loading, setLoading] = useState(true)
  const [scanning, setScanning] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [actionLoading, setActionLoading] = useState<string | null>(null)

  useEffect(() => {
    fetchAlerts()
  }, [statusFilter])

  const fetchAlerts = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      
      const res = await fetch(`/api/alerts?${params}`)
      const data = await res.json()
      setAlerts(data)
    } catch (error) {
      console.error("Failed to fetch alerts:", error)
    } finally {
      setLoading(false)
    }
  }

  const runScan = async () => {
    setScanning(true)
    try {
      const res = await fetch("/api/alerts/scan", { method: "POST" })
      const data = await res.json()
      if (res.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error("Failed to run scan:", error)
    } finally {
      setScanning(false)
    }
  }

  const handleAction = async (alertId: string, action: string) => {
    setActionLoading(alertId)
    try {
      const res = await fetch(`/api/alerts/${alertId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      })
      if (res.ok) {
        fetchAlerts()
      }
    } catch (error) {
      console.error("Failed to update alert:", error)
    } finally {
      setActionLoading(null)
    }
  }

  const stats = {
    open: alerts.filter(a => a.status === "OPEN").length,
    acknowledged: alerts.filter(a => a.status === "ACKNOWLEDGED").length,
    resolved: alerts.filter(a => a.status === "RESOLVED").length,
    critical: alerts.filter(a => a.severity === "CRITICAL" && a.status === "OPEN").length,
    high: alerts.filter(a => a.severity === "HIGH" && a.status === "OPEN").length,
  }

  const getRelatedLink = (alert: Alert) => {
    if (alert.control) {
      return `/dashboard/controls/${alert.control.id}`
    }
    if (alert.evidence) {
      return `/dashboard/evidence/${alert.evidence.id}`
    }
    if (alert.policy) {
      return `/dashboard/policies/${alert.policy.id}`
    }
    return null
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Compliance Alerts</h1>
          <p className="text-muted-foreground mt-1">
            Monitor and resolve compliance issues
          </p>
        </div>
        <Button onClick={runScan} disabled={scanning}>
          <RefreshCw className={cn("h-4 w-4 mr-2", scanning && "animate-spin")} />
          {scanning ? "Scanning..." : "Run Compliance Scan"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Open Alerts</div>
            <div className="text-2xl font-bold text-red-600">{stats.open}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Acknowledged</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.acknowledged}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Resolved</div>
            <div className="text-2xl font-bold text-green-600">{stats.resolved}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Critical</div>
            <div className="text-2xl font-bold text-red-600">{stats.critical}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">High Priority</div>
            <div className="text-2xl font-bold text-orange-600">{stats.high}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={statusFilter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setStatusFilter(null)}
        >
          All
        </Button>
        {Object.entries(statusConfig).map(([key, config]) => (
          <Button
            key={key}
            variant={statusFilter === key ? "default" : "outline"}
            size="sm"
            onClick={() => setStatusFilter(key)}
          >
            {config.label}
          </Button>
        ))}
      </div>

      {/* Alerts List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading alerts...</div>
      ) : alerts.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No alerts</h3>
            <p className="text-muted-foreground mb-4">
              {statusFilter ? "No alerts match this filter" : "Your compliance is looking good!"}
            </p>
            <Button variant="outline" onClick={runScan} disabled={scanning}>
              <RefreshCw className={cn("h-4 w-4 mr-2", scanning && "animate-spin")} />
              Run Scan
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {alerts.map((alert) => {
            const severityInfo = severityConfig[alert.severity as keyof typeof severityConfig]
            const statusInfo = statusConfig[alert.status as keyof typeof statusConfig]
            const SeverityIcon = severityInfo?.icon || AlertCircle
            const relatedLink = getRelatedLink(alert)

            return (
              <Card 
                key={alert.id} 
                className={cn(
                  "shadow-sm",
                  alert.status === "OPEN" && severityInfo?.border
                )}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={cn(
                      "h-10 w-10 rounded-lg flex items-center justify-center",
                      severityInfo?.bg
                    )}>
                      <SeverityIcon className={cn("h-5 w-5", severityInfo?.color)} />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          severityInfo?.bg,
                          severityInfo?.color
                        )}>
                          {severityInfo?.label}
                        </span>
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded-full font-medium",
                          statusInfo?.bg,
                          statusInfo?.color
                        )}>
                          {statusInfo?.label}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {typeLabels[alert.type] || alert.type}
                        </span>
                      </div>
                      
                      <h3 className="font-medium text-foreground">{alert.title}</h3>
                      <p className="text-sm text-muted-foreground mt-1">{alert.description}</p>
                      
                      {/* Related item */}
                      {alert.control && (
                        <div className="flex items-center gap-2 mt-2 text-sm">
                          <Shield className="h-4 w-4 text-primary" />
                          <span className="font-mono text-primary">{alert.control.code}</span>
                          <span className="text-muted-foreground">{alert.control.name}</span>
                        </div>
                      )}
                      
                      {/* Timestamps */}
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Created {new Date(alert.createdAt).toLocaleDateString()}</span>
                        {alert.acknowledger && (
                          <span>Acknowledged by {alert.acknowledger.name}</span>
                        )}
                        {alert.resolver && (
                          <span>Resolved by {alert.resolver.name}</span>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2">
                      {relatedLink && (
                        <Link href={relatedLink}>
                          <Button variant="outline" size="sm">
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </Button>
                        </Link>
                      )}
                      
                      {alert.status === "OPEN" && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleAction(alert.id, "acknowledge")}
                          disabled={actionLoading === alert.id}
                        >
                          <Clock className="h-4 w-4 mr-1" />
                          Acknowledge
                        </Button>
                      )}
                      
                      {(alert.status === "OPEN" || alert.status === "ACKNOWLEDGED") && (
                        <>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleAction(alert.id, "resolve")}
                            disabled={actionLoading === alert.id}
                          >
                            <Check className="h-4 w-4 mr-1" />
                            Resolve
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={() => handleAction(alert.id, "dismiss")}
                            disabled={actionLoading === alert.id}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      
                      {(alert.status === "RESOLVED" || alert.status === "DISMISSED") && (
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => handleAction(alert.id, "reopen")}
                          disabled={actionLoading === alert.id}
                        >
                          <RotateCcw className="h-4 w-4 mr-1" />
                          Reopen
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

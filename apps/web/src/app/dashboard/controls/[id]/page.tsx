"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Shield, 
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  FileText,
  FolderOpen,
  User
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Control = {
  id: string
  code: string
  name: string
  description: string
  category: string
  status: string
  assignee?: {
    id: string
    name: string
    email: string
  }
  evidence: Array<{
    id: string
    title: string
    status: string
    createdAt: string
    uploadedBy: {
      id: string
      name: string
    }
  }>
  policies: Array<{
    id: string
    title: string
    status: string
  }>
}

const statusConfig = {
  NOT_STARTED: { label: "Not Started", icon: Circle, color: "text-muted-foreground", bg: "bg-muted" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  IMPLEMENTED: { label: "Implemented", icon: CheckCircle2, color: "text-blue-600", bg: "bg-blue-100" },
  VERIFIED: { label: "Verified", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  NOT_APPLICABLE: { label: "N/A", icon: XCircle, color: "text-muted-foreground", bg: "bg-muted" },
}

const categoryConfig = {
  SECURITY: { label: "Security", color: "bg-blue-100 text-blue-700" },
  AVAILABILITY: { label: "Availability", color: "bg-green-100 text-green-700" },
  PROCESSING_INTEGRITY: { label: "Processing Integrity", color: "bg-purple-100 text-purple-700" },
  CONFIDENTIALITY: { label: "Confidentiality", color: "bg-orange-100 text-orange-700" },
  PRIVACY: { label: "Privacy", color: "bg-pink-100 text-pink-700" },
}

export default function ControlDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [control, setControl] = useState<Control | null>(null)
  const [loading, setLoading] = useState(true)
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchControl()
  }, [params.id])

  const fetchControl = async () => {
    try {
      const res = await fetch(`/api/controls/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setControl(data)
    } catch (error) {
      console.error("Failed to fetch control:", error)
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!control) return
    setUpdating(true)
    try {
      const res = await fetch(`/api/controls/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setControl({ ...control, status: updated.status })
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setUpdating(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!control) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Control not found</h2>
          <Link href="/dashboard/controls">
            <Button variant="outline">Back to Controls</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[control.status as keyof typeof statusConfig]
  const categoryInfo = categoryConfig[control.category as keyof typeof categoryConfig]
  const StatusIcon = statusInfo?.icon || Circle

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/controls" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Controls
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <Shield className="h-7 w-7 text-primary" />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-lg font-bold text-primary">{control.code}</span>
                <span className={cn("text-xs px-2 py-0.5 rounded-full", categoryInfo?.color)}>
                  {categoryInfo?.label}
                </span>
              </div>
              <h1 className="text-2xl font-semibold text-foreground">{control.name}</h1>
              <p className="text-muted-foreground mt-1 max-w-2xl">{control.description}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          {/* Status */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([key, config]) => {
                  const Icon = config.icon
                  const isActive = control.status === key
                  return (
                    <Button
                      key={key}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      disabled={updating}
                      onClick={() => updateStatus(key)}
                      className={cn(isActive && config.bg, isActive && config.color)}
                    >
                      <Icon className="h-4 w-4 mr-1" />
                      {config.label}
                    </Button>
                  )
                })}
              </div>
            </CardContent>
          </Card>

          {/* Evidence */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Evidence</CardTitle>
              <Button size="sm" variant="outline">
                <FolderOpen className="h-4 w-4 mr-2" />
                Add Evidence
              </Button>
            </CardHeader>
            <CardContent>
              {control.evidence.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No evidence uploaded yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {control.evidence.map((item) => (
                    <div key={item.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.title}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploaded by {item.uploadedBy.name}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Policies */}
          <Card className="shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base">Linked Policies</CardTitle>
              <Button size="sm" variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Link Policy
              </Button>
            </CardHeader>
            <CardContent>
              {control.policies.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No policies linked yet</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {control.policies.map((policy) => (
                    <div key={policy.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{policy.title}</p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Assignee</p>
                <div className="flex items-center gap-2 mt-1">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <User className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <span className="text-sm font-medium">
                    {control.assignee?.name || "Unassigned"}
                  </span>
                </div>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Category</p>
                <p className="text-sm font-medium mt-1">{categoryInfo?.label}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Evidence Count</p>
                <p className="text-sm font-medium mt-1">{control.evidence.length}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Linked Policies</p>
                <p className="text-sm font-medium mt-1">{control.policies.length}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

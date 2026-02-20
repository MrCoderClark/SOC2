"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Shield, 
  Search, 
  Filter,
  CheckCircle2,
  Circle,
  Clock,
  XCircle,
  ChevronRight
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
  _count: {
    evidence: number
    policies: number
  }
}

const statusConfig = {
  NOT_STARTED: { label: "Not Started", icon: Circle, color: "text-muted-foreground" },
  IN_PROGRESS: { label: "In Progress", icon: Clock, color: "text-yellow-500" },
  IMPLEMENTED: { label: "Implemented", icon: CheckCircle2, color: "text-blue-500" },
  VERIFIED: { label: "Verified", icon: CheckCircle2, color: "text-green-500" },
  NOT_APPLICABLE: { label: "N/A", icon: XCircle, color: "text-muted-foreground" },
}

const categoryConfig = {
  SECURITY: { label: "Security", color: "bg-blue-100 text-blue-700" },
  AVAILABILITY: { label: "Availability", color: "bg-green-100 text-green-700" },
  PROCESSING_INTEGRITY: { label: "Processing Integrity", color: "bg-purple-100 text-purple-700" },
  CONFIDENTIALITY: { label: "Confidentiality", color: "bg-orange-100 text-orange-700" },
  PRIVACY: { label: "Privacy", color: "bg-pink-100 text-pink-700" },
}

export default function ControlsPage() {
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string | null>(null)
  const [assigneeFilter, setAssigneeFilter] = useState<"all" | "mine" | "unassigned">("all")

  useEffect(() => {
    fetchControls()
  }, [categoryFilter, assigneeFilter])

  const fetchControls = async () => {
    try {
      const params = new URLSearchParams()
      if (categoryFilter) params.set("category", categoryFilter)
      if (assigneeFilter !== "all") params.set("assignee", assigneeFilter)
      
      const res = await fetch(`/api/controls?${params}`)
      const data = await res.json()
      setControls(data)
    } catch (error) {
      console.error("Failed to fetch controls:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredControls = controls.filter(
    (control) =>
      control.code.toLowerCase().includes(search.toLowerCase()) ||
      control.name.toLowerCase().includes(search.toLowerCase()) ||
      control.description.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: controls.length,
    verified: controls.filter((c) => c.status === "VERIFIED").length,
    implemented: controls.filter((c) => c.status === "IMPLEMENTED").length,
    inProgress: controls.filter((c) => c.status === "IN_PROGRESS").length,
    notStarted: controls.filter((c) => c.status === "NOT_STARTED").length,
  }

  const completionPercent = stats.total > 0 
    ? Math.round(((stats.verified + stats.implemented) / stats.total) * 100) 
    : 0

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Controls</h1>
          <p className="text-muted-foreground mt-1">
            Manage your SOC 2 compliance controls
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-5 mb-8">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Verified</div>
            <div className="text-2xl font-bold text-green-600">{stats.verified}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Implemented</div>
            <div className="text-2xl font-bold text-blue-600">{stats.implemented}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">In Progress</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.inProgress}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Completion</div>
            <div className="text-2xl font-bold text-primary">{completionPercent}%</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 mb-6">
        <div className="flex gap-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search controls..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Button
              variant={assigneeFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setAssigneeFilter("all")}
            >
              All
            </Button>
            <Button
              variant={assigneeFilter === "mine" ? "default" : "outline"}
              size="sm"
              onClick={() => setAssigneeFilter("mine")}
            >
              Assigned to Me
            </Button>
            <Button
              variant={assigneeFilter === "unassigned" ? "default" : "outline"}
              size="sm"
              onClick={() => setAssigneeFilter("unassigned")}
            >
              Unassigned
            </Button>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <span className="text-sm text-muted-foreground py-1">Category:</span>
          <Button
            variant={categoryFilter === null ? "default" : "outline"}
            size="sm"
            onClick={() => setCategoryFilter(null)}
          >
            All
          </Button>
          {Object.entries(categoryConfig).map(([key, config]) => (
            <Button
              key={key}
              variant={categoryFilter === key ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(key)}
            >
              {config.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Controls List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading controls...</div>
      ) : filteredControls.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Shield className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No controls found</h3>
            <p className="text-muted-foreground">
              {search ? "Try adjusting your search" : "Run the seed script to populate controls"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredControls.map((control) => {
            const statusInfo = statusConfig[control.status as keyof typeof statusConfig]
            const categoryInfo = categoryConfig[control.category as keyof typeof categoryConfig]
            const StatusIcon = statusInfo?.icon || Circle

            return (
              <Link key={control.id} href={`/dashboard/controls/${control.id}`}>
                <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Shield className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-semibold text-primary">
                            {control.code}
                          </span>
                          <span className={cn("text-xs px-2 py-0.5 rounded-full", categoryInfo?.color)}>
                            {categoryInfo?.label}
                          </span>
                        </div>
                        <p className="font-medium text-foreground truncate">{control.name}</p>
                        <p className="text-sm text-muted-foreground truncate">{control.description}</p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className="text-right">
                          <div className={cn("flex items-center gap-1 text-sm", statusInfo?.color)}>
                            <StatusIcon className="h-4 w-4" />
                            {statusInfo?.label}
                          </div>
                          <div className="text-xs text-muted-foreground mt-1">
                            {control._count.evidence} evidence · {control._count.policies} policies
                          </div>
                        </div>
                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Activity, 
  FileCheck, 
  FileText, 
  FolderOpen, 
  Users, 
  Settings,
  ChevronLeft,
  ChevronRight,
  Filter
} from "lucide-react"
import { cn } from "@/lib/utils"

type ActivityLog = {
  id: string
  action: string
  entityType: string
  entityId: string
  details: any
  createdAt: string
  user: {
    id: string
    name: string | null
    email: string
  }
}

type Pagination = {
  page: number
  limit: number
  total: number
  totalPages: number
}

const entityIcons: Record<string, any> = {
  CONTROL: FileCheck,
  POLICY: FileText,
  EVIDENCE: FolderOpen,
  USER: Users,
  ORGANIZATION: Settings,
}

const actionColors: Record<string, string> = {
  CREATE: "text-green-600 bg-green-100",
  UPDATE: "text-blue-600 bg-blue-100",
  DELETE: "text-red-600 bg-red-100",
  APPROVE: "text-purple-600 bg-purple-100",
  REJECT: "text-orange-600 bg-orange-100",
}

function formatAction(action: string): string {
  return action.charAt(0) + action.slice(1).toLowerCase()
}

function formatEntityType(entityType: string): string {
  return entityType.charAt(0) + entityType.slice(1).toLowerCase()
}

function formatDate(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / 60000)
  const diffHours = Math.floor(diffMs / 3600000)
  const diffDays = Math.floor(diffMs / 86400000)

  if (diffMins < 1) return "Just now"
  if (diffMins < 60) return `${diffMins}m ago`
  if (diffHours < 24) return `${diffHours}h ago`
  if (diffDays < 7) return `${diffDays}d ago`
  
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: date.getFullYear() !== now.getFullYear() ? "numeric" : undefined,
  })
}

export default function ActivityPage() {
  const [logs, setLogs] = useState<ActivityLog[]>([])
  const [pagination, setPagination] = useState<Pagination | null>(null)
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchLogs(1)
  }, [filter])

  const fetchLogs = async (page: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ page: page.toString(), limit: "20" })
      if (filter) {
        params.set("entityType", filter)
      }
      
      const res = await fetch(`/api/audit?${params}`)
      if (res.ok) {
        const data = await res.json()
        setLogs(data.logs)
        setPagination(data.pagination)
      }
    } catch (error) {
      console.error("Failed to fetch activity logs:", error)
    } finally {
      setLoading(false)
    }
  }

  const entityTypes = ["CONTROL", "POLICY", "EVIDENCE", "USER", "ORGANIZATION"]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Activity Log</h1>
          <p className="text-muted-foreground mt-1">Track all changes and actions in your organization</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 mb-6 flex-wrap">
        <Button
          variant={filter === null ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter(null)}
        >
          All
        </Button>
        {entityTypes.map((type) => {
          const Icon = entityIcons[type] || Activity
          return (
            <Button
              key={type}
              variant={filter === type ? "default" : "outline"}
              size="sm"
              onClick={() => setFilter(type)}
            >
              <Icon className="h-4 w-4 mr-1" />
              {formatEntityType(type)}s
            </Button>
          )
        })}
      </div>

      {/* Activity List */}
      <Card className="shadow-sm">
        <CardContent className="p-0">
          {loading ? (
            <div className="p-8 text-center text-muted-foreground">
              Loading activity...
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p className="text-lg font-medium">No activity yet</p>
              <p className="text-sm mt-1">Actions will appear here as you use the platform</p>
            </div>
          ) : (
            <div className="divide-y">
              {logs.map((log) => {
                const Icon = entityIcons[log.entityType] || Activity
                const actionColor = actionColors[log.action] || "text-gray-600 bg-gray-100"
                
                return (
                  <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-muted/50 transition-colors">
                    <div className={cn("h-10 w-10 rounded-full flex items-center justify-center", actionColor.split(" ")[1])}>
                      <Icon className={cn("h-5 w-5", actionColor.split(" ")[0])} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm">
                        <span className="font-medium">{log.user.name || log.user.email}</span>
                        {" "}
                        <span className={cn("px-1.5 py-0.5 rounded text-xs font-medium", actionColor)}>
                          {formatAction(log.action)}
                        </span>
                        {" "}
                        <span className="text-muted-foreground">
                          {formatEntityType(log.entityType)}
                        </span>
                      </p>
                      {log.details?.name && (
                        <p className="text-sm text-muted-foreground mt-0.5 truncate">
                          {log.details.name}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground whitespace-nowrap">
                      {formatDate(log.createdAt)}
                    </span>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-muted-foreground">
            Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
            {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
            {pagination.total} activities
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => fetchLogs(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={pagination.page === pagination.totalPages}
              onClick={() => fetchLogs(pagination.page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}

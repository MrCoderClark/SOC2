"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FolderOpen, 
  Search, 
  Plus,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  ChevronRight,
  Shield
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Evidence = {
  id: string
  title: string
  description: string | null
  fileUrl: string | null
  fileType: string | null
  status: string
  createdAt: string
  control: {
    id: string
    code: string
    name: string
  }
  uploadedBy: {
    id: string
    name: string
    email: string
  }
}

const statusConfig = {
  PENDING: { label: "Pending", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
  EXPIRED: { label: "Expired", icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted" },
}

export default function EvidencePage() {
  const [evidence, setEvidence] = useState<Evidence[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  useEffect(() => {
    fetchEvidence()
  }, [statusFilter])

  const fetchEvidence = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      
      const res = await fetch(`/api/evidence?${params}`)
      const data = await res.json()
      setEvidence(data)
    } catch (error) {
      console.error("Failed to fetch evidence:", error)
    } finally {
      setLoading(false)
    }
  }

  const filteredEvidence = evidence.filter(
    (item) =>
      item.title.toLowerCase().includes(search.toLowerCase()) ||
      item.control.code.toLowerCase().includes(search.toLowerCase()) ||
      item.control.name.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: evidence.length,
    approved: evidence.filter((e) => e.status === "APPROVED").length,
    pending: evidence.filter((e) => e.status === "PENDING").length,
    rejected: evidence.filter((e) => e.status === "REJECTED").length,
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Evidence</h1>
          <p className="text-muted-foreground mt-1">
            Manage compliance evidence and documentation
          </p>
        </div>
        <Link href="/dashboard/evidence/new">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Upload Evidence
          </Button>
        </Link>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4 mb-8">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Total</div>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Approved</div>
            <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Pending</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Rejected</div>
            <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search evidence..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
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
      </div>

      {/* Evidence List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading evidence...</div>
      ) : filteredEvidence.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <FolderOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No evidence found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? "Try adjusting your search" : "Upload your first evidence to get started"}
            </p>
            {!search && (
              <Link href="/dashboard/evidence/new">
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Upload Evidence
                </Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredEvidence.map((item) => {
            const statusInfo = statusConfig[item.status as keyof typeof statusConfig]
            const StatusIcon = statusInfo?.icon || Clock

            return (
              <Link key={item.id} href={`/dashboard/evidence/${item.id}`}>
                <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FolderOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{item.title}</p>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <Shield className="h-3 w-3" />
                          <span className="font-mono">{item.control.code}</span>
                          <span>·</span>
                          <span>{item.control.name}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={cn("flex items-center gap-1 text-sm px-2 py-1 rounded-full", statusInfo?.bg, statusInfo?.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo?.label}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {new Date(item.createdAt).toLocaleDateString()}
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

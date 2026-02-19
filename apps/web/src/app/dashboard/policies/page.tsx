"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  Search, 
  Plus,
  CheckCircle2,
  Clock,
  FileEdit,
  Archive,
  ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type Policy = {
  id: string
  title: string
  content: string
  version: number
  status: string
  createdAt: string
  updatedAt: string
  controls: Array<{
    id: string
    code: string
    name: string
  }>
  _count: {
    controls: number
  }
}

const statusConfig = {
  DRAFT: { label: "Draft", icon: FileEdit, color: "text-muted-foreground", bg: "bg-muted" },
  REVIEW: { label: "In Review", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  ARCHIVED: { label: "Archived", icon: Archive, color: "text-muted-foreground", bg: "bg-muted" },
}

export default function PoliciesPage() {
  const [policies, setPolicies] = useState<Policy[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [creating, setCreating] = useState(false)

  useEffect(() => {
    fetchPolicies()
  }, [statusFilter])

  const fetchPolicies = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter) params.set("status", statusFilter)
      
      const res = await fetch(`/api/policies?${params}`)
      const data = await res.json()
      setPolicies(data)
    } catch (error) {
      console.error("Failed to fetch policies:", error)
    } finally {
      setLoading(false)
    }
  }

  const createPolicy = async () => {
    if (!newTitle.trim()) return
    setCreating(true)
    try {
      const res = await fetch("/api/policies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: newTitle }),
      })
      if (res.ok) {
        setNewTitle("")
        setShowCreateModal(false)
        fetchPolicies()
      }
    } catch (error) {
      console.error("Failed to create policy:", error)
    } finally {
      setCreating(false)
    }
  }

  const filteredPolicies = policies.filter(
    (policy) =>
      policy.title.toLowerCase().includes(search.toLowerCase()) ||
      policy.content.toLowerCase().includes(search.toLowerCase())
  )

  const stats = {
    total: policies.length,
    approved: policies.filter((p) => p.status === "APPROVED").length,
    review: policies.filter((p) => p.status === "REVIEW").length,
    draft: policies.filter((p) => p.status === "DRAFT").length,
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Policies</h1>
          <p className="text-muted-foreground mt-1">
            Manage your compliance policies and documentation
          </p>
        </div>
        <Button onClick={() => setShowCreateModal(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Policy
        </Button>
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
            <div className="text-sm text-muted-foreground">In Review</div>
            <div className="text-2xl font-bold text-yellow-600">{stats.review}</div>
          </CardContent>
        </Card>
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="text-sm text-muted-foreground">Draft</div>
            <div className="text-2xl font-bold text-muted-foreground">{stats.draft}</div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search policies..."
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

      {/* Create Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-md shadow-lg">
            <CardContent className="p-6">
              <h2 className="text-lg font-semibold mb-4">Create New Policy</h2>
              <Input
                placeholder="Policy title..."
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                className="mb-4"
                autoFocus
              />
              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => setShowCreateModal(false)}>
                  Cancel
                </Button>
                <Button onClick={createPolicy} disabled={creating || !newTitle.trim()}>
                  {creating ? "Creating..." : "Create"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Policies List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading policies...</div>
      ) : filteredPolicies.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No policies found</h3>
            <p className="text-muted-foreground mb-4">
              {search ? "Try adjusting your search" : "Create your first policy to get started"}
            </p>
            {!search && (
              <Button onClick={() => setShowCreateModal(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Policy
              </Button>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {filteredPolicies.map((policy) => {
            const statusInfo = statusConfig[policy.status as keyof typeof statusConfig]
            const StatusIcon = statusInfo?.icon || FileEdit

            return (
              <Link key={policy.id} href={`/dashboard/policies/${policy.id}`}>
                <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-4">
                      <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground">{policy.title}</p>
                        <p className="text-sm text-muted-foreground">
                          Version {policy.version} · {policy._count.controls} linked controls
                        </p>
                      </div>
                      <div className="flex items-center gap-4">
                        <div className={cn("flex items-center gap-1 text-sm px-2 py-1 rounded-full", statusInfo?.bg, statusInfo?.color)}>
                          <StatusIcon className="h-3 w-3" />
                          {statusInfo?.label}
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

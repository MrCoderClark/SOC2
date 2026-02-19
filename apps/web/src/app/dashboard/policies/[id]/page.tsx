"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FileText, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileEdit,
  Archive,
  Shield,
  Save,
  Trash2
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
    status: string
  }>
}

const statusConfig = {
  DRAFT: { label: "Draft", icon: FileEdit, color: "text-muted-foreground", bg: "bg-muted" },
  REVIEW: { label: "In Review", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  ARCHIVED: { label: "Archived", icon: Archive, color: "text-muted-foreground", bg: "bg-muted" },
}

export default function PolicyDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [policy, setPolicy] = useState<Policy | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState("")
  const [content, setContent] = useState("")

  useEffect(() => {
    fetchPolicy()
  }, [params.id])

  const fetchPolicy = async () => {
    try {
      const res = await fetch(`/api/policies/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setPolicy(data)
      setTitle(data.title)
      setContent(data.content)
    } catch (error) {
      console.error("Failed to fetch policy:", error)
    } finally {
      setLoading(false)
    }
  }

  const savePolicy = async () => {
    if (!policy) return
    setSaving(true)
    try {
      const res = await fetch(`/api/policies/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, content }),
      })
      if (res.ok) {
        const updated = await res.json()
        setPolicy(updated)
      }
    } catch (error) {
      console.error("Failed to save policy:", error)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!policy) return
    setSaving(true)
    try {
      const res = await fetch(`/api/policies/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setPolicy({ ...policy, status: updated.status })
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setSaving(false)
    }
  }

  const deletePolicy = async () => {
    if (!confirm("Are you sure you want to delete this policy?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/policies/${params.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/dashboard/policies")
      }
    } catch (error) {
      console.error("Failed to delete policy:", error)
    } finally {
      setDeleting(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  if (!policy) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Policy not found</h2>
          <Link href="/dashboard/policies">
            <Button variant="outline">Back to Policies</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[policy.status as keyof typeof statusConfig]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/policies" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Policies
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <FileText className="h-7 w-7 text-primary" />
            </div>
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-semibold border-none p-0 h-auto focus-visible:ring-0"
                placeholder="Policy title..."
              />
              <p className="text-muted-foreground mt-1">
                Version {policy.version} · Last updated {new Date(policy.updatedAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={deletePolicy} disabled={deleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
            <Button onClick={savePolicy} disabled={saving}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save"}
            </Button>
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
                  const isActive = policy.status === key
                  return (
                    <Button
                      key={key}
                      variant={isActive ? "default" : "outline"}
                      size="sm"
                      disabled={saving}
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

          {/* Content Editor */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Policy Content</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full min-h-[400px] p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Write your policy content here..."
              />
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Linked Controls</CardTitle>
            </CardHeader>
            <CardContent>
              {policy.controls.length === 0 ? (
                <div className="text-center py-4 text-muted-foreground">
                  <Shield className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No controls linked</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {policy.controls.map((control) => (
                    <Link 
                      key={control.id} 
                      href={`/dashboard/controls/${control.id}`}
                      className="flex items-center gap-2 p-2 rounded-lg hover:bg-muted transition-colors"
                    >
                      <Shield className="h-4 w-4 text-primary" />
                      <div>
                        <span className="font-mono text-xs text-primary">{control.code}</span>
                        <p className="text-sm truncate">{control.name}</p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Version</p>
                <p className="text-sm font-medium mt-1">{policy.version}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium mt-1">
                  {new Date(policy.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium mt-1">
                  {new Date(policy.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

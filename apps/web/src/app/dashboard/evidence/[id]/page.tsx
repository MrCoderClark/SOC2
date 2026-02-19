"use client"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  FolderOpen, 
  ArrowLeft,
  CheckCircle2,
  Clock,
  XCircle,
  AlertCircle,
  Shield,
  Save,
  Trash2,
  ExternalLink
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
  updatedAt: string
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
  PENDING: { label: "Pending Review", icon: Clock, color: "text-yellow-600", bg: "bg-yellow-100" },
  APPROVED: { label: "Approved", icon: CheckCircle2, color: "text-green-600", bg: "bg-green-100" },
  REJECTED: { label: "Rejected", icon: XCircle, color: "text-red-600", bg: "bg-red-100" },
  EXPIRED: { label: "Expired", icon: AlertCircle, color: "text-muted-foreground", bg: "bg-muted" },
}

export default function EvidenceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")

  useEffect(() => {
    fetchEvidence()
  }, [params.id])

  const fetchEvidence = async () => {
    try {
      const res = await fetch(`/api/evidence/${params.id}`)
      if (!res.ok) throw new Error("Failed to fetch")
      const data = await res.json()
      setEvidence(data)
      setTitle(data.title)
      setDescription(data.description || "")
    } catch (error) {
      console.error("Failed to fetch evidence:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveEvidence = async () => {
    if (!evidence) return
    setSaving(true)
    try {
      const res = await fetch(`/api/evidence/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description }),
      })
      if (res.ok) {
        const updated = await res.json()
        setEvidence(updated)
      }
    } catch (error) {
      console.error("Failed to save evidence:", error)
    } finally {
      setSaving(false)
    }
  }

  const updateStatus = async (newStatus: string) => {
    if (!evidence) return
    setSaving(true)
    try {
      const res = await fetch(`/api/evidence/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      })
      if (res.ok) {
        const updated = await res.json()
        setEvidence({ ...evidence, status: updated.status })
      }
    } catch (error) {
      console.error("Failed to update status:", error)
    } finally {
      setSaving(false)
    }
  }

  const deleteEvidence = async () => {
    if (!confirm("Are you sure you want to delete this evidence?")) return
    setDeleting(true)
    try {
      const res = await fetch(`/api/evidence/${params.id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        router.push("/dashboard/evidence")
      }
    } catch (error) {
      console.error("Failed to delete evidence:", error)
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

  if (!evidence) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold mb-2">Evidence not found</h2>
          <Link href="/dashboard/evidence">
            <Button variant="outline">Back to Evidence</Button>
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[evidence.status as keyof typeof statusConfig]

  return (
    <div className="p-8 max-w-5xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <Link 
          href="/dashboard/evidence" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Evidence
        </Link>
        
        <div className="flex items-start justify-between">
          <div className="flex items-start gap-4">
            <div className="h-14 w-14 rounded-xl bg-primary/10 flex items-center justify-center">
              <FolderOpen className="h-7 w-7 text-primary" />
            </div>
            <div>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="text-2xl font-semibold border-none p-0 h-auto focus-visible:ring-0"
                placeholder="Evidence title..."
              />
              <p className="text-muted-foreground mt-1">
                Uploaded {new Date(evidence.createdAt).toLocaleDateString()} by {evidence.uploadedBy.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={deleteEvidence} disabled={deleting}>
              <Trash2 className="h-4 w-4 mr-2" />
              {deleting ? "Deleting..." : "Delete"}
            </Button>
            <Button onClick={saveEvidence} disabled={saving}>
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
              <CardTitle className="text-base">Review Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {Object.entries(statusConfig).map(([key, config]) => {
                  const Icon = config.icon
                  const isActive = evidence.status === key
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

          {/* Description */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[200px] p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Describe what this evidence demonstrates..."
              />
            </CardContent>
          </Card>

          {/* File */}
          {evidence.fileUrl && (
            <Card className="shadow-sm">
              <CardHeader>
                <CardTitle className="text-base">Attached File</CardTitle>
              </CardHeader>
              <CardContent>
                <a 
                  href={evidence.fileUrl} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-primary hover:underline"
                >
                  <ExternalLink className="h-4 w-4" />
                  View File
                </a>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Linked Control</CardTitle>
            </CardHeader>
            <CardContent>
              <Link 
                href={`/dashboard/controls/${evidence.control.id}`}
                className="flex items-center gap-3 p-3 rounded-lg bg-muted/50 hover:bg-muted transition-colors"
              >
                <Shield className="h-5 w-5 text-primary" />
                <div>
                  <span className="font-mono text-sm font-semibold text-primary">{evidence.control.code}</span>
                  <p className="text-sm">{evidence.control.name}</p>
                </div>
              </Link>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground">Uploaded By</p>
                <p className="text-sm font-medium mt-1">{evidence.uploadedBy.name}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="text-sm font-medium mt-1">
                  {new Date(evidence.createdAt).toLocaleDateString()}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Last Updated</p>
                <p className="text-sm font-medium mt-1">
                  {new Date(evidence.updatedAt).toLocaleDateString()}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

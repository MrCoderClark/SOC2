"use client"

import { useEffect, useState, useRef } from "react"
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
  ExternalLink,
  FileUp,
  File,
  X,
  Pencil
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
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [evidence, setEvidence] = useState<Evidence | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [fileUrl, setFileUrl] = useState<string | null>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

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
      setFileUrl(data.fileUrl)
    } catch (error) {
      console.error("Failed to fetch evidence:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
    }
  }

  const handleFileUpload = async () => {
    if (!selectedFile) return
    
    setUploading(true)
    try {
      const formData = new FormData()
      formData.append("file", selectedFile)
      
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      })
      
      if (res.ok) {
        const data = await res.json()
        setFileUrl(data.url)
        setSelectedFile(null)
        // Save the file URL to the evidence
        await fetch(`/api/evidence/${params.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ fileUrl: data.url }),
        })
      } else {
        const error = await res.json()
        alert(error.error || "Upload failed")
      }
    } catch (error) {
      console.error("Failed to upload file:", error)
      alert("Failed to upload file")
    } finally {
      setUploading(false)
    }
  }

  const removeFile = () => {
    setSelectedFile(null)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const saveEvidence = async () => {
    if (!evidence) return
    setSaving(true)
    try {
      const res = await fetch(`/api/evidence/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, description, fileUrl }),
      })
      if (res.ok) {
        const updated = await res.json()
        setEvidence(updated)
        setIsEditing(false) // Exit edit mode after save
      }
    } catch (error) {
      console.error("Failed to save evidence:", error)
    } finally {
      setSaving(false)
    }
  }

  const cancelEdit = () => {
    // Reset to original values
    if (evidence) {
      setTitle(evidence.title)
      setDescription(evidence.description || "")
      setFileUrl(evidence.fileUrl)
    }
    setSelectedFile(null)
    setIsEditing(false)
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
              {isEditing ? (
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="text-2xl font-semibold border-none p-0 h-auto focus-visible:ring-0"
                  placeholder="Evidence title..."
                />
              ) : (
                <h1 className="text-2xl font-semibold text-foreground">{evidence.title}</h1>
              )}
              <p className="text-muted-foreground mt-1">
                Uploaded {new Date(evidence.createdAt).toLocaleDateString()} by {evidence.uploadedBy.name}
              </p>
            </div>
          </div>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={cancelEdit}>
                  Cancel
                </Button>
                <Button onClick={saveEvidence} disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? "Saving..." : "Save Changes"}
                </Button>
              </>
            ) : (
              <>
                <Button variant="outline" onClick={deleteEvidence} disabled={deleting}>
                  <Trash2 className="h-4 w-4 mr-2" />
                  {deleting ? "Deleting..." : "Delete"}
                </Button>
                <Button onClick={() => setIsEditing(true)}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </Button>
              </>
            )}
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
              {isEditing ? (
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
              ) : (
                <div className={cn("inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", statusConfig[evidence.status as keyof typeof statusConfig]?.bg, statusConfig[evidence.status as keyof typeof statusConfig]?.color)}>
                  {(() => {
                    const StatusIcon = statusConfig[evidence.status as keyof typeof statusConfig]?.icon || Clock
                    return <StatusIcon className="h-4 w-4" />
                  })()}
                  {statusConfig[evidence.status as keyof typeof statusConfig]?.label || evidence.status}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Description */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Description</CardTitle>
            </CardHeader>
            <CardContent>
              {isEditing ? (
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full min-h-[200px] p-4 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
                  placeholder="Describe what this evidence demonstrates..."
                />
              ) : (
                <div className="min-h-[100px] text-sm text-foreground whitespace-pre-wrap">
                  {evidence.description || <span className="text-muted-foreground italic">No description provided</span>}
                </div>
              )}
            </CardContent>
          </Card>

          {/* File */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-base">Attached File</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Show existing file (always visible) */}
              {fileUrl && !selectedFile && (
                <div className="flex items-center gap-3 p-3 border border-green-200 bg-green-50 rounded-lg mb-4">
                  <CheckCircle2 className="h-6 w-6 text-green-600" />
                  <div className="flex-1">
                    <a 
                      href={fileUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="font-medium text-sm text-primary hover:underline flex items-center gap-1"
                    >
                      <ExternalLink className="h-4 w-4" />
                      View Attached File
                    </a>
                  </div>
                </div>
              )}
              
              {/* No file message in view mode */}
              {!fileUrl && !isEditing && (
                <p className="text-sm text-muted-foreground italic">No file attached</p>
              )}
              
              {/* Upload area - only in edit mode */}
              {isEditing && (
                <>
                  {/* Upload new file area */}
                  {!selectedFile && (
                    <div 
                      onClick={() => fileInputRef.current?.click()}
                      className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                    >
                      <FileUp className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">{fileUrl ? "Replace file" : "Upload a file"}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        PDF, Word, Excel, Images, CSV (max 10MB)
                      </p>
                    </div>
                  )}
                  
                  {/* Selected file - ready to upload */}
                  {selectedFile && (
                    <div className="border rounded-lg p-4">
                      <div className="flex items-center gap-3">
                        <File className="h-8 w-8 text-blue-600" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{selectedFile.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {(selectedFile.size / 1024).toFixed(1)} KB
                          </p>
                        </div>
                        <Button 
                          type="button" 
                          size="sm" 
                          onClick={handleFileUpload}
                          disabled={uploading}
                        >
                          {uploading ? "Uploading..." : "Upload"}
                        </Button>
                        <button 
                          type="button"
                          onClick={removeFile}
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <X className="h-5 w-5" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.csv,.txt"
                className="hidden"
              />
            </CardContent>
          </Card>
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

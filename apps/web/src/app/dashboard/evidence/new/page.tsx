"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload, FileUp, X, File, CheckCircle2 } from "lucide-react"
import Link from "next/link"

type Control = {
  id: string
  code: string
  name: string
}

export default function NewEvidencePage() {
  const router = useRouter()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [controlId, setControlId] = useState("")
  const [fileUrl, setFileUrl] = useState("")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState("")

  useEffect(() => {
    fetchControls()
  }, [])

  const fetchControls = async () => {
    try {
      const res = await fetch("/api/controls")
      const data = await res.json()
      setControls(data)
    } catch (error) {
      console.error("Failed to fetch controls:", error)
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      // Auto-fill title if empty
      if (!title) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""))
      }
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
        setUploadedFileName(selectedFile.name)
        setSelectedFile(null)
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
    setFileUrl("")
    setUploadedFileName("")
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title || !controlId) return

    setLoading(true)
    try {
      const res = await fetch("/api/evidence", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          description,
          controlId,
          fileUrl: fileUrl || null,
        }),
      })

      if (res.ok) {
        router.push("/dashboard/evidence")
      }
    } catch (error) {
      console.error("Failed to create evidence:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <Link 
          href="/dashboard/evidence" 
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-4"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Evidence
        </Link>
        
        <h1 className="text-2xl font-semibold text-foreground">Upload Evidence</h1>
        <p className="text-muted-foreground mt-1">
          Add new evidence to support your compliance controls
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-base">Evidence Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <label className="text-sm font-medium mb-2 block">Title *</label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Q1 2024 Access Review Report"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe what this evidence demonstrates..."
                className="w-full min-h-[100px] p-3 border rounded-lg resize-y focus:outline-none focus:ring-2 focus:ring-primary"
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Linked Control *</label>
              <select
                value={controlId}
                onChange={(e) => setControlId(e.target.value)}
                className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                required
              >
                <option value="">Select a control...</option>
                {controls.map((control) => (
                  <option key={control.id} value={control.id}>
                    {control.code} - {control.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Upload File</label>
              
              {/* File upload area */}
              {!fileUrl && !selectedFile && (
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors"
                >
                  <FileUp className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
                  <p className="text-sm font-medium">Click to upload a file</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    PDF, Word, Excel, Images, CSV (max 10MB)
                  </p>
                </div>
              )}
              
              {/* Selected file - ready to upload */}
              {selectedFile && !fileUrl && (
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
              
              {/* Uploaded file - success */}
              {fileUrl && (
                <div className="border border-green-200 bg-green-50 rounded-lg p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle2 className="h-8 w-8 text-green-600" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{uploadedFileName}</p>
                      <p className="text-xs text-green-600">File uploaded successfully</p>
                    </div>
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
              
              <input
                ref={fileInputRef}
                type="file"
                onChange={handleFileSelect}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.png,.jpg,.jpeg,.gif,.csv,.txt"
                className="hidden"
              />
              
              <p className="text-xs text-muted-foreground mt-2">
                Or paste a link to external file (Google Drive, SharePoint, etc.)
              </p>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
                className="mt-2"
                disabled={!!uploadedFileName}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="submit" disabled={loading || !title || !controlId}>
                <Upload className="h-4 w-4 mr-2" />
                {loading ? "Uploading..." : "Upload Evidence"}
              </Button>
              <Link href="/dashboard/evidence">
                <Button type="button" variant="outline">Cancel</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

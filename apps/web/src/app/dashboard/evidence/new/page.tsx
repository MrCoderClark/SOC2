"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ArrowLeft, Upload, Shield } from "lucide-react"
import Link from "next/link"

type Control = {
  id: string
  code: string
  name: string
}

export default function NewEvidencePage() {
  const router = useRouter()
  const [controls, setControls] = useState<Control[]>([])
  const [loading, setLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [description, setDescription] = useState("")
  const [controlId, setControlId] = useState("")
  const [fileUrl, setFileUrl] = useState("")

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
              <label className="text-sm font-medium mb-2 block">File URL (optional)</label>
              <Input
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                placeholder="https://..."
              />
              <p className="text-xs text-muted-foreground mt-1">
                Link to the evidence file (Google Drive, SharePoint, etc.)
              </p>
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

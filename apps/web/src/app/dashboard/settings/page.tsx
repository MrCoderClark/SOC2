"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Building2, 
  Save,
  Users,
  FileCheck,
  FileText,
  FolderOpen
} from "lucide-react"

type Organization = {
  id: string
  name: string
  domain: string | null
  logo: string | null
  createdAt: string
  _count: {
    users: number
    controls: number
    policies: number
    evidence: number
  }
}

export default function SettingsPage() {
  const [organization, setOrganization] = useState<Organization | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState("")
  const [domain, setDomain] = useState("")

  useEffect(() => {
    fetchOrganization()
  }, [])

  const fetchOrganization = async () => {
    try {
      const res = await fetch("/api/organizations")
      if (res.ok) {
        const data = await res.json()
        setOrganization(data)
        setName(data.name)
        setDomain(data.domain || "")
      }
    } catch (error) {
      console.error("Failed to fetch organization:", error)
    } finally {
      setLoading(false)
    }
  }

  const saveOrganization = async () => {
    setSaving(true)
    try {
      const res = await fetch("/api/organizations", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, domain: domain || null }),
      })
      if (res.ok) {
        const data = await res.json()
        setOrganization(data)
      }
    } catch (error) {
      console.error("Failed to save organization:", error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="p-8 max-w-4xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
        <p className="text-muted-foreground mt-1">
          Manage your organization settings
        </p>
      </div>

      <div className="space-y-6">
        {/* Organization Details */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Building2 className="h-5 w-5" />
              Organization Details
            </CardTitle>
            <CardDescription>
              Basic information about your organization
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Organization Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your organization name"
              />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Domain</label>
              <Input
                value={domain}
                onChange={(e) => setDomain(e.target.value)}
                placeholder="example.com"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Used for email domain verification
              </p>
            </div>
            <Button onClick={saveOrganization} disabled={saving || !name}>
              <Save className="h-4 w-4 mr-2" />
              {saving ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </Card>

        {/* Organization Stats */}
        {organization && (
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Organization Overview</CardTitle>
              <CardDescription>
                Summary of your compliance data
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <Users className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{organization._count.users}</p>
                    <p className="text-sm text-muted-foreground">Team Members</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <FileCheck className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{organization._count.controls}</p>
                    <p className="text-sm text-muted-foreground">Controls</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <FileText className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{organization._count.policies}</p>
                    <p className="text-sm text-muted-foreground">Policies</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-lg bg-muted/50">
                  <FolderOpen className="h-8 w-8 text-primary" />
                  <div>
                    <p className="text-2xl font-bold">{organization._count.evidence}</p>
                    <p className="text-sm text-muted-foreground">Evidence</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Danger Zone */}
        <Card className="shadow-sm border-red-200">
          <CardHeader>
            <CardTitle className="text-red-600">Danger Zone</CardTitle>
            <CardDescription>
              Irreversible actions for your organization
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button variant="outline" className="text-red-600 border-red-300 hover:bg-red-50">
              Delete Organization
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

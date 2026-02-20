"use client"

import { Suspense, useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  CheckCircle2, 
  XCircle, 
  RefreshCw,
  ExternalLink,
  Shield,
  Users,
  Mail,
  HardDrive,
  AlertTriangle
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type GoogleUser = {
  id: string
  email: string
  name: string
  isAdmin: boolean
  suspended: boolean
  twoFactorEnabled: boolean
}

type ComplianceCheck = {
  totalUsers: number
  adminUsers: number
  suspendedUsers: number
  usersWithout2FA: number
  externallySharedFiles: number
  publicFiles: number
  score: number
}

function GoogleWorkspaceContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [users, setUsers] = useState<GoogleUser[]>([])
  const [email, setEmail] = useState<string | null>(null)
  const [domain, setDomain] = useState<string | null>(null)
  const [compliance, setCompliance] = useState<ComplianceCheck | null>(null)
  const [checkingCompliance, setCheckingCompliance] = useState(false)

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    
    if (success === "google_workspace_connected") {
      router.replace("/dashboard/integrations/google-workspace")
    }
    
    if (error) {
      console.error("Google Workspace connection error:", error)
    }

    fetchData()
  }, [searchParams, router])

  const fetchData = async () => {
    try {
      const res = await fetch("/api/integrations/google-workspace")
      if (res.ok) {
        const data = await res.json()
        setConnected(true)
        setUsers(data.users || [])
        setEmail(data.email || null)
        setDomain(data.domain || null)
      } else {
        setConnected(false)
      }
    } catch (error) {
      console.error("Failed to fetch Google Workspace data:", error)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch("/api/integrations/google-workspace/connect")
      if (res.ok) {
        const data = await res.json()
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Failed to initiate Google Workspace connection:", error)
      setConnecting(false)
    }
  }

  const runComplianceCheck = async () => {
    setCheckingCompliance(true)
    try {
      const res = await fetch("/api/integrations/google-workspace/compliance")
      if (res.ok) {
        const data = await res.json()
        setCompliance(data.check)
      }
    } catch (error) {
      console.error("Failed to run compliance check:", error)
    } finally {
      setCheckingCompliance(false)
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 50) return "text-yellow-600"
    return "text-red-600"
  }

  const getScoreBg = (score: number) => {
    if (score >= 80) return "bg-green-100"
    if (score >= 50) return "bg-yellow-100"
    return "bg-red-100"
  }

  if (loading) {
    return (
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">Loading Google Workspace integration...</div>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center gap-4 mb-8">
        <Link href="/dashboard/integrations" className="text-muted-foreground hover:text-foreground">
          ← Back to Integrations
        </Link>
      </div>

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-blue-500 flex items-center justify-center">
            <Mail className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">Google Workspace Integration</h1>
            <p className="text-muted-foreground">
              {connected ? `Connected as ${email}` : "Connect your Google Workspace for identity compliance"}
            </p>
          </div>
        </div>
        {connected && (
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      {!connected ? (
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <Mail className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Connect Google Workspace</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your Google Workspace to monitor user security settings, 
              2FA enrollment, and Drive sharing policies.
            </p>
            <Button onClick={handleConnect} disabled={connecting} size="lg">
              {connecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Mail className="h-4 w-4 mr-2" />
                  Connect Google Workspace
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Compliance Summary */}
          <section className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-semibold text-foreground uppercase tracking-wide">
                Compliance Overview
              </h2>
              <Button onClick={runComplianceCheck} disabled={checkingCompliance}>
                {checkingCompliance ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Checking...
                  </>
                ) : (
                  <>
                    <Shield className="h-4 w-4 mr-2" />
                    Run Compliance Check
                  </>
                )}
              </Button>
            </div>

            {compliance ? (
              <div className="space-y-4">
                <div className="grid gap-4 md:grid-cols-4">
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Compliance Score</p>
                      <p className={cn("text-2xl font-bold", getScoreColor(compliance.score))}>
                        {compliance.score}%
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Total Users</p>
                      <p className="text-2xl font-bold">{compliance.totalUsers}</p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Without 2FA</p>
                      <p className={cn("text-2xl font-bold", compliance.usersWithout2FA > 0 ? "text-red-600" : "text-green-600")}>
                        {compliance.usersWithout2FA}
                      </p>
                    </CardContent>
                  </Card>
                  <Card className="shadow-sm">
                    <CardContent className="p-4">
                      <p className="text-sm text-muted-foreground">Public Files</p>
                      <p className={cn("text-2xl font-bold", compliance.publicFiles > 0 ? "text-yellow-600" : "text-green-600")}>
                        {compliance.publicFiles}
                      </p>
                    </CardContent>
                  </Card>
                </div>

                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <h3 className="font-medium mb-3">Security Findings</h3>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        {compliance.usersWithout2FA === 0 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                        <span className="text-sm">
                          {compliance.usersWithout2FA === 0 
                            ? "All users have 2FA enabled" 
                            : `${compliance.usersWithout2FA} users without 2FA`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {compliance.publicFiles === 0 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-sm">
                          {compliance.publicFiles === 0 
                            ? "No publicly shared files" 
                            : `${compliance.publicFiles} publicly accessible files`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {compliance.externallySharedFiles === 0 ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertTriangle className="h-4 w-4 text-yellow-600" />
                        )}
                        <span className="text-sm">
                          {compliance.externallySharedFiles === 0 
                            ? "No externally shared files" 
                            : `${compliance.externallySharedFiles} files shared externally`}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-600" />
                        <span className="text-sm">
                          {compliance.adminUsers} admin users ({Math.round((compliance.adminUsers / compliance.totalUsers) * 100)}% of total)
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Run a compliance check to see your Google Workspace security status</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Users */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Users ({users.length})
            </h2>
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y max-h-96 overflow-y-auto">
                  {users.length === 0 ? (
                    <div className="p-8 text-center text-muted-foreground">
                      <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>No users found. Admin API access may be required.</p>
                    </div>
                  ) : (
                    users.slice(0, 20).map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                        <div className="flex items-center gap-3">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium text-sm">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.email}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          {user.isAdmin && (
                            <span className="text-xs px-2 py-0.5 rounded bg-purple-100 text-purple-700">
                              Admin
                            </span>
                          )}
                          {user.suspended && (
                            <span className="text-xs px-2 py-0.5 rounded bg-red-100 text-red-700">
                              Suspended
                            </span>
                          )}
                          {user.twoFactorEnabled ? (
                            <span className="text-xs px-2 py-0.5 rounded bg-green-100 text-green-700">
                              2FA
                            </span>
                          ) : (
                            <span className="text-xs px-2 py-0.5 rounded bg-yellow-100 text-yellow-700">
                              No 2FA
                            </span>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}

export default function GoogleWorkspacePage() {
  return (
    <Suspense fallback={
      <div className="p-8 max-w-5xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">Loading Google Workspace integration...</div>
      </div>
    }>
      <GoogleWorkspaceContent />
    </Suspense>
  )
}

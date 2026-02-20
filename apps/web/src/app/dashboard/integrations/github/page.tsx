"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { 
  Github, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle,
  RefreshCw,
  ExternalLink,
  Shield,
  GitBranch,
  Users,
  FileText,
  Bot
} from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"

type GitHubRepo = {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string | null
  html_url: string
}

type ComplianceCheck = {
  repo: string
  branchProtection: boolean
  requiresReviews: boolean
  requiresStatusChecks: boolean
  hasCodeOwners: boolean
  hasSecurityPolicy: boolean
  hasDependabot: boolean
  score: number
}

type ComplianceSummary = {
  totalRepos: number
  averageScore: number
  compliantRepos: number
  needsAttention: number
}

export default function GitHubIntegrationPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(true)
  const [connecting, setConnecting] = useState(false)
  const [connected, setConnected] = useState(false)
  const [repos, setRepos] = useState<GitHubRepo[]>([])
  const [username, setUsername] = useState<string | null>(null)
  const [complianceChecks, setComplianceChecks] = useState<ComplianceCheck[]>([])
  const [summary, setSummary] = useState<ComplianceSummary | null>(null)
  const [checkingCompliance, setCheckingCompliance] = useState(false)

  useEffect(() => {
    const success = searchParams.get("success")
    const error = searchParams.get("error")
    
    if (success === "github_connected") {
      // Clear the URL params
      router.replace("/dashboard/integrations/github")
    }
    
    if (error) {
      console.error("GitHub connection error:", error)
    }

    fetchGitHubData()
  }, [searchParams, router])

  const fetchGitHubData = async () => {
    try {
      const res = await fetch("/api/integrations/github")
      if (res.ok) {
        const data = await res.json()
        setConnected(true)
        setRepos(data.repositories || [])
        setUsername(data.user?.login || null)
      } else {
        setConnected(false)
      }
    } catch (error) {
      console.error("Failed to fetch GitHub data:", error)
      setConnected(false)
    } finally {
      setLoading(false)
    }
  }

  const handleConnect = async () => {
    setConnecting(true)
    try {
      const res = await fetch("/api/integrations/github/connect")
      if (res.ok) {
        const data = await res.json()
        window.location.href = data.url
      }
    } catch (error) {
      console.error("Failed to initiate GitHub connection:", error)
      setConnecting(false)
    }
  }

  const runComplianceCheck = async () => {
    setCheckingCompliance(true)
    try {
      const res = await fetch("/api/integrations/github/compliance")
      if (res.ok) {
        const data = await res.json()
        setComplianceChecks(data.checks)
        setSummary(data.summary)
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
        <div className="text-center py-12 text-muted-foreground">Loading GitHub integration...</div>
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
          <div className="h-12 w-12 rounded-lg bg-gray-900 flex items-center justify-center">
            <Github className="h-7 w-7 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-foreground">GitHub Integration</h1>
            <p className="text-muted-foreground">
              {connected ? `Connected as @${username}` : "Connect your GitHub account for code compliance"}
            </p>
          </div>
        </div>
        {connected && (
          <Button variant="outline" onClick={fetchGitHubData}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        )}
      </div>

      {!connected ? (
        <Card className="shadow-sm">
          <CardContent className="p-8 text-center">
            <Github className="h-16 w-16 mx-auto mb-4 text-muted-foreground" />
            <h2 className="text-xl font-semibold mb-2">Connect GitHub</h2>
            <p className="text-muted-foreground mb-6 max-w-md mx-auto">
              Connect your GitHub account to automatically check repository security settings, 
              branch protection rules, and compliance configurations.
            </p>
            <Button onClick={handleConnect} disabled={connecting} size="lg">
              {connecting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Connecting...
                </>
              ) : (
                <>
                  <Github className="h-4 w-4 mr-2" />
                  Connect GitHub
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

            {summary ? (
              <div className="grid gap-4 md:grid-cols-4">
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Repositories Checked</p>
                    <p className="text-2xl font-bold">{summary.totalRepos}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Average Score</p>
                    <p className={cn("text-2xl font-bold", getScoreColor(summary.averageScore))}>
                      {summary.averageScore}%
                    </p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Compliant</p>
                    <p className="text-2xl font-bold text-green-600">{summary.compliantRepos}</p>
                  </CardContent>
                </Card>
                <Card className="shadow-sm">
                  <CardContent className="p-4">
                    <p className="text-sm text-muted-foreground">Needs Attention</p>
                    <p className="text-2xl font-bold text-red-600">{summary.needsAttention}</p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <Card className="shadow-sm">
                <CardContent className="p-8 text-center text-muted-foreground">
                  <Shield className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Run a compliance check to see your repository security status</p>
                </CardContent>
              </Card>
            )}
          </section>

          {/* Compliance Checks */}
          {complianceChecks.length > 0 && (
            <section className="mb-8">
              <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
                Repository Compliance
              </h2>
              <div className="space-y-3">
                {complianceChecks.map((check) => (
                  <Card key={check.repo} className="shadow-sm">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={cn("h-10 w-10 rounded-lg flex items-center justify-center", getScoreBg(check.score))}>
                            <span className={cn("font-bold", getScoreColor(check.score))}>{check.score}</span>
                          </div>
                          <div>
                            <p className="font-medium">{check.repo}</p>
                            <div className="flex gap-3 mt-1">
                              <span className="flex items-center gap-1 text-xs">
                                {check.branchProtection ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-600" />
                                )}
                                Branch Protection
                              </span>
                              <span className="flex items-center gap-1 text-xs">
                                {check.requiresReviews ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-600" />
                                )}
                                PR Reviews
                              </span>
                              <span className="flex items-center gap-1 text-xs">
                                {check.hasCodeOwners ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-600" />
                                )}
                                CODEOWNERS
                              </span>
                              <span className="flex items-center gap-1 text-xs">
                                {check.hasSecurityPolicy ? (
                                  <CheckCircle2 className="h-3 w-3 text-green-600" />
                                ) : (
                                  <XCircle className="h-3 w-3 text-red-600" />
                                )}
                                Security Policy
                              </span>
                            </div>
                          </div>
                        </div>
                        <a
                          href={`https://github.com/${check.repo}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          )}

          {/* Repositories */}
          <section>
            <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">
              Repositories ({repos.length})
            </h2>
            <Card className="shadow-sm">
              <CardContent className="p-0">
                <div className="divide-y max-h-96 overflow-y-auto">
                  {repos.slice(0, 20).map((repo) => (
                    <div key={repo.id} className="flex items-center justify-between p-4 hover:bg-muted/50">
                      <div className="flex items-center gap-3">
                        <GitBranch className="h-4 w-4 text-muted-foreground" />
                        <div>
                          <p className="font-medium text-sm">{repo.full_name}</p>
                          {repo.description && (
                            <p className="text-xs text-muted-foreground truncate max-w-md">
                              {repo.description}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "text-xs px-2 py-0.5 rounded",
                          repo.private ? "bg-yellow-100 text-yellow-700" : "bg-green-100 text-green-700"
                        )}>
                          {repo.private ? "Private" : "Public"}
                        </span>
                        <a
                          href={repo.html_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-muted-foreground hover:text-foreground"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </section>
        </>
      )}
    </div>
  )
}

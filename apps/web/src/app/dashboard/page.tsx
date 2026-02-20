"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { FileCheck, FileText, FolderOpen, Users, Shield, Link2, TrendingUp, Clock, CheckCircle2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

type DashboardStats = {
  complianceScore: number
  controls: {
    total: number
    implemented: number
    inProgress: number
    notStarted: number
    notApplicable: number
  }
  policies: {
    total: number
    approved: number
    draft: number
    review: number
  }
  evidence: {
    total: number
    approved: number
    pending: number
    rejected: number
  }
  recentControls: Array<{
    id: string
    code: string
    name: string
    status: string
    updatedAt: string
  }>
  recentEvidence: Array<{
    id: string
    title: string
    status: string
    createdAt: string
    control: { code: string; name: string }
    uploadedBy: { name: string }
  }>
}

const controlStatusColors = {
  IMPLEMENTED: "text-green-600",
  IN_PROGRESS: "text-yellow-600",
  NOT_STARTED: "text-gray-400",
  NOT_APPLICABLE: "text-muted-foreground",
}

export default function DashboardPage() {
  const router = useRouter()
  const [stats, setStats] = useState<DashboardStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [needsOnboarding, setNeedsOnboarding] = useState(false)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const res = await fetch("/api/dashboard/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else if (res.status === 404) {
        const data = await res.json()
        if (data.error === "Organization not found") {
          setNeedsOnboarding(true)
        }
      }
    } catch (error) {
      console.error("Failed to fetch dashboard stats:", error)
    } finally {
      setLoading(false)
    }
  }

  if (needsOnboarding) {
    router.push("/onboarding")
    return null
  }

  if (loading) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="text-center py-12 text-muted-foreground">Loading dashboard...</div>
      </div>
    )
  }

  const complianceScore = stats?.complianceScore || 0

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
        <p className="text-muted-foreground mt-1">Your SOC 2 compliance overview</p>
      </div>

      {/* Compliance Score */}
      <section className="mb-8">
        <Card className="shadow-sm bg-gradient-to-r from-primary/5 to-primary/10">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Compliance Score</h2>
                <div className="flex items-baseline gap-2 mt-2">
                  <span className="text-5xl font-bold text-foreground">{complianceScore}%</span>
                  <TrendingUp className="h-5 w-5 text-green-600" />
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  {stats?.controls.implemented || 0} of {stats?.controls.total || 0} controls implemented
                </p>
              </div>
              <div className="h-32 w-32 relative">
                <svg className="h-32 w-32 transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    className="text-muted"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="currentColor"
                    strokeWidth="12"
                    fill="none"
                    strokeDasharray={`${complianceScore * 3.52} 352`}
                    className="text-primary"
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <Shield className="h-10 w-10 text-primary" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* Stats Grid */}
      <section className="mb-8">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/dashboard/controls">
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <FileCheck className="h-5 w-5 text-blue-600" />
                  </div>
                  <span className="font-semibold text-foreground">Controls</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">{stats?.controls.total || 0}</span>
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-green-600">{stats?.controls.implemented || 0} done</span>
                  <span className="text-yellow-600">{stats?.controls.inProgress || 0} in progress</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/policies">
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-purple-100 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-purple-600" />
                  </div>
                  <span className="font-semibold text-foreground">Policies</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">{stats?.policies.total || 0}</span>
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-green-600">{stats?.policies.approved || 0} approved</span>
                  <span className="text-yellow-600">{stats?.policies.review || 0} in review</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/evidence">
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-orange-100 flex items-center justify-center">
                    <FolderOpen className="h-5 w-5 text-orange-600" />
                  </div>
                  <span className="font-semibold text-foreground">Evidence</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">{stats?.evidence.total || 0}</span>
                </div>
                <div className="flex gap-2 mt-2 text-xs">
                  <span className="text-green-600">{stats?.evidence.approved || 0} approved</span>
                  <span className="text-yellow-600">{stats?.evidence.pending || 0} pending</span>
                </div>
              </CardContent>
            </Card>
          </Link>

          <Link href="/dashboard/team">
            <Card className="shadow-sm hover:shadow-md transition-shadow cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-center gap-3 mb-3">
                  <div className="h-10 w-10 rounded-lg bg-green-100 flex items-center justify-center">
                    <Users className="h-5 w-5 text-green-600" />
                  </div>
                  <span className="font-semibold text-foreground">Team</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold text-foreground">—</span>
                </div>
                <p className="text-xs text-muted-foreground mt-2">Manage team members</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </section>

      {/* Recent Activity */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Controls */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Recent Controls</h2>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {stats?.recentControls && stats.recentControls.length > 0 ? (
                <div className="divide-y">
                  {stats.recentControls.map((control) => (
                    <Link key={control.id} href={`/dashboard/controls/${control.id}`}>
                      <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                        <div className={cn("h-2 w-2 rounded-full", 
                          control.status === "IMPLEMENTED" ? "bg-green-500" :
                          control.status === "IN_PROGRESS" ? "bg-yellow-500" : "bg-gray-300"
                        )} />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            <span className="font-mono text-primary">{control.code}</span> {control.name}
                          </p>
                        </div>
                        <span className={cn("text-xs", controlStatusColors[control.status as keyof typeof controlStatusColors])}>
                          {control.status.replace("_", " ")}
                        </span>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <FileCheck className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No controls yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        {/* Recent Evidence */}
        <section>
          <h2 className="text-sm font-semibold text-foreground mb-4 uppercase tracking-wide">Recent Evidence</h2>
          <Card className="shadow-sm">
            <CardContent className="p-0">
              {stats?.recentEvidence && stats.recentEvidence.length > 0 ? (
                <div className="divide-y">
                  {stats.recentEvidence.map((evidence) => (
                    <Link key={evidence.id} href={`/dashboard/evidence/${evidence.id}`}>
                      <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                        {evidence.status === "APPROVED" ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : evidence.status === "PENDING" ? (
                          <Clock className="h-4 w-4 text-yellow-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-600" />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{evidence.title}</p>
                          <p className="text-xs text-muted-foreground truncate">
                            {evidence.control.code} · {evidence.uploadedBy.name}
                          </p>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center text-muted-foreground">
                  <FolderOpen className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No evidence yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  )
}

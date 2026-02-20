import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"
import { GitHubClient } from "@/lib/integrations/github"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    const integration = await prisma.integration.findUnique({
      where: {
        organizationId_type: {
          organizationId: user.organizationId,
          type: "GITHUB",
        },
      },
    })

    if (!integration || !integration.config) {
      return NextResponse.json({ error: "GitHub integration not configured" }, { status: 404 })
    }

    const config = integration.config as { accessToken?: string }
    if (!config.accessToken) {
      return NextResponse.json({ error: "GitHub access token not found" }, { status: 400 })
    }

    const { searchParams } = new URL(request.url)
    const repoParam = searchParams.get("repo")

    const client = new GitHubClient(config.accessToken)
    const repos = await client.getRepositories()

    let complianceChecks: Awaited<ReturnType<typeof client.getComplianceCheck>>[] = []

    if (repoParam) {
      const repo = repos.find(r => r.full_name === repoParam)
      if (repo) {
        const [owner, repoName] = repo.full_name.split("/")
        const check = await client.getComplianceCheck(owner, repoName, repo.default_branch)
        complianceChecks = [check]
      }
    } else {
      // Check top 10 most recently updated repos
      const topRepos = repos.slice(0, 10)
      complianceChecks = await Promise.all(
        topRepos.map(async (repo) => {
          const [owner, repoName] = repo.full_name.split("/")
          return client.getComplianceCheck(owner, repoName, repo.default_branch)
        })
      )
    }

    const averageScore = complianceChecks.length > 0
      ? Math.round(complianceChecks.reduce((sum, c) => sum + c.score, 0) / complianceChecks.length)
      : 0

    return NextResponse.json({
      checks: complianceChecks,
      summary: {
        totalRepos: complianceChecks.length,
        averageScore,
        compliantRepos: complianceChecks.filter(c => c.score >= 70).length,
        needsAttention: complianceChecks.filter(c => c.score < 70).length,
      },
    })
  } catch (error) {
    console.error("Error checking GitHub compliance:", error)
    return NextResponse.json(
      { error: "Failed to check GitHub compliance" },
      { status: 500 }
    )
  }
}

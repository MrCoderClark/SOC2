import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"
import { GitHubClient } from "@/lib/integrations/github"

export const dynamic = 'force-dynamic'

export async function GET() {
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

    const client = new GitHubClient(config.accessToken)
    const [githubUser, repos] = await Promise.all([
      client.getUser(),
      client.getRepositories(),
    ])

    return NextResponse.json({
      user: githubUser,
      repositories: repos,
      status: integration.status,
      lastSyncAt: integration.lastSyncAt,
    })
  } catch (error) {
    console.error("Error fetching GitHub data:", error)
    return NextResponse.json(
      { error: "Failed to fetch GitHub data" },
      { status: 500 }
    )
  }
}

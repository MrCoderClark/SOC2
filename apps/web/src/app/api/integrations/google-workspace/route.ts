import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"
import { GoogleWorkspaceClient, refreshGoogleToken } from "@/lib/integrations/google-workspace"

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
          type: "GOOGLE_WORKSPACE",
        },
      },
    })

    if (!integration || !integration.config) {
      return NextResponse.json({ error: "Google Workspace integration not configured" }, { status: 404 })
    }

    const config = integration.config as {
      accessToken?: string
      refreshToken?: string
      expiresAt?: number
      email?: string
      domain?: string
    }

    if (!config.accessToken) {
      return NextResponse.json({ error: "Google Workspace access token not found" }, { status: 400 })
    }

    // Check if token needs refresh
    let accessToken = config.accessToken
    if (config.expiresAt && config.expiresAt < Date.now() && config.refreshToken) {
      try {
        const newTokens = await refreshGoogleToken(config.refreshToken)
        accessToken = newTokens.access_token
        
        // Update stored token
        await prisma.integration.update({
          where: { id: integration.id },
          data: {
            config: {
              ...config,
              accessToken: newTokens.access_token,
              expiresAt: Date.now() + newTokens.expires_in * 1000,
            },
          },
        })
      } catch (error) {
        console.error("Failed to refresh Google token:", error)
      }
    }

    const client = new GoogleWorkspaceClient(accessToken)
    const users = config.domain ? await client.getUsers(config.domain) : []

    return NextResponse.json({
      email: config.email,
      domain: config.domain,
      users,
      status: integration.status,
      lastSyncAt: integration.lastSyncAt,
    })
  } catch (error) {
    console.error("Error fetching Google Workspace data:", error)
    return NextResponse.json(
      { error: "Failed to fetch Google Workspace data" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { prisma } from "@soc2/database"
import { exchangeGitHubCode, GitHubClient } from "@/lib/integrations/github"

export const dynamic = 'force-dynamic'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get("code")
    const state = searchParams.get("state")
    const error = searchParams.get("error")

    if (error) {
      return NextResponse.redirect(
        new URL(`/dashboard/integrations?error=${encodeURIComponent(error)}`, request.url)
      )
    }

    if (!code || !state) {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=missing_params", request.url)
      )
    }

    // Decode state to get organization ID
    let organizationId: string
    try {
      const decodedState = Buffer.from(state, "base64url").toString()
      const [, orgId] = decodedState.split(":")
      if (!orgId) throw new Error("Invalid state")
      organizationId = orgId
    } catch {
      return NextResponse.redirect(
        new URL("/dashboard/integrations?error=invalid_state", request.url)
      )
    }

    // Exchange code for access token
    const accessToken = await exchangeGitHubCode(code)

    // Get GitHub user info
    const client = new GitHubClient(accessToken)
    const githubUser = await client.getUser()

    // Upsert the integration
    await prisma.integration.upsert({
      where: {
        organizationId_type: {
          organizationId,
          type: "GITHUB",
        },
      },
      create: {
        type: "GITHUB",
        name: "GitHub",
        status: "ACTIVE",
        config: {
          accessToken,
          username: githubUser.login,
          userId: githubUser.id,
        },
        organizationId,
        lastSyncAt: new Date(),
      },
      update: {
        status: "ACTIVE",
        config: {
          accessToken,
          username: githubUser.login,
          userId: githubUser.id,
        },
        lastSyncAt: new Date(),
      },
    })

    return NextResponse.redirect(
      new URL("/dashboard/integrations?success=github_connected", request.url)
    )
  } catch (error) {
    console.error("GitHub OAuth callback error:", error)
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=oauth_failed", request.url)
    )
  }
}

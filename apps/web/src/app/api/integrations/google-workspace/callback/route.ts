import { NextResponse } from "next/server"
import { prisma } from "@soc2/database"
import { exchangeGoogleCode, GoogleWorkspaceClient } from "@/lib/integrations/google-workspace"

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

    const tokens = await exchangeGoogleCode(code)
    const client = new GoogleWorkspaceClient(tokens.access_token)
    const googleUser = await client.getCurrentUser()

    // Extract domain from email
    const domain = googleUser.email.split("@")[1]

    await prisma.integration.upsert({
      where: {
        organizationId_type: {
          organizationId,
          type: "GOOGLE_WORKSPACE",
        },
      },
      create: {
        type: "GOOGLE_WORKSPACE",
        name: "Google Workspace",
        status: "ACTIVE",
        config: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
          email: googleUser.email,
          domain,
        },
        organizationId,
        lastSyncAt: new Date(),
      },
      update: {
        status: "ACTIVE",
        config: {
          accessToken: tokens.access_token,
          refreshToken: tokens.refresh_token,
          expiresAt: Date.now() + tokens.expires_in * 1000,
          email: googleUser.email,
          domain,
        },
        lastSyncAt: new Date(),
      },
    })

    return NextResponse.redirect(
      new URL("/dashboard/integrations?success=google_workspace_connected", request.url)
    )
  } catch (error) {
    console.error("Google Workspace OAuth callback error:", error)
    return NextResponse.redirect(
      new URL("/dashboard/integrations?error=oauth_failed", request.url)
    )
  }
}

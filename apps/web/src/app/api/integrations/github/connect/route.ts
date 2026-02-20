import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"
import { getGitHubOAuthUrl } from "@/lib/integrations/github"
import { randomBytes } from "crypto"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    })

    if (!user?.organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    if (user.role !== "OWNER" && user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const state = randomBytes(16).toString("hex")
    
    // Store state in a temporary way (in production, use Redis or similar)
    // For now, we'll encode the org ID in the state
    const stateWithOrg = `${state}:${user.organizationId}`
    const encodedState = Buffer.from(stateWithOrg).toString("base64url")

    const authUrl = getGitHubOAuthUrl(encodedState)

    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error("Error initiating GitHub connection:", error)
    return NextResponse.json(
      { error: "Failed to initiate GitHub connection" },
      { status: 500 }
    )
  }
}

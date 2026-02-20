import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"
import { getGoogleOAuthUrl } from "@/lib/integrations/google-workspace"
import { randomBytes } from "crypto"

export const dynamic = 'force-dynamic'

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
    const stateWithOrg = `${state}:${user.organizationId}`
    const encodedState = Buffer.from(stateWithOrg).toString("base64url")

    const authUrl = getGoogleOAuthUrl(encodedState)

    return NextResponse.json({ url: authUrl })
  } catch (error) {
    console.error("Error initiating Google Workspace connection:", error)
    return NextResponse.json(
      { error: "Failed to initiate Google Workspace connection" },
      { status: 500 }
    )
  }
}

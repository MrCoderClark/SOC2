import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

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

    const integrations = await prisma.integration.findMany({
      where: { organizationId: user.organizationId },
      orderBy: { createdAt: "desc" },
    })

    return NextResponse.json(integrations)
  } catch (error) {
    console.error("Error fetching integrations:", error)
    return NextResponse.json(
      { error: "Failed to fetch integrations" },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
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

    const body = await request.json()
    const { type, name, config } = body

    if (!type || !name) {
      return NextResponse.json(
        { error: "Type and name are required" },
        { status: 400 }
      )
    }

    const existingIntegration = await prisma.integration.findUnique({
      where: {
        organizationId_type: {
          organizationId: user.organizationId,
          type,
        },
      },
    })

    if (existingIntegration) {
      return NextResponse.json(
        { error: "Integration of this type already exists" },
        { status: 409 }
      )
    }

    const integration = await prisma.integration.create({
      data: {
        type,
        name,
        config: config || {},
        status: "INACTIVE",
        organizationId: user.organizationId,
      },
    })

    return NextResponse.json(integration, { status: 201 })
  } catch (error) {
    console.error("Error creating integration:", error)
    return NextResponse.json(
      { error: "Failed to create integration" },
      { status: 500 }
    )
  }
}

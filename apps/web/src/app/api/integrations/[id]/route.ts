import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const integration = await prisma.integration.findFirst({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    })

    if (!integration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 })
    }

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Error fetching integration:", error)
    return NextResponse.json(
      { error: "Failed to fetch integration" },
      { status: 500 }
    )
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const existingIntegration = await prisma.integration.findFirst({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    })

    if (!existingIntegration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, config, status } = body

    const integration = await prisma.integration.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(config && { config }),
        ...(status && { status }),
        ...(status === "ACTIVE" && { lastSyncAt: new Date() }),
      },
    })

    return NextResponse.json(integration)
  } catch (error) {
    console.error("Error updating integration:", error)
    return NextResponse.json(
      { error: "Failed to update integration" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const existingIntegration = await prisma.integration.findFirst({
      where: {
        id: params.id,
        organizationId: user.organizationId,
      },
    })

    if (!existingIntegration) {
      return NextResponse.json({ error: "Integration not found" }, { status: 404 })
    }

    await prisma.integration.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting integration:", error)
    return NextResponse.json(
      { error: "Failed to delete integration" },
      { status: 500 }
    )
  }
}

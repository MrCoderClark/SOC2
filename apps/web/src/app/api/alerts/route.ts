import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// Get all alerts for the organization
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

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const severity = searchParams.get("severity")

    const alerts = await prisma.alert.findMany({
      where: {
        organizationId: user.organizationId,
        ...(status && { status: status as any }),
        ...(severity && { severity: severity as any }),
      },
      include: {
        control: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        evidence: {
          select: {
            id: true,
            title: true,
          },
        },
        policy: {
          select: {
            id: true,
            title: true,
          },
        },
        acknowledger: {
          select: {
            id: true,
            name: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: [
        { status: "asc" },
        { severity: "desc" },
        { createdAt: "desc" },
      ],
    })

    return NextResponse.json(alerts)
  } catch (error) {
    console.error("Error fetching alerts:", error)
    return NextResponse.json(
      { error: "Failed to fetch alerts" },
      { status: 500 }
    )
  }
}

// Get alert counts for the header badge
export async function HEAD(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return new NextResponse(null, { status: 401 })
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true },
    })

    if (!user?.organizationId) {
      return new NextResponse(null, { status: 404 })
    }

    const openCount = await prisma.alert.count({
      where: {
        organizationId: user.organizationId,
        status: "OPEN",
      },
    })

    return new NextResponse(null, {
      headers: {
        "X-Open-Alerts": openCount.toString(),
      },
    })
  } catch (error) {
    return new NextResponse(null, { status: 500 })
  }
}

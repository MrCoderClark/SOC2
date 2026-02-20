import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// Get single alert
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const alert = await prisma.alert.findUnique({
      where: { id: params.id },
      include: {
        control: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
          },
        },
        evidence: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        policy: {
          select: {
            id: true,
            title: true,
            status: true,
          },
        },
        acknowledger: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        resolver: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!alert) {
      return NextResponse.json({ error: "Alert not found" }, { status: 404 })
    }

    return NextResponse.json(alert)
  } catch (error) {
    console.error("Error fetching alert:", error)
    return NextResponse.json(
      { error: "Failed to fetch alert" },
      { status: 500 }
    )
  }
}

// Update alert (acknowledge, resolve, dismiss)
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    let updateData: any = {}

    switch (action) {
      case "acknowledge":
        updateData = {
          status: "ACKNOWLEDGED",
          acknowledgedBy: session.user.id,
          acknowledgedAt: new Date(),
        }
        break
      case "resolve":
        updateData = {
          status: "RESOLVED",
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        }
        break
      case "dismiss":
        updateData = {
          status: "DISMISSED",
          resolvedBy: session.user.id,
          resolvedAt: new Date(),
        }
        break
      case "reopen":
        updateData = {
          status: "OPEN",
          acknowledgedBy: null,
          acknowledgedAt: null,
          resolvedBy: null,
          resolvedAt: null,
        }
        break
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 })
    }

    const alert = await prisma.alert.update({
      where: { id: params.id },
      data: updateData,
      include: {
        control: {
          select: {
            id: true,
            code: true,
            name: true,
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
    })

    return NextResponse.json(alert)
  } catch (error) {
    console.error("Error updating alert:", error)
    return NextResponse.json(
      { error: "Failed to update alert" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

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
    const category = searchParams.get("category")
    const status = searchParams.get("status")
    const assignee = searchParams.get("assignee")

    // Build assignee filter
    let assigneeFilter = {}
    if (assignee === "mine") {
      assigneeFilter = { assigneeId: session.user.id }
    } else if (assignee === "unassigned") {
      assigneeFilter = { assigneeId: null }
    }

    const controls = await prisma.control.findMany({
      where: {
        organizationId: user.organizationId,
        ...(category && { category: category as any }),
        ...(status && { status: status as any }),
        ...assigneeFilter,
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        _count: {
          select: {
            evidence: true,
            policies: true,
          },
        },
      },
      orderBy: {
        code: "asc",
      },
    })

    return NextResponse.json(controls)
  } catch (error) {
    console.error("Error fetching controls:", error)
    return NextResponse.json(
      { error: "Failed to fetch controls" },
      { status: 500 }
    )
  }
}

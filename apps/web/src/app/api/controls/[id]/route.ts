import { NextResponse } from "next/server"
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

    const control = await prisma.control.findUnique({
      where: { id: params.id },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        evidence: {
          include: {
            uploadedBy: {
              select: {
                id: true,
                name: true,
              },
            },
          },
          orderBy: {
            createdAt: "desc",
          },
        },
        policies: true,
      },
    })

    if (!control) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    return NextResponse.json(control)
  } catch (error) {
    console.error("Error fetching control:", error)
    return NextResponse.json(
      { error: "Failed to fetch control" },
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

    const body = await request.json()
    const { status, assigneeId } = body

    const control = await prisma.control.update({
      where: { id: params.id },
      data: {
        ...(status && { status }),
        ...(assigneeId !== undefined && { assigneeId }),
      },
      include: {
        assignee: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    return NextResponse.json(control)
  } catch (error) {
    console.error("Error updating control:", error)
    return NextResponse.json(
      { error: "Failed to update control" },
      { status: 500 }
    )
  }
}

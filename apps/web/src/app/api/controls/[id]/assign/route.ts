import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// Assign control to current user
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const control = await prisma.control.update({
      where: { id: params.id },
      data: {
        assigneeId: session.user.id,
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
    console.error("Error assigning control:", error)
    return NextResponse.json(
      { error: "Failed to assign control" },
      { status: 500 }
    )
  }
}

// Unassign control
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const control = await prisma.control.update({
      where: { id: params.id },
      data: {
        assigneeId: null,
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
    console.error("Error unassigning control:", error)
    return NextResponse.json(
      { error: "Failed to unassign control" },
      { status: 500 }
    )
  }
}

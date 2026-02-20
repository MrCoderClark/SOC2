import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const policy = await prisma.policy.findUnique({
      where: { id: params.id },
      include: {
        controls: {
          select: {
            id: true,
            code: true,
            name: true,
            status: true,
          },
        },
      },
    })

    if (!policy) {
      return NextResponse.json({ error: "Policy not found" }, { status: 404 })
    }

    return NextResponse.json(policy)
  } catch (error) {
    console.error("Error fetching policy:", error)
    return NextResponse.json(
      { error: "Failed to fetch policy" },
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
    const { title, content, status, controlIds } = body

    const policy = await prisma.policy.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(content !== undefined && { content }),
        ...(status && { status }),
        ...(controlIds && {
          controls: {
            set: controlIds.map((id: string) => ({ id })),
          },
        }),
      },
      include: {
        controls: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(policy)
  } catch (error) {
    console.error("Error updating policy:", error)
    return NextResponse.json(
      { error: "Failed to update policy" },
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

    await prisma.policy.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting policy:", error)
    return NextResponse.json(
      { error: "Failed to delete policy" },
      { status: 500 }
    )
  }
}

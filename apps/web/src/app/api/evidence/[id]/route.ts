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

    const evidence = await prisma.evidence.findUnique({
      where: { id: params.id },
      include: {
        control: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
    })

    if (!evidence) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 })
    }

    return NextResponse.json(evidence)
  } catch (error) {
    console.error("Error fetching evidence:", error)
    return NextResponse.json(
      { error: "Failed to fetch evidence" },
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
    const { title, description, status, fileUrl, fileType } = body

    const evidence = await prisma.evidence.update({
      where: { id: params.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(status && { status }),
        ...(fileUrl && { fileUrl }),
        ...(fileType && { fileType }),
      },
      include: {
        control: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(evidence)
  } catch (error) {
    console.error("Error updating evidence:", error)
    return NextResponse.json(
      { error: "Failed to update evidence" },
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

    await prisma.evidence.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting evidence:", error)
    return NextResponse.json(
      { error: "Failed to delete evidence" },
      { status: 500 }
    )
  }
}

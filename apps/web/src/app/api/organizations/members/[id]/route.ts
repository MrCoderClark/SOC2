import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    })

    if (!currentUser?.organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    if (currentUser.role !== "ADMIN" && currentUser.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { organizationId: true },
    })

    if (!targetUser || targetUser.organizationId !== currentUser.organizationId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    const body = await request.json()
    const { role } = body

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: { role },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Error updating member:", error)
    return NextResponse.json(
      { error: "Failed to update member" },
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

    const currentUser = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { organizationId: true, role: true },
    })

    if (!currentUser?.organizationId) {
      return NextResponse.json({ error: "Organization not found" }, { status: 404 })
    }

    if (currentUser.role !== "ADMIN" && currentUser.role !== "OWNER") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    if (params.id === session.user.id) {
      return NextResponse.json(
        { error: "Cannot remove yourself" },
        { status: 400 }
      )
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: params.id },
      select: { organizationId: true },
    })

    if (!targetUser || targetUser.organizationId !== currentUser.organizationId) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    await prisma.user.update({
      where: { id: params.id },
      data: { organizationId: null },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error removing member:", error)
    return NextResponse.json(
      { error: "Failed to remove member" },
      { status: 500 }
    )
  }
}

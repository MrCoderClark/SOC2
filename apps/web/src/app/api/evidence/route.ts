import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const controlId = searchParams.get("controlId")
    const status = searchParams.get("status")

    const evidence = await prisma.evidence.findMany({
      where: {
        ...(controlId && { controlId }),
        ...(status && { status: status as any }),
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
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    return NextResponse.json(evidence)
  } catch (error) {
    console.error("Error fetching evidence:", error)
    return NextResponse.json(
      { error: "Failed to fetch evidence" },
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

    const body = await request.json()
    const { title, description, controlId, fileUrl, fileType } = body

    if (!title || !controlId) {
      return NextResponse.json(
        { error: "Title and controlId are required" },
        { status: 400 }
      )
    }

    const control = await prisma.control.findUnique({
      where: { id: controlId },
      select: { organizationId: true },
    })

    if (!control) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    const evidence = await prisma.evidence.create({
      data: {
        title,
        description,
        fileUrl,
        fileType,
        control: { connect: { id: controlId } },
        organization: { connect: { id: control.organizationId } },
        uploadedBy: { connect: { id: session.user.id } },
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

    return NextResponse.json(evidence, { status: 201 })
  } catch (error) {
    console.error("Error creating evidence:", error)
    return NextResponse.json(
      { error: "Failed to create evidence" },
      { status: 500 }
    )
  }
}

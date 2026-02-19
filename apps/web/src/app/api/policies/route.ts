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
    const status = searchParams.get("status")

    const policies = await prisma.policy.findMany({
      where: {
        ...(status && { status: status as any }),
      },
      include: {
        controls: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        _count: {
          select: {
            controls: true,
          },
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    })

    return NextResponse.json(policies)
  } catch (error) {
    console.error("Error fetching policies:", error)
    return NextResponse.json(
      { error: "Failed to fetch policies" },
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
    const { title, content, controlIds } = body

    if (!title) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 })
    }

    const policy = await prisma.policy.create({
      data: {
        title,
        content: content || "",
        organization: {
          connectOrCreate: {
            where: { slug: "default" },
            create: {
              name: "Default Organization",
              slug: "default",
            },
          },
        },
        ...(controlIds?.length && {
          controls: {
            connect: controlIds.map((id: string) => ({ id })),
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

    return NextResponse.json(policy, { status: 201 })
  } catch (error) {
    console.error("Error creating policy:", error)
    return NextResponse.json(
      { error: "Failed to create policy" },
      { status: 500 }
    )
  }
}

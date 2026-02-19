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
    const category = searchParams.get("category")
    const status = searchParams.get("status")

    const controls = await prisma.control.findMany({
      where: {
        ...(category && { category: category as any }),
        ...(status && { status: status as any }),
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

import { NextResponse } from "next/server"

export const dynamic = 'force-dynamic'
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

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

    const orgId = user.organizationId

    const [
      controlStats,
      policyStats,
      evidenceStats,
      recentControls,
      recentEvidence,
    ] = await Promise.all([
      prisma.control.groupBy({
        by: ["status"],
        where: { organizationId: orgId },
        _count: true,
      }),
      prisma.policy.groupBy({
        by: ["status"],
        where: { organizationId: orgId },
        _count: true,
      }),
      prisma.evidence.groupBy({
        by: ["status"],
        where: { organizationId: orgId },
        _count: true,
      }),
      prisma.control.findMany({
        where: { organizationId: orgId },
        orderBy: { updatedAt: "desc" },
        take: 5,
        select: {
          id: true,
          code: true,
          name: true,
          status: true,
          updatedAt: true,
        },
      }),
      prisma.evidence.findMany({
        where: { organizationId: orgId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: {
          control: {
            select: { code: true, name: true },
          },
          uploadedBy: {
            select: { name: true },
          },
        },
      }),
    ])

    const totalControls = controlStats.reduce((sum, s) => sum + s._count, 0)
    const totalPolicies = policyStats.reduce((sum, s) => sum + s._count, 0)
    const totalEvidence = evidenceStats.reduce((sum, s) => sum + s._count, 0)

    const implementedControls = controlStats.find(s => s.status === "IMPLEMENTED")?._count || 0
    const approvedPolicies = policyStats.find(s => s.status === "APPROVED")?._count || 0
    const approvedEvidence = evidenceStats.find(s => s.status === "APPROVED")?._count || 0

    const complianceScore = totalControls > 0 
      ? Math.round((implementedControls / totalControls) * 100) 
      : 0

    return NextResponse.json({
      complianceScore,
      controls: {
        total: totalControls,
        implemented: implementedControls,
        inProgress: controlStats.find(s => s.status === "IN_PROGRESS")?._count || 0,
        notStarted: controlStats.find(s => s.status === "NOT_STARTED")?._count || 0,
        notApplicable: controlStats.find(s => s.status === "NOT_APPLICABLE")?._count || 0,
      },
      policies: {
        total: totalPolicies,
        approved: approvedPolicies,
        draft: policyStats.find(s => s.status === "DRAFT")?._count || 0,
        review: policyStats.find(s => s.status === "REVIEW")?._count || 0,
      },
      evidence: {
        total: totalEvidence,
        approved: approvedEvidence,
        pending: evidenceStats.find(s => s.status === "PENDING")?._count || 0,
        rejected: evidenceStats.find(s => s.status === "REJECTED")?._count || 0,
      },
      recentControls,
      recentEvidence,
    })
  } catch (error) {
    console.error("Error fetching dashboard stats:", error)
    return NextResponse.json(
      { error: "Failed to fetch dashboard stats" },
      { status: 500 }
    )
  }
}

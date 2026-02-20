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

    type GroupByResult = { status: string; _count: { _all: number } | number }
    
    const getCount = (item: GroupByResult) => {
      if (typeof item._count === 'number') return item._count
      return item._count._all || 0
    }
    
    const totalControls = controlStats.reduce((sum: number, s: GroupByResult) => sum + getCount(s), 0)
    const totalPolicies = policyStats.reduce((sum: number, s: GroupByResult) => sum + getCount(s), 0)
    const totalEvidence = evidenceStats.reduce((sum: number, s: GroupByResult) => sum + getCount(s), 0)

    const implementedControls = controlStats.find((s: GroupByResult) => s.status === "IMPLEMENTED")
    const approvedPolicies = policyStats.find((s: GroupByResult) => s.status === "APPROVED")
    const approvedEvidence = evidenceStats.find((s: GroupByResult) => s.status === "APPROVED")
    
    const implementedCount = implementedControls ? getCount(implementedControls) : 0
    const approvedPoliciesCount = approvedPolicies ? getCount(approvedPolicies) : 0
    const approvedEvidenceCount = approvedEvidence ? getCount(approvedEvidence) : 0

    const complianceScore = totalControls > 0 
      ? Math.round((implementedCount / totalControls) * 100) 
      : 0

    const findCount = (arr: GroupByResult[], status: string) => {
      const item = arr.find((s: GroupByResult) => s.status === status)
      return item ? getCount(item) : 0
    }

    return NextResponse.json({
      complianceScore,
      controls: {
        total: totalControls,
        implemented: implementedCount,
        inProgress: findCount(controlStats, "IN_PROGRESS"),
        notStarted: findCount(controlStats, "NOT_STARTED"),
        notApplicable: findCount(controlStats, "NOT_APPLICABLE"),
      },
      policies: {
        total: totalPolicies,
        approved: approvedPoliciesCount,
        draft: findCount(policyStats, "DRAFT"),
        review: findCount(policyStats, "REVIEW"),
      },
      evidence: {
        total: totalEvidence,
        approved: approvedEvidenceCount,
        pending: findCount(evidenceStats, "PENDING"),
        rejected: findCount(evidenceStats, "REJECTED"),
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

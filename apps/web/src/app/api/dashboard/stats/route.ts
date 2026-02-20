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

    const findCount = (arr: GroupByResult[], status: string) => {
      const item = arr.find((s: GroupByResult) => s.status === status)
      return item ? getCount(item) : 0
    }

    const implementedCount = findCount(controlStats, "IMPLEMENTED")
    const verifiedCount = findCount(controlStats, "VERIFIED")
    const compliantControls = implementedCount + verifiedCount
    const approvedPoliciesCount = findCount(policyStats, "APPROVED") + findCount(policyStats, "PUBLISHED")
    const approvedEvidenceCount = findCount(evidenceStats, "APPROVED")

    // Exclude N/A controls from compliance calculation
    const notApplicableCount = findCount(controlStats, "NOT_APPLICABLE")
    const applicableControls = totalControls - notApplicableCount
    
    const complianceScore = applicableControls > 0 
      ? Math.round((compliantControls / applicableControls) * 100) 
      : 0

    return NextResponse.json({
      complianceScore,
      controls: {
        total: totalControls,
        implemented: implementedCount,
        verified: verifiedCount,
        compliant: compliantControls,
        inProgress: findCount(controlStats, "IN_PROGRESS"),
        notStarted: findCount(controlStats, "NOT_STARTED"),
        notApplicable: notApplicableCount,
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

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"

export const dynamic = 'force-dynamic'

// Scan for compliance issues and create alerts
export async function POST(request: Request) {
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

    const organizationId = user.organizationId
    const alertsCreated: any[] = []

    // Get all controls with their evidence and policies
    const controls = await prisma.control.findMany({
      where: { organizationId },
      include: {
        evidence: true,
        policies: true,
      },
    })

    // Check each control for issues
    for (const control of controls) {
      // Skip N/A controls
      if (control.status === "NOT_APPLICABLE") continue

      // Rule 1: Control not started (HIGH severity if no progress)
      if (control.status === "NOT_STARTED") {
        const existingAlert = await prisma.alert.findFirst({
          where: {
            organizationId,
            controlId: control.id,
            type: "CONTROL_NOT_STARTED",
            status: { in: ["OPEN", "ACKNOWLEDGED"] },
          },
        })

        if (!existingAlert) {
          const alert = await prisma.alert.create({
            data: {
              type: "CONTROL_NOT_STARTED",
              severity: "MEDIUM",
              title: `Control ${control.code} not started`,
              description: `"${control.name}" has not been started. Begin implementation to improve compliance.`,
              controlId: control.id,
              organizationId,
            },
          })
          alertsCreated.push(alert)
        }
      }

      // Rule 2: Control has no evidence (HIGH severity for implemented controls)
      if (control.evidence.length === 0 && control.status !== "NOT_STARTED") {
        const existingAlert = await prisma.alert.findFirst({
          where: {
            organizationId,
            controlId: control.id,
            type: "EVIDENCE_MISSING",
            status: { in: ["OPEN", "ACKNOWLEDGED"] },
          },
        })

        if (!existingAlert) {
          const severity = control.status === "IMPLEMENTED" || control.status === "VERIFIED" ? "HIGH" : "MEDIUM"
          const alert = await prisma.alert.create({
            data: {
              type: "EVIDENCE_MISSING",
              severity,
              title: `No evidence for ${control.code}`,
              description: `"${control.name}" has no supporting evidence. Upload evidence to demonstrate compliance.`,
              controlId: control.id,
              organizationId,
            },
          })
          alertsCreated.push(alert)
        }
      }

      // Rule 3: Control has no linked policies (MEDIUM severity)
      if (control.policies.length === 0 && control.status !== "NOT_STARTED") {
        const existingAlert = await prisma.alert.findFirst({
          where: {
            organizationId,
            controlId: control.id,
            type: "POLICY_MISSING",
            status: { in: ["OPEN", "ACKNOWLEDGED"] },
          },
        })

        if (!existingAlert) {
          const alert = await prisma.alert.create({
            data: {
              type: "POLICY_MISSING",
              severity: "LOW",
              title: `No policy linked to ${control.code}`,
              description: `"${control.name}" has no linked policy. Link a policy to document procedures.`,
              controlId: control.id,
              organizationId,
            },
          })
          alertsCreated.push(alert)
        }
      }

      // Rule 4: Control stale (not updated in 90 days)
      const ninetyDaysAgo = new Date()
      ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90)
      
      if (control.updatedAt < ninetyDaysAgo && control.status !== "NOT_STARTED") {
        const existingAlert = await prisma.alert.findFirst({
          where: {
            organizationId,
            controlId: control.id,
            type: "CONTROL_STALE",
            status: { in: ["OPEN", "ACKNOWLEDGED"] },
          },
        })

        if (!existingAlert) {
          const alert = await prisma.alert.create({
            data: {
              type: "CONTROL_STALE",
              severity: "MEDIUM",
              title: `Control ${control.code} needs review`,
              description: `"${control.name}" hasn't been updated in over 90 days. Review and update status.`,
              controlId: control.id,
              organizationId,
            },
          })
          alertsCreated.push(alert)
        }
      }
    }

    // Check for rejected evidence
    const rejectedEvidence = await prisma.evidence.findMany({
      where: {
        organizationId,
        status: "REJECTED",
      },
      include: {
        control: true,
      },
    })

    for (const evidence of rejectedEvidence) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          organizationId,
          evidenceId: evidence.id,
          type: "EVIDENCE_REJECTED",
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
        },
      })

      if (!existingAlert) {
        const alert = await prisma.alert.create({
          data: {
            type: "EVIDENCE_REJECTED",
            severity: "HIGH",
            title: `Evidence rejected: ${evidence.title}`,
            description: `Evidence for "${evidence.control.name}" was rejected. Upload new evidence.`,
            evidenceId: evidence.id,
            controlId: evidence.controlId,
            organizationId,
          },
        })
        alertsCreated.push(alert)
      }
    }

    // Check for expired evidence
    const expiredEvidence = await prisma.evidence.findMany({
      where: {
        organizationId,
        status: "EXPIRED",
      },
      include: {
        control: true,
      },
    })

    for (const evidence of expiredEvidence) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          organizationId,
          evidenceId: evidence.id,
          type: "EVIDENCE_EXPIRED",
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
        },
      })

      if (!existingAlert) {
        const alert = await prisma.alert.create({
          data: {
            type: "EVIDENCE_EXPIRED",
            severity: "HIGH",
            title: `Evidence expired: ${evidence.title}`,
            description: `Evidence for "${evidence.control.name}" has expired. Upload fresh evidence.`,
            evidenceId: evidence.id,
            controlId: evidence.controlId,
            organizationId,
          },
        })
        alertsCreated.push(alert)
      }
    }

    // Check for draft policies linked to implemented controls
    const draftPolicies = await prisma.policy.findMany({
      where: {
        organizationId,
        status: "DRAFT",
        controls: {
          some: {
            status: { in: ["IMPLEMENTED", "VERIFIED"] },
          },
        },
      },
      include: {
        controls: {
          where: {
            status: { in: ["IMPLEMENTED", "VERIFIED"] },
          },
        },
      },
    })

    for (const policy of draftPolicies) {
      const existingAlert = await prisma.alert.findFirst({
        where: {
          organizationId,
          policyId: policy.id,
          type: "POLICY_DRAFT",
          status: { in: ["OPEN", "ACKNOWLEDGED"] },
        },
      })

      if (!existingAlert) {
        const alert = await prisma.alert.create({
          data: {
            type: "POLICY_DRAFT",
            severity: "MEDIUM",
            title: `Policy still in draft: ${policy.title}`,
            description: `This policy is linked to ${policy.controls.length} implemented control(s) but is still in draft status.`,
            policyId: policy.id,
            organizationId,
          },
        })
        alertsCreated.push(alert)
      }
    }

    // Auto-resolve alerts for issues that have been fixed
    const openAlerts = await prisma.alert.findMany({
      where: {
        organizationId,
        status: { in: ["OPEN", "ACKNOWLEDGED"] },
      },
      include: {
        control: {
          include: {
            evidence: true,
            policies: true,
          },
        },
        evidence: true,
        policy: true,
      },
    })

    let alertsResolved = 0
    for (const alert of openAlerts) {
      let shouldResolve = false

      switch (alert.type) {
        case "CONTROL_NOT_STARTED":
          if (alert.control && alert.control.status !== "NOT_STARTED") {
            shouldResolve = true
          }
          break
        case "EVIDENCE_MISSING":
          if (alert.control && alert.control.evidence.length > 0) {
            shouldResolve = true
          }
          break
        case "POLICY_MISSING":
          if (alert.control && alert.control.policies.length > 0) {
            shouldResolve = true
          }
          break
        case "EVIDENCE_REJECTED":
        case "EVIDENCE_EXPIRED":
          if (alert.evidence && alert.evidence.status === "APPROVED") {
            shouldResolve = true
          }
          break
        case "POLICY_DRAFT":
          if (alert.policy && alert.policy.status !== "DRAFT") {
            shouldResolve = true
          }
          break
      }

      if (shouldResolve) {
        await prisma.alert.update({
          where: { id: alert.id },
          data: {
            status: "RESOLVED",
            resolvedAt: new Date(),
          },
        })
        alertsResolved++
      }
    }

    return NextResponse.json({
      message: "Compliance scan complete",
      alertsCreated: alertsCreated.length,
      alertsResolved,
      newAlerts: alertsCreated,
    })
  } catch (error) {
    console.error("Error scanning for compliance issues:", error)
    return NextResponse.json(
      { error: "Failed to scan for compliance issues" },
      { status: 500 }
    )
  }
}

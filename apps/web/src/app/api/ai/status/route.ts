import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { isAIConfigured } from "@/lib/ai"

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const configured = isAIConfigured()

    return NextResponse.json({
      configured,
      provider: configured ? "openai" : null,
      features: configured ? [
        "policy_generation",
        "evidence_analysis",
        "gap_analysis",
        "implementation_guide",
      ] : [],
    })
  } catch (error) {
    console.error("Error checking AI status:", error)
    return NextResponse.json(
      { error: "Failed to check AI status" },
      { status: 500 }
    )
  }
}

import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"
import { AIService, isAIConfigured } from "@/lib/ai"
import { PROMPTS } from "@/lib/ai/prompts"
import { trackUsage, checkQuota, hashPrompt, getCachedResponse, cacheResponse } from "@/lib/ai/usage"

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    // Check if AI is configured
    if (!isAIConfigured()) {
      return NextResponse.json(
        { error: "AI is not configured. Please set OPENAI_API_KEY." },
        { status: 503 }
      )
    }

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

    // Check quota
    const quota = await checkQuota(user.organizationId)
    if (!quota.allowed) {
      return NextResponse.json(
        { error: "Monthly AI usage limit reached", usage: quota },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { controlId } = body

    if (!controlId) {
      return NextResponse.json({ error: "controlId is required" }, { status: 400 })
    }

    // Get control details
    const control = await prisma.control.findUnique({
      where: { id: controlId },
    })

    if (!control) {
      return NextResponse.json({ error: "Control not found" }, { status: 404 })
    }

    // Build messages
    const prompt = PROMPTS.GENERATE_POLICY
    const messages = [
      { role: "system" as const, content: prompt.system },
      { role: "user" as const, content: prompt.user(control.name, control.description) },
    ]

    // Check cache
    const ai = new AIService({ model: "gpt-4o-mini" })
    const promptHash = hashPrompt(messages, "gpt-4o-mini")
    const cached = await getCachedResponse(promptHash)

    if (cached) {
      // Track cached usage (no tokens consumed)
      await trackUsage({
        organizationId: user.organizationId,
        userId: session.user.id,
        feature: "policy_generation",
        model: "gpt-4o-mini",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cached: true,
      })

      return NextResponse.json({
        content: cached,
        cached: true,
        control: {
          id: control.id,
          code: control.code,
          name: control.name,
        },
      })
    }

    // Generate policy
    const response = await ai.chat(messages)

    // Cache response
    await cacheResponse(promptHash, response.content, response.model)

    // Track usage
    await trackUsage({
      organizationId: user.organizationId,
      userId: session.user.id,
      feature: "policy_generation",
      model: response.model,
      promptTokens: response.usage.promptTokens,
      completionTokens: response.usage.completionTokens,
      totalTokens: response.usage.totalTokens,
      cached: false,
    })

    return NextResponse.json({
      content: response.content,
      cached: false,
      usage: response.usage,
      control: {
        id: control.id,
        code: control.code,
        name: control.name,
      },
    })
  } catch (error: any) {
    console.error("Error generating policy:", error)
    return NextResponse.json(
      { error: error.message || "Failed to generate policy" },
      { status: error.status || 500 }
    )
  }
}

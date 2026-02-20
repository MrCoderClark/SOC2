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

    const quota = await checkQuota(user.organizationId)
    if (!quota.allowed) {
      return NextResponse.json(
        { error: "Monthly AI usage limit reached", usage: quota },
        { status: 429 }
      )
    }

    const body = await request.json()
    const { evidenceId } = body

    if (!evidenceId) {
      return NextResponse.json({ error: "evidenceId is required" }, { status: 400 })
    }

    const evidence = await prisma.evidence.findUnique({
      where: { id: evidenceId },
      include: {
        control: true,
      },
    })

    if (!evidence) {
      return NextResponse.json({ error: "Evidence not found" }, { status: 404 })
    }

    const prompt = PROMPTS.ANALYZE_EVIDENCE
    const messages = [
      { role: "system" as const, content: prompt.system },
      { role: "user" as const, content: prompt.user(
        evidence.control.name,
        evidence.control.description,
        evidence.title,
        evidence.description || "No description provided"
      )},
    ]

    const ai = new AIService({ model: "gpt-4o-mini" })
    const promptHash = hashPrompt(messages, "gpt-4o-mini")
    const cached = await getCachedResponse(promptHash)

    if (cached) {
      await trackUsage({
        organizationId: user.organizationId,
        userId: session.user.id,
        feature: "evidence_analysis",
        model: "gpt-4o-mini",
        promptTokens: 0,
        completionTokens: 0,
        totalTokens: 0,
        cached: true,
      })

      return NextResponse.json({
        content: cached,
        cached: true,
        evidence: {
          id: evidence.id,
          title: evidence.title,
        },
        control: {
          id: evidence.control.id,
          code: evidence.control.code,
          name: evidence.control.name,
        },
      })
    }

    const response = await ai.chat(messages)

    await cacheResponse(promptHash, response.content, response.model)

    await trackUsage({
      organizationId: user.organizationId,
      userId: session.user.id,
      feature: "evidence_analysis",
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
      evidence: {
        id: evidence.id,
        title: evidence.title,
      },
      control: {
        id: evidence.control.id,
        code: evidence.control.code,
        name: evidence.control.name,
      },
    })
  } catch (error: any) {
    console.error("Error analyzing evidence:", error)
    return NextResponse.json(
      { error: error.message || "Failed to analyze evidence" },
      { status: error.status || 500 }
    )
  }
}

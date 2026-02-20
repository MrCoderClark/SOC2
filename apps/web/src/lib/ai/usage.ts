import { prisma } from "@soc2/database"
import crypto from "crypto"

// Token costs per 1K tokens (approximate, as of 2024)
const TOKEN_COSTS: Record<string, { input: number; output: number }> = {
  "gpt-4o": { input: 0.005, output: 0.015 },
  "gpt-4o-mini": { input: 0.00015, output: 0.0006 },
  "gpt-4-turbo": { input: 0.01, output: 0.03 },
  "gpt-4": { input: 0.03, output: 0.06 },
  "gpt-3.5-turbo": { input: 0.0005, output: 0.0015 },
}

// Monthly token limits per organization (can be configured)
const DEFAULT_MONTHLY_LIMIT = 1000000 // 1M tokens

export interface UsageRecord {
  organizationId: string
  userId: string
  feature: string
  model: string
  promptTokens: number
  completionTokens: number
  totalTokens: number
  cached?: boolean
}

// Track AI usage
export async function trackUsage(record: UsageRecord): Promise<void> {
  const cost = calculateCost(
    record.model,
    record.promptTokens,
    record.completionTokens
  )

  await prisma.aIUsage.create({
    data: {
      organizationId: record.organizationId,
      userId: record.userId,
      feature: record.feature,
      model: record.model,
      promptTokens: record.promptTokens,
      completionTokens: record.completionTokens,
      totalTokens: record.totalTokens,
      cost,
      cached: record.cached || false,
    },
  })
}

// Calculate cost based on model and tokens
export function calculateCost(
  model: string,
  promptTokens: number,
  completionTokens: number
): number {
  const costs = TOKEN_COSTS[model] || TOKEN_COSTS["gpt-4o-mini"]
  const inputCost = (promptTokens / 1000) * costs.input
  const outputCost = (completionTokens / 1000) * costs.output
  return Math.round((inputCost + outputCost) * 10000) / 10000 // Round to 4 decimals
}

// Get usage stats for an organization
export async function getOrganizationUsage(
  organizationId: string,
  startDate?: Date,
  endDate?: Date
) {
  const now = new Date()
  const start = startDate || new Date(now.getFullYear(), now.getMonth(), 1)
  const end = endDate || now

  const usage = await prisma.aIUsage.aggregate({
    where: {
      organizationId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      promptTokens: true,
      completionTokens: true,
      totalTokens: true,
      cost: true,
    },
    _count: true,
  })

  const byFeature = await prisma.aIUsage.groupBy({
    by: ["feature"],
    where: {
      organizationId,
      createdAt: {
        gte: start,
        lte: end,
      },
    },
    _sum: {
      totalTokens: true,
      cost: true,
    },
    _count: true,
  })

  return {
    period: { start, end },
    totals: {
      promptTokens: usage._sum.promptTokens || 0,
      completionTokens: usage._sum.completionTokens || 0,
      totalTokens: usage._sum.totalTokens || 0,
      cost: usage._sum.cost || 0,
      requests: usage._count,
    },
    byFeature: byFeature.map((f) => ({
      feature: f.feature,
      totalTokens: f._sum.totalTokens || 0,
      cost: f._sum.cost || 0,
      requests: f._count,
    })),
    limit: DEFAULT_MONTHLY_LIMIT,
    remaining: DEFAULT_MONTHLY_LIMIT - (usage._sum.totalTokens || 0),
    percentUsed: Math.round(
      ((usage._sum.totalTokens || 0) / DEFAULT_MONTHLY_LIMIT) * 100
    ),
  }
}

// Check if organization has remaining quota
export async function checkQuota(organizationId: string): Promise<{
  allowed: boolean
  remaining: number
  percentUsed: number
}> {
  const usage = await getOrganizationUsage(organizationId)
  return {
    allowed: usage.remaining > 0,
    remaining: usage.remaining,
    percentUsed: usage.percentUsed,
  }
}

// Cache helpers
const CACHE_TTL_HOURS = 24

export function hashPrompt(messages: Array<{ role: string; content: string }>, model: string): string {
  const content = JSON.stringify({ messages, model })
  return crypto.createHash("sha256").update(content).digest("hex")
}

export async function getCachedResponse(promptHash: string): Promise<string | null> {
  const cached = await prisma.aICache.findUnique({
    where: { promptHash },
  })

  if (!cached) return null

  // Check if expired
  if (cached.expiresAt < new Date()) {
    await prisma.aICache.delete({ where: { promptHash } })
    return null
  }

  return cached.response
}

export async function cacheResponse(
  promptHash: string,
  response: string,
  model: string
): Promise<void> {
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + CACHE_TTL_HOURS)

  await prisma.aICache.upsert({
    where: { promptHash },
    update: {
      response,
      model,
      expiresAt,
    },
    create: {
      promptHash,
      response,
      model,
      expiresAt,
    },
  })
}

// Cleanup expired cache entries
export async function cleanupExpiredCache(): Promise<number> {
  const result = await prisma.aICache.deleteMany({
    where: {
      expiresAt: { lt: new Date() },
    },
  })
  return result.count
}

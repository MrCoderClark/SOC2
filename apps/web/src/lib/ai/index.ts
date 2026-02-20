import OpenAI from "openai"

// AI Provider types
export type AIProvider = "openai" | "anthropic"

export interface AIConfig {
  provider: AIProvider
  model: string
  maxTokens?: number
  temperature?: number
}

export interface AIMessage {
  role: "system" | "user" | "assistant"
  content: string
}

export interface AIResponse {
  content: string
  usage: {
    promptTokens: number
    completionTokens: number
    totalTokens: number
  }
  model: string
  cached: boolean
}

// Default configurations
const DEFAULT_CONFIG: AIConfig = {
  provider: "openai",
  model: "gpt-4o-mini",
  maxTokens: 2000,
  temperature: 0.7,
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

// AI Service class
export class AIService {
  private config: AIConfig

  constructor(config: Partial<AIConfig> = {}) {
    this.config = { ...DEFAULT_CONFIG, ...config }
  }

  async chat(messages: AIMessage[]): Promise<AIResponse> {
    if (this.config.provider === "openai") {
      return this.chatOpenAI(messages)
    }
    throw new Error(`Provider ${this.config.provider} not supported`)
  }

  private async chatOpenAI(messages: AIMessage[]): Promise<AIResponse> {
    try {
      const response = await openai.chat.completions.create({
        model: this.config.model,
        messages: messages.map((m) => ({
          role: m.role,
          content: m.content,
        })),
        max_tokens: this.config.maxTokens,
        temperature: this.config.temperature,
      })

      const choice = response.choices[0]
      const usage = response.usage

      return {
        content: choice?.message?.content || "",
        usage: {
          promptTokens: usage?.prompt_tokens || 0,
          completionTokens: usage?.completion_tokens || 0,
          totalTokens: usage?.total_tokens || 0,
        },
        model: response.model,
        cached: false,
      }
    } catch (error: any) {
      console.error("OpenAI API error:", error)
      throw new AIError(
        error.message || "Failed to get AI response",
        error.status || 500,
        this.config.provider
      )
    }
  }

  // Convenience method for single prompt
  async prompt(systemPrompt: string, userPrompt: string): Promise<AIResponse> {
    return this.chat([
      { role: "system", content: systemPrompt },
      { role: "user", content: userPrompt },
    ])
  }

  // Stream response (for real-time output)
  async *stream(messages: AIMessage[]): AsyncGenerator<string> {
    if (this.config.provider !== "openai") {
      throw new Error("Streaming only supported for OpenAI")
    }

    const stream = await openai.chat.completions.create({
      model: this.config.model,
      messages: messages.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      max_tokens: this.config.maxTokens,
      temperature: this.config.temperature,
      stream: true,
    })

    for await (const chunk of stream) {
      const content = chunk.choices[0]?.delta?.content
      if (content) {
        yield content
      }
    }
  }
}

// Custom AI Error class
export class AIError extends Error {
  status: number
  provider: AIProvider

  constructor(message: string, status: number, provider: AIProvider) {
    super(message)
    this.name = "AIError"
    this.status = status
    this.provider = provider
  }
}

// Singleton instance for common use
export const ai = new AIService()

// Helper to check if AI is configured
export function isAIConfigured(): boolean {
  return !!process.env.OPENAI_API_KEY
}

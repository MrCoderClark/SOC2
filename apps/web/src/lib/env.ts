function getEnvVar(key: string): string {
  const value = process.env[key]
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value
}

function getEnvVarOptional(key: string, defaultValue = ""): string {
  return process.env[key] || defaultValue
}

function getEnvVarBoolean(key: string, defaultValue = false): boolean {
  const value = process.env[key]
  if (!value) return defaultValue
  return value.toLowerCase() === "true" || value === "1"
}

function getEnvVarNumber(key: string, defaultValue: number): number {
  const value = process.env[key]
  if (!value) return defaultValue
  const parsed = parseInt(value, 10)
  return isNaN(parsed) ? defaultValue : parsed
}

export const env = {
  // App
  get NODE_ENV() {
    return (getEnvVarOptional("NODE_ENV", "development")) as "development" | "production" | "test"
  },
  get APP_URL() {
    return getEnvVarOptional("NEXTAUTH_URL", "http://localhost:3000")
  },
  
  // Database (lazy - only throws when accessed at runtime)
  get DATABASE_URL() {
    return getEnvVar("DATABASE_URL")
  },
  
  // Auth (lazy - only throws when accessed at runtime)
  get NEXTAUTH_SECRET() {
    return getEnvVar("NEXTAUTH_SECRET")
  },
  get NEXTAUTH_URL() {
    return getEnvVarOptional("NEXTAUTH_URL", "http://localhost:3000")
  },
  
  // Google OAuth
  get GOOGLE_CLIENT_ID() {
    return getEnvVarOptional("GOOGLE_CLIENT_ID")
  },
  get GOOGLE_CLIENT_SECRET() {
    return getEnvVarOptional("GOOGLE_CLIENT_SECRET")
  },
  
  // GitHub OAuth
  get GITHUB_CLIENT_ID() {
    return getEnvVarOptional("GITHUB_CLIENT_ID")
  },
  get GITHUB_CLIENT_SECRET() {
    return getEnvVarOptional("GITHUB_CLIENT_SECRET")
  },
  
  // AWS Integration
  get AWS_ACCESS_KEY_ID() {
    return getEnvVarOptional("AWS_ACCESS_KEY_ID")
  },
  get AWS_SECRET_ACCESS_KEY() {
    return getEnvVarOptional("AWS_SECRET_ACCESS_KEY")
  },
  get AWS_REGION() {
    return getEnvVarOptional("AWS_REGION", "us-east-1")
  },
  
  // Slack Integration
  get SLACK_CLIENT_ID() {
    return getEnvVarOptional("SLACK_CLIENT_ID")
  },
  get SLACK_CLIENT_SECRET() {
    return getEnvVarOptional("SLACK_CLIENT_SECRET")
  },
  get SLACK_SIGNING_SECRET() {
    return getEnvVarOptional("SLACK_SIGNING_SECRET")
  },
  
  // AI/OpenAI
  get OPENAI_API_KEY() {
    return getEnvVarOptional("OPENAI_API_KEY")
  },
  get OPENAI_ORG_ID() {
    return getEnvVarOptional("OPENAI_ORG_ID")
  },
  
  // Email
  get SMTP_HOST() {
    return getEnvVarOptional("SMTP_HOST")
  },
  get SMTP_PORT() {
    return getEnvVarNumber("SMTP_PORT", 587)
  },
  get SMTP_USER() {
    return getEnvVarOptional("SMTP_USER")
  },
  get SMTP_PASSWORD() {
    return getEnvVarOptional("SMTP_PASSWORD")
  },
  get SMTP_FROM() {
    return getEnvVarOptional("SMTP_FROM", "noreply@example.com")
  },
  
  // Feature Flags
  get ENABLE_AI_FEATURES() {
    return getEnvVarBoolean("ENABLE_AI_FEATURES", false)
  },
  get ENABLE_SLACK_NOTIFICATIONS() {
    return getEnvVarBoolean("ENABLE_SLACK_NOTIFICATIONS", false)
  },
  get ENABLE_EMAIL_NOTIFICATIONS() {
    return getEnvVarBoolean("ENABLE_EMAIL_NOTIFICATIONS", false)
  },
  
  // Rate Limiting
  get RATE_LIMIT_MAX() {
    return getEnvVarNumber("RATE_LIMIT_MAX", 100)
  },
  get RATE_LIMIT_WINDOW_MS() {
    return getEnvVarNumber("RATE_LIMIT_WINDOW_MS", 60000)
  },
  
  // Helpers
  isDevelopment() {
    return this.NODE_ENV === "development"
  },
  isProduction() {
    return this.NODE_ENV === "production"
  },
  isTest() {
    return this.NODE_ENV === "test"
  },
}

export type Env = typeof env

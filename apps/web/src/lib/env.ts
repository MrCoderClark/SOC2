function getEnvVar(key: string, required = true): string {
  const value = process.env[key]
  if (required && !value) {
    throw new Error(`Missing required environment variable: ${key}`)
  }
  return value || ""
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
  NODE_ENV: getEnvVarOptional("NODE_ENV", "development") as "development" | "production" | "test",
  APP_URL: getEnvVarOptional("NEXTAUTH_URL", "http://localhost:3000"),
  
  // Database
  DATABASE_URL: getEnvVar("DATABASE_URL"),
  
  // Auth
  NEXTAUTH_SECRET: getEnvVar("NEXTAUTH_SECRET"),
  NEXTAUTH_URL: getEnvVarOptional("NEXTAUTH_URL", "http://localhost:3000"),
  
  // Google OAuth
  GOOGLE_CLIENT_ID: getEnvVarOptional("GOOGLE_CLIENT_ID"),
  GOOGLE_CLIENT_SECRET: getEnvVarOptional("GOOGLE_CLIENT_SECRET"),
  
  // GitHub OAuth
  GITHUB_CLIENT_ID: getEnvVarOptional("GITHUB_CLIENT_ID"),
  GITHUB_CLIENT_SECRET: getEnvVarOptional("GITHUB_CLIENT_SECRET"),
  
  // AWS Integration
  AWS_ACCESS_KEY_ID: getEnvVarOptional("AWS_ACCESS_KEY_ID"),
  AWS_SECRET_ACCESS_KEY: getEnvVarOptional("AWS_SECRET_ACCESS_KEY"),
  AWS_REGION: getEnvVarOptional("AWS_REGION", "us-east-1"),
  
  // Slack Integration
  SLACK_CLIENT_ID: getEnvVarOptional("SLACK_CLIENT_ID"),
  SLACK_CLIENT_SECRET: getEnvVarOptional("SLACK_CLIENT_SECRET"),
  SLACK_SIGNING_SECRET: getEnvVarOptional("SLACK_SIGNING_SECRET"),
  
  // AI/OpenAI
  OPENAI_API_KEY: getEnvVarOptional("OPENAI_API_KEY"),
  OPENAI_ORG_ID: getEnvVarOptional("OPENAI_ORG_ID"),
  
  // Email
  SMTP_HOST: getEnvVarOptional("SMTP_HOST"),
  SMTP_PORT: getEnvVarNumber("SMTP_PORT", 587),
  SMTP_USER: getEnvVarOptional("SMTP_USER"),
  SMTP_PASSWORD: getEnvVarOptional("SMTP_PASSWORD"),
  SMTP_FROM: getEnvVarOptional("SMTP_FROM", "noreply@example.com"),
  
  // Feature Flags
  ENABLE_AI_FEATURES: getEnvVarBoolean("ENABLE_AI_FEATURES", false),
  ENABLE_SLACK_NOTIFICATIONS: getEnvVarBoolean("ENABLE_SLACK_NOTIFICATIONS", false),
  ENABLE_EMAIL_NOTIFICATIONS: getEnvVarBoolean("ENABLE_EMAIL_NOTIFICATIONS", false),
  
  // Rate Limiting
  RATE_LIMIT_MAX: getEnvVarNumber("RATE_LIMIT_MAX", 100),
  RATE_LIMIT_WINDOW_MS: getEnvVarNumber("RATE_LIMIT_WINDOW_MS", 60000),
  
  // Helpers
  isDevelopment: () => env.NODE_ENV === "development",
  isProduction: () => env.NODE_ENV === "production",
  isTest: () => env.NODE_ENV === "test",
}

export type Env = typeof env

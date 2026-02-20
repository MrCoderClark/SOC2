import { ValidationError } from "./errors"

type ValidationRule<T> = {
  required?: boolean
  type?: "string" | "number" | "boolean" | "array" | "object"
  minLength?: number
  maxLength?: number
  min?: number
  max?: number
  pattern?: RegExp
  enum?: T[]
  custom?: (value: T) => boolean | string
}

type ValidationSchema<T> = {
  [K in keyof T]?: ValidationRule<T[K]>
}

export function validate<T extends Record<string, any>>(
  data: T,
  schema: ValidationSchema<T>
): T {
  const errors: Record<string, string[]> = {}

  for (const [field, rules] of Object.entries(schema) as [keyof T, ValidationRule<any>][]) {
    const value = data[field]
    const fieldErrors: string[] = []

    if (rules.required && (value === undefined || value === null || value === "")) {
      fieldErrors.push(`${String(field)} is required`)
      errors[String(field)] = fieldErrors
      continue
    }

    if (value === undefined || value === null) continue

    if (rules.type) {
      const actualType = Array.isArray(value) ? "array" : typeof value
      if (actualType !== rules.type) {
        fieldErrors.push(`${String(field)} must be a ${rules.type}`)
      }
    }

    if (rules.minLength !== undefined && typeof value === "string" && value.length < rules.minLength) {
      fieldErrors.push(`${String(field)} must be at least ${rules.minLength} characters`)
    }

    if (rules.maxLength !== undefined && typeof value === "string" && value.length > rules.maxLength) {
      fieldErrors.push(`${String(field)} must be at most ${rules.maxLength} characters`)
    }

    if (rules.min !== undefined && typeof value === "number" && value < rules.min) {
      fieldErrors.push(`${String(field)} must be at least ${rules.min}`)
    }

    if (rules.max !== undefined && typeof value === "number" && value > rules.max) {
      fieldErrors.push(`${String(field)} must be at most ${rules.max}`)
    }

    if (rules.pattern && typeof value === "string" && !rules.pattern.test(value)) {
      fieldErrors.push(`${String(field)} has invalid format`)
    }

    if (rules.enum && !rules.enum.includes(value)) {
      fieldErrors.push(`${String(field)} must be one of: ${rules.enum.join(", ")}`)
    }

    if (rules.custom) {
      const result = rules.custom(value)
      if (result !== true) {
        fieldErrors.push(typeof result === "string" ? result : `${String(field)} is invalid`)
      }
    }

    if (fieldErrors.length > 0) {
      errors[String(field)] = fieldErrors
    }
  }

  if (Object.keys(errors).length > 0) {
    throw new ValidationError("Validation failed", errors)
  }

  return data
}

export function isEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

export function isUrl(value: string): boolean {
  try {
    new URL(value)
    return true
  } catch {
    return false
  }
}

export function isUuid(value: string): boolean {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(value)
}

export function isCuid(value: string): boolean {
  return /^c[a-z0-9]{24}$/.test(value)
}

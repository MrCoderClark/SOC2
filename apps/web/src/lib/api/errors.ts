export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public code?: string
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export class UnauthorizedError extends ApiError {
  constructor(message = "Unauthorized") {
    super(401, message, "UNAUTHORIZED")
  }
}

export class ForbiddenError extends ApiError {
  constructor(message = "Forbidden") {
    super(403, message, "FORBIDDEN")
  }
}

export class NotFoundError extends ApiError {
  constructor(message = "Not found") {
    super(404, message, "NOT_FOUND")
  }
}

export class BadRequestError extends ApiError {
  constructor(message = "Bad request") {
    super(400, message, "BAD_REQUEST")
  }
}

export class ConflictError extends ApiError {
  constructor(message = "Conflict") {
    super(409, message, "CONFLICT")
  }
}

export class ValidationError extends ApiError {
  constructor(
    message = "Validation failed",
    public errors?: Record<string, string[]>
  ) {
    super(422, message, "VALIDATION_ERROR")
  }
}

export class InternalServerError extends ApiError {
  constructor(message = "Internal server error") {
    super(500, message, "INTERNAL_SERVER_ERROR")
  }
}

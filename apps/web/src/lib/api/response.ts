import { NextResponse } from "next/server"
import { ApiError } from "./errors"

export type ApiResponse<T = any> = {
  success: boolean
  data?: T
  error?: {
    message: string
    code?: string
    errors?: Record<string, string[]>
  }
  meta?: {
    page?: number
    limit?: number
    total?: number
    totalPages?: number
  }
}

export function successResponse<T>(data: T, status = 200): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    { success: true, data },
    { status }
  )
}

export function createdResponse<T>(data: T): NextResponse<ApiResponse<T>> {
  return successResponse(data, 201)
}

export function paginatedResponse<T>(
  data: T[],
  pagination: { page: number; limit: number; total: number }
): NextResponse<ApiResponse<T[]>> {
  return NextResponse.json({
    success: true,
    data,
    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total: pagination.total,
      totalPages: Math.ceil(pagination.total / pagination.limit),
    },
  })
}

export function errorResponse(error: ApiError | Error): NextResponse<ApiResponse> {
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: error.message,
          code: error.code,
          ...("errors" in error && { errors: (error as any).errors }),
        },
      },
      { status: error.statusCode }
    )
  }

  console.error("Unexpected error:", error)
  return NextResponse.json(
    {
      success: false,
      error: {
        message: "Internal server error",
        code: "INTERNAL_SERVER_ERROR",
      },
    },
    { status: 500 }
  )
}

export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

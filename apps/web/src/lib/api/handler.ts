import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"
import { ApiError, UnauthorizedError, ForbiddenError, NotFoundError } from "./errors"
import { errorResponse } from "./response"
import { Role, Permission, hasPermission } from "@/lib/permissions"

export type AuthContext = {
  userId: string
  email: string
  name: string | null
  role: Role
  organizationId: string
}

type HandlerOptions = {
  requireAuth?: boolean
  requireOrg?: boolean
  requiredPermission?: Permission
}

type HandlerFn<T = any> = (
  request: Request,
  context: { params?: any; auth?: AuthContext }
) => Promise<NextResponse<T>>

export function withApiHandler<T = any>(
  handler: HandlerFn<T>,
  options: HandlerOptions = {}
) {
  const { requireAuth = true, requireOrg = true, requiredPermission } = options

  return async (request: Request, context: { params?: any } = {}) => {
    try {
      let auth: AuthContext | undefined

      if (requireAuth) {
        const session = await getServerSession(authOptions)
        
        if (!session?.user?.id) {
          throw new UnauthorizedError()
        }

        const user = await prisma.user.findUnique({
          where: { id: session.user.id },
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            organizationId: true,
          },
        })

        if (!user) {
          throw new UnauthorizedError("User not found")
        }

        if (requireOrg && !user.organizationId) {
          throw new NotFoundError("Organization not found")
        }

        auth = {
          userId: user.id,
          email: user.email,
          name: user.name,
          role: user.role as Role,
          organizationId: user.organizationId!,
        }

        if (requiredPermission && !hasPermission(auth.role, requiredPermission)) {
          throw new ForbiddenError()
        }
      }

      return await handler(request, { ...context, auth })
    } catch (error) {
      if (error instanceof ApiError) {
        return errorResponse(error)
      }
      console.error("API Handler Error:", error)
      return errorResponse(error as Error)
    }
  }
}

export function parseSearchParams(request: Request) {
  const { searchParams } = new URL(request.url)
  return {
    page: parseInt(searchParams.get("page") || "1"),
    limit: Math.min(parseInt(searchParams.get("limit") || "20"), 100),
    search: searchParams.get("search") || undefined,
    sort: searchParams.get("sort") || undefined,
    order: (searchParams.get("order") || "desc") as "asc" | "desc",
    get: (key: string) => searchParams.get(key),
  }
}

export async function parseBody<T>(request: Request): Promise<T> {
  try {
    return await request.json()
  } catch {
    return {} as T
  }
}

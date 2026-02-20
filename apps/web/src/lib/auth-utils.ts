import { getServerSession } from "next-auth"
import { prisma } from "@soc2/database"
import { authOptions } from "@/lib/auth"
import { Role, Permission, hasPermission } from "@/lib/permissions"

export type AuthUser = {
  id: string
  email: string
  name: string | null
  role: Role
  organizationId: string | null
}

export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    return null
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
    return null
  }

  return {
    ...user,
    role: user.role as Role,
  }
}

export async function requireAuth(): Promise<AuthUser> {
  const user = await getCurrentUser()
  
  if (!user) {
    throw new Error("Unauthorized")
  }

  return user
}

export async function requirePermission(permission: Permission): Promise<AuthUser> {
  const user = await requireAuth()
  
  if (!hasPermission(user.role, permission)) {
    throw new Error("Forbidden")
  }

  return user
}

export async function requireOrganization(): Promise<AuthUser & { organizationId: string }> {
  const user = await requireAuth()
  
  if (!user.organizationId) {
    throw new Error("No organization")
  }

  return user as AuthUser & { organizationId: string }
}

export function checkPermission(user: AuthUser, permission: Permission): boolean {
  return hasPermission(user.role, permission)
}

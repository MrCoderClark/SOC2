"use client"

import { ReactNode } from "react"
import { usePermissions } from "@/hooks/use-permissions"
import { Permission } from "@/lib/permissions"

type RequirePermissionProps = {
  permission: Permission
  children: ReactNode
  fallback?: ReactNode
}

export function RequirePermission({ permission, children, fallback = null }: RequirePermissionProps) {
  const { hasPermission } = usePermissions()

  if (!hasPermission(permission)) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

type RequireAdminProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function RequireAdmin({ children, fallback = null }: RequireAdminProps) {
  const { isAdmin } = usePermissions()

  if (!isAdmin) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

type RequireWriteProps = {
  children: ReactNode
  fallback?: ReactNode
}

export function RequireWrite({ children, fallback = null }: RequireWriteProps) {
  const { isReadOnly } = usePermissions()

  if (isReadOnly) {
    return <>{fallback}</>
  }

  return <>{children}</>
}

"use client"

import { useSession } from "next-auth/react"
import { Role, Permission, hasPermission, getPermissions, isReadOnly } from "@/lib/permissions"

export function usePermissions() {
  const { data: session } = useSession()
  
  const role = (session?.user as any)?.role as Role | undefined

  return {
    role,
    hasPermission: (permission: Permission) => role ? hasPermission(role, permission) : false,
    getPermissions: () => role ? getPermissions(role) : [],
    isReadOnly: role ? isReadOnly(role) : true,
    isAdmin: role === "ADMIN" || role === "OWNER",
    isOwner: role === "OWNER",
    canManageOrg: role ? hasPermission(role, "org:manage") : false,
    canManageMembers: role ? hasPermission(role, "members:invite") : false,
    canWriteControls: role ? hasPermission(role, "controls:write") : false,
    canWritePolicies: role ? hasPermission(role, "policies:write") : false,
    canWriteEvidence: role ? hasPermission(role, "evidence:write") : false,
    canApprove: role ? hasPermission(role, "policies:approve") : false,
  }
}

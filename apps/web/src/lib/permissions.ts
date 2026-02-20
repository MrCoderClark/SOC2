export type Role = "OWNER" | "ADMIN" | "MEMBER" | "AUDITOR"

export type Permission =
  | "org:manage"
  | "org:delete"
  | "members:invite"
  | "members:remove"
  | "members:update_role"
  | "controls:read"
  | "controls:write"
  | "controls:delete"
  | "policies:read"
  | "policies:write"
  | "policies:delete"
  | "policies:approve"
  | "evidence:read"
  | "evidence:write"
  | "evidence:delete"
  | "evidence:approve"
  | "integrations:manage"
  | "audit:read"

const rolePermissions: Record<Role, Permission[]> = {
  OWNER: [
    "org:manage",
    "org:delete",
    "members:invite",
    "members:remove",
    "members:update_role",
    "controls:read",
    "controls:write",
    "controls:delete",
    "policies:read",
    "policies:write",
    "policies:delete",
    "policies:approve",
    "evidence:read",
    "evidence:write",
    "evidence:delete",
    "evidence:approve",
    "integrations:manage",
    "audit:read",
  ],
  ADMIN: [
    "org:manage",
    "members:invite",
    "members:remove",
    "members:update_role",
    "controls:read",
    "controls:write",
    "controls:delete",
    "policies:read",
    "policies:write",
    "policies:delete",
    "policies:approve",
    "evidence:read",
    "evidence:write",
    "evidence:delete",
    "evidence:approve",
    "integrations:manage",
    "audit:read",
  ],
  MEMBER: [
    "controls:read",
    "controls:write",
    "policies:read",
    "policies:write",
    "evidence:read",
    "evidence:write",
    "audit:read",
  ],
  AUDITOR: [
    "controls:read",
    "policies:read",
    "evidence:read",
    "audit:read",
  ],
}

export function hasPermission(role: Role, permission: Permission): boolean {
  return rolePermissions[role]?.includes(permission) ?? false
}

export function getPermissions(role: Role): Permission[] {
  return rolePermissions[role] ?? []
}

export function canManageOrg(role: Role): boolean {
  return hasPermission(role, "org:manage")
}

export function canManageMembers(role: Role): boolean {
  return hasPermission(role, "members:invite")
}

export function canWriteControls(role: Role): boolean {
  return hasPermission(role, "controls:write")
}

export function canApproveContent(role: Role): boolean {
  return hasPermission(role, "policies:approve") || hasPermission(role, "evidence:approve")
}

export function isReadOnly(role: Role): boolean {
  return role === "AUDITOR"
}

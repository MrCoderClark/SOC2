import { env } from "@/lib/env"

export type GoogleUser = {
  id: string
  email: string
  name: string
  isAdmin: boolean
  suspended: boolean
  creationTime: string
  lastLoginTime: string
  twoFactorEnabled: boolean
}

export type GoogleDriveFile = {
  id: string
  name: string
  mimeType: string
  shared: boolean
  sharingUser?: { emailAddress: string }
  permissions?: Array<{
    type: string
    role: string
    emailAddress?: string
    domain?: string
  }>
}

export type GoogleWorkspaceComplianceCheck = {
  totalUsers: number
  adminUsers: number
  suspendedUsers: number
  usersWithout2FA: number
  externallySharedFiles: number
  publicFiles: number
  score: number
}

export class GoogleWorkspaceClient {
  private accessToken: string
  private baseUrl = "https://admin.googleapis.com"
  private driveUrl = "https://www.googleapis.com/drive/v3"

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request<T>(url: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(url, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `Google API error: ${response.status}`)
    }

    return response.json()
  }

  async getCurrentUser() {
    return this.request<{ email: string; name: string }>(
      "https://www.googleapis.com/oauth2/v2/userinfo"
    )
  }

  async getUsers(domain: string): Promise<GoogleUser[]> {
    try {
      const response = await this.request<{ users: any[] }>(
        `${this.baseUrl}/admin/directory/v1/users?domain=${domain}&maxResults=100`
      )
      
      return (response.users || []).map((user) => ({
        id: user.id,
        email: user.primaryEmail,
        name: user.name?.fullName || user.primaryEmail,
        isAdmin: user.isAdmin || false,
        suspended: user.suspended || false,
        creationTime: user.creationTime,
        lastLoginTime: user.lastLoginTime,
        twoFactorEnabled: user.isEnrolledIn2Sv || false,
      }))
    } catch (error) {
      console.error("Error fetching Google Workspace users:", error)
      return []
    }
  }

  async getDriveFiles(): Promise<GoogleDriveFile[]> {
    try {
      const response = await this.request<{ files: any[] }>(
        `${this.driveUrl}/files?fields=files(id,name,mimeType,shared,sharingUser,permissions)&pageSize=100`
      )
      
      return (response.files || []).map((file) => ({
        id: file.id,
        name: file.name,
        mimeType: file.mimeType,
        shared: file.shared || false,
        sharingUser: file.sharingUser,
        permissions: file.permissions,
      }))
    } catch (error) {
      console.error("Error fetching Drive files:", error)
      return []
    }
  }

  async getComplianceCheck(domain: string): Promise<GoogleWorkspaceComplianceCheck> {
    const [users, files] = await Promise.all([
      this.getUsers(domain),
      this.getDriveFiles(),
    ])

    const totalUsers = users.length
    const adminUsers = users.filter((u) => u.isAdmin).length
    const suspendedUsers = users.filter((u) => u.suspended).length
    const usersWithout2FA = users.filter((u) => !u.twoFactorEnabled && !u.suspended).length

    const externallySharedFiles = files.filter((f) => 
      f.permissions?.some((p) => p.type === "user" && !p.emailAddress?.endsWith(`@${domain}`))
    ).length

    const publicFiles = files.filter((f) =>
      f.permissions?.some((p) => p.type === "anyone")
    ).length

    // Calculate compliance score
    let score = 100

    // Deduct for users without 2FA (up to 30 points)
    if (totalUsers > 0) {
      const twoFAPercentage = (totalUsers - usersWithout2FA) / totalUsers
      score -= Math.round((1 - twoFAPercentage) * 30)
    }

    // Deduct for public files (up to 25 points)
    if (files.length > 0) {
      const publicPercentage = publicFiles / files.length
      score -= Math.round(publicPercentage * 25)
    }

    // Deduct for externally shared files (up to 20 points)
    if (files.length > 0) {
      const externalPercentage = externallySharedFiles / files.length
      score -= Math.round(externalPercentage * 20)
    }

    // Deduct for too many admins (up to 15 points)
    if (totalUsers > 0) {
      const adminPercentage = adminUsers / totalUsers
      if (adminPercentage > 0.1) {
        score -= Math.round((adminPercentage - 0.1) * 150)
      }
    }

    return {
      totalUsers,
      adminUsers,
      suspendedUsers,
      usersWithout2FA,
      externallySharedFiles,
      publicFiles,
      score: Math.max(0, Math.min(100, score)),
    }
  }
}

export function getGoogleOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.GOOGLE_CLIENT_ID,
    redirect_uri: `${env.APP_URL}/api/integrations/google-workspace/callback`,
    response_type: "code",
    scope: [
      "https://www.googleapis.com/auth/admin.directory.user.readonly",
      "https://www.googleapis.com/auth/drive.metadata.readonly",
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ].join(" "),
    access_type: "offline",
    prompt: "consent",
    state,
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${params}`
}

export async function exchangeGoogleCode(code: string): Promise<{
  access_token: string
  refresh_token?: string
  expires_in: number
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: "authorization_code",
      redirect_uri: `${env.APP_URL}/api/integrations/google-workspace/callback`,
    }),
  })

  const data = await response.json()
  if (data.error) {
    throw new Error(data.error_description || data.error)
  }

  return data
}

export async function refreshGoogleToken(refreshToken: string): Promise<{
  access_token: string
  expires_in: number
}> {
  const response = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: env.GOOGLE_CLIENT_ID,
      client_secret: env.GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  const data = await response.json()
  if (data.error) {
    throw new Error(data.error_description || data.error)
  }

  return data
}

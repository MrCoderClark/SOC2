import { env } from "@/lib/env"

export type GitHubRepo = {
  id: number
  name: string
  full_name: string
  private: boolean
  description: string | null
  html_url: string
  default_branch: string
  created_at: string
  updated_at: string
  pushed_at: string
}

export type GitHubBranchProtection = {
  required_status_checks: {
    strict: boolean
    contexts: string[]
  } | null
  enforce_admins: { enabled: boolean } | null
  required_pull_request_reviews: {
    required_approving_review_count: number
    dismiss_stale_reviews: boolean
    require_code_owner_reviews: boolean
  } | null
  restrictions: any | null
}

export type GitHubComplianceCheck = {
  repo: string
  branchProtection: boolean
  requiresReviews: boolean
  requiresStatusChecks: boolean
  hasCodeOwners: boolean
  hasSecurityPolicy: boolean
  hasDependabot: boolean
  score: number
}

export class GitHubClient {
  private accessToken: string
  private baseUrl = "https://api.github.com"

  constructor(accessToken: string) {
    this.accessToken = accessToken
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.accessToken}`,
        Accept: "application/vnd.github.v3+json",
        "Content-Type": "application/json",
        ...options.headers,
      },
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.message || `GitHub API error: ${response.status}`)
    }

    return response.json()
  }

  async getUser() {
    return this.request<{ login: string; id: number; name: string; email: string }>("/user")
  }

  async getRepositories(): Promise<GitHubRepo[]> {
    return this.request<GitHubRepo[]>("/user/repos?per_page=100&sort=updated")
  }

  async getOrganizationRepositories(org: string): Promise<GitHubRepo[]> {
    return this.request<GitHubRepo[]>(`/orgs/${org}/repos?per_page=100&sort=updated`)
  }

  async getBranchProtection(owner: string, repo: string, branch: string): Promise<GitHubBranchProtection | null> {
    try {
      return await this.request<GitHubBranchProtection>(
        `/repos/${owner}/${repo}/branches/${branch}/protection`
      )
    } catch {
      return null
    }
  }

  async checkCodeOwners(owner: string, repo: string): Promise<boolean> {
    try {
      await this.request(`/repos/${owner}/${repo}/contents/CODEOWNERS`)
      return true
    } catch {
      try {
        await this.request(`/repos/${owner}/${repo}/contents/.github/CODEOWNERS`)
        return true
      } catch {
        return false
      }
    }
  }

  async checkSecurityPolicy(owner: string, repo: string): Promise<boolean> {
    try {
      await this.request(`/repos/${owner}/${repo}/contents/SECURITY.md`)
      return true
    } catch {
      try {
        await this.request(`/repos/${owner}/${repo}/contents/.github/SECURITY.md`)
        return true
      } catch {
        return false
      }
    }
  }

  async checkDependabot(owner: string, repo: string): Promise<boolean> {
    try {
      await this.request(`/repos/${owner}/${repo}/contents/.github/dependabot.yml`)
      return true
    } catch {
      try {
        await this.request(`/repos/${owner}/${repo}/contents/.github/dependabot.yaml`)
        return true
      } catch {
        return false
      }
    }
  }

  async getComplianceCheck(owner: string, repo: string, defaultBranch: string): Promise<GitHubComplianceCheck> {
    const [branchProtection, hasCodeOwners, hasSecurityPolicy, hasDependabot] = await Promise.all([
      this.getBranchProtection(owner, repo, defaultBranch),
      this.checkCodeOwners(owner, repo),
      this.checkSecurityPolicy(owner, repo),
      this.checkDependabot(owner, repo),
    ])

    const checks = {
      repo: `${owner}/${repo}`,
      branchProtection: !!branchProtection,
      requiresReviews: !!branchProtection?.required_pull_request_reviews,
      requiresStatusChecks: !!branchProtection?.required_status_checks,
      hasCodeOwners,
      hasSecurityPolicy,
      hasDependabot,
      score: 0,
    }

    const weights = {
      branchProtection: 20,
      requiresReviews: 25,
      requiresStatusChecks: 15,
      hasCodeOwners: 15,
      hasSecurityPolicy: 15,
      hasDependabot: 10,
    }

    checks.score = Object.entries(weights).reduce((score, [key, weight]) => {
      return score + (checks[key as keyof typeof weights] ? weight : 0)
    }, 0)

    return checks
  }
}

export function getGitHubOAuthUrl(state: string): string {
  const params = new URLSearchParams({
    client_id: env.GITHUB_CLIENT_ID,
    redirect_uri: `${env.APP_URL}/api/integrations/github/callback`,
    scope: "repo read:org",
    state,
  })
  return `https://github.com/login/oauth/authorize?${params}`
}

export async function exchangeGitHubCode(code: string): Promise<string> {
  const response = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
    }),
  })

  const data = await response.json()
  if (data.error) {
    throw new Error(data.error_description || data.error)
  }

  return data.access_token
}

"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { 
  Users, 
  Plus,
  Mail,
  Shield,
  MoreVertical,
  Trash2,
  UserCog
} from "lucide-react"
import { cn } from "@/lib/utils"

type Member = {
  id: string
  name: string | null
  email: string
  image: string | null
  role: string
  createdAt: string
}

const roleConfig = {
  OWNER: { label: "Owner", color: "text-purple-600", bg: "bg-purple-100" },
  ADMIN: { label: "Admin", color: "text-blue-600", bg: "bg-blue-100" },
  MEMBER: { label: "Member", color: "text-gray-600", bg: "bg-gray-100" },
  AUDITOR: { label: "Auditor", color: "text-green-600", bg: "bg-green-100" },
}

export default function TeamPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [loading, setLoading] = useState(true)
  const [showInvite, setShowInvite] = useState(false)
  const [inviteEmail, setInviteEmail] = useState("")
  const [inviteName, setInviteName] = useState("")
  const [inviteRole, setInviteRole] = useState("MEMBER")
  const [inviting, setInviting] = useState(false)

  useEffect(() => {
    fetchMembers()
  }, [])

  const fetchMembers = async () => {
    try {
      const res = await fetch("/api/organizations/members")
      if (res.ok) {
        const data = await res.json()
        setMembers(data)
      }
    } catch (error) {
      console.error("Failed to fetch members:", error)
    } finally {
      setLoading(false)
    }
  }

  const inviteMember = async () => {
    if (!inviteEmail) return
    setInviting(true)
    try {
      const res = await fetch("/api/organizations/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: inviteEmail,
          name: inviteName || undefined,
          role: inviteRole,
        }),
      })
      if (res.ok) {
        const newMember = await res.json()
        setMembers([...members, newMember])
        setShowInvite(false)
        setInviteEmail("")
        setInviteName("")
        setInviteRole("MEMBER")
      }
    } catch (error) {
      console.error("Failed to invite member:", error)
    } finally {
      setInviting(false)
    }
  }

  const updateRole = async (memberId: string, newRole: string) => {
    try {
      const res = await fetch(`/api/organizations/members/${memberId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: newRole }),
      })
      if (res.ok) {
        setMembers(members.map(m => 
          m.id === memberId ? { ...m, role: newRole } : m
        ))
      }
    } catch (error) {
      console.error("Failed to update role:", error)
    }
  }

  const removeMember = async (memberId: string) => {
    if (!confirm("Are you sure you want to remove this member?")) return
    try {
      const res = await fetch(`/api/organizations/members/${memberId}`, {
        method: "DELETE",
      })
      if (res.ok) {
        setMembers(members.filter(m => m.id !== memberId))
      }
    } catch (error) {
      console.error("Failed to remove member:", error)
    }
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Team</h1>
          <p className="text-muted-foreground mt-1">
            Manage your organization members
          </p>
        </div>
        <Button onClick={() => setShowInvite(true)}>
          <Plus className="h-4 w-4 mr-2" />
          Invite Member
        </Button>
      </div>

      {/* Invite Modal */}
      {showInvite && (
        <Card className="shadow-sm mb-6">
          <CardHeader>
            <CardTitle className="text-base">Invite New Member</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-3">
              <div>
                <label className="text-sm font-medium mb-2 block">Email *</label>
                <Input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Name</label>
                <Input
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="John Doe"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-2 block">Role</label>
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="w-full p-2 border rounded-lg"
                >
                  <option value="MEMBER">Member</option>
                  <option value="ADMIN">Admin</option>
                  <option value="AUDITOR">Auditor</option>
                </select>
              </div>
            </div>
            <div className="flex gap-2">
              <Button onClick={inviteMember} disabled={inviting || !inviteEmail}>
                <Mail className="h-4 w-4 mr-2" />
                {inviting ? "Inviting..." : "Send Invite"}
              </Button>
              <Button variant="outline" onClick={() => setShowInvite(false)}>
                Cancel
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Members List */}
      {loading ? (
        <div className="text-center py-12 text-muted-foreground">Loading...</div>
      ) : members.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold text-lg mb-2">No team members</h3>
            <p className="text-muted-foreground mb-4">
              Invite your first team member to get started
            </p>
            <Button onClick={() => setShowInvite(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Invite Member
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card className="shadow-sm">
          <CardContent className="p-0">
            <div className="divide-y">
              {members.map((member) => {
                const roleInfo = roleConfig[member.role as keyof typeof roleConfig]
                return (
                  <div key={member.id} className="flex items-center gap-4 p-4 hover:bg-muted/50">
                    <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {member.image ? (
                        <img src={member.image} alt="" className="h-10 w-10 rounded-full" />
                      ) : (
                        <span className="text-primary font-semibold">
                          {(member.name || member.email)[0].toUpperCase()}
                        </span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-foreground">
                        {member.name || member.email.split("@")[0]}
                      </p>
                      <p className="text-sm text-muted-foreground">{member.email}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <select
                        value={member.role}
                        onChange={(e) => updateRole(member.id, e.target.value)}
                        className={cn(
                          "text-sm px-2 py-1 rounded-full border-0 cursor-pointer",
                          roleInfo?.bg,
                          roleInfo?.color
                        )}
                        disabled={member.role === "OWNER"}
                      >
                        <option value="MEMBER">Member</option>
                        <option value="ADMIN">Admin</option>
                        <option value="AUDITOR">Auditor</option>
                        {member.role === "OWNER" && <option value="OWNER">Owner</option>}
                      </select>
                      {member.role !== "OWNER" && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeMember(member.id)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

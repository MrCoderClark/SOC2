"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import {
  Shield,
  LayoutDashboard,
  FileCheck,
  FileText,
  FolderOpen,
  Settings,
  Users,
  Link2,
  LogOut,
  Activity,
  Bell,
} from "lucide-react"
import { signOut } from "next-auth/react"

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Controls", href: "/dashboard/controls", icon: FileCheck },
  { name: "Policies", href: "/dashboard/policies", icon: FileText },
  { name: "Evidence", href: "/dashboard/evidence", icon: FolderOpen },
  { name: "Alerts", href: "/dashboard/alerts", icon: Bell, showBadge: true },
  { name: "Activity", href: "/dashboard/activity", icon: Activity },
  { name: "Integrations", href: "/dashboard/integrations", icon: Link2 },
  { name: "Team", href: "/dashboard/team", icon: Users },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

export function Sidebar() {
  const pathname = usePathname()
  const [openAlertCount, setOpenAlertCount] = useState(0)

  useEffect(() => {
    const fetchAlertCount = async () => {
      try {
        const res = await fetch("/api/alerts?status=OPEN")
        if (res.ok) {
          const alerts = await res.json()
          setOpenAlertCount(Array.isArray(alerts) ? alerts.length : 0)
        }
      } catch (error) {
        console.error("Failed to fetch alert count:", error)
      }
    }

    fetchAlertCount()
    // Refresh every 60 seconds
    const interval = setInterval(fetchAlertCount, 60000)
    return () => clearInterval(interval)
  }, [])

  return (
    <div className="flex h-full w-64 flex-col bg-card border-r shadow-sm">
      <div className="flex h-16 items-center gap-3 px-6 border-b">
        <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary-foreground" />
        </div>
        <span className="font-semibold text-foreground">SOC 2 Platform</span>
      </div>
      <nav className="flex-1 space-y-1 p-3">
        {navigation.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/")
          const showBadge = (item as any).showBadge && openAlertCount > 0
          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <item.icon className="h-4 w-4" />
              <span className="flex-1">{item.name}</span>
              {showBadge && (
                <span className={cn(
                  "min-w-[20px] h-5 px-1.5 rounded-full text-xs font-semibold flex items-center justify-center",
                  isActive 
                    ? "bg-primary-foreground text-primary" 
                    : "bg-red-500 text-white"
                )}>
                  {openAlertCount > 99 ? "99+" : openAlertCount}
                </span>
              )}
            </Link>
          )
        })}
      </nav>
      <div className="border-t p-3">
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground hover:bg-muted hover:text-foreground transition-all"
        >
          <LogOut className="h-4 w-4" />
          Sign out
        </button>
      </div>
    </div>
  )
}

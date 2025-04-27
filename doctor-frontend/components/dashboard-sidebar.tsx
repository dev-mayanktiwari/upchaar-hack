"use client"
import { usePathname, useRouter } from "next/navigation"
import Link from "next/link"
import {
  Calendar,
  ClipboardList,
  Heart,
  Home,
  LogOut,
  MessageSquare,
  Pill,
  User,
  AlertTriangle,
  Clock,
} from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { cn } from "@/lib/utils"
import { useAuth } from "@/hooks/use-auth"

interface DashboardSidebarProps {
  mobile?: boolean
  onClose?: () => void
}

export function DashboardSidebar({ mobile = false, onClose }: DashboardSidebarProps) {
  const { user, logout } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const { toast } = useToast()

  const handleLogout = () => {
    logout()
    if (onClose) onClose()
  }

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Manage Appointments", href: "/dashboard/manage-appointments", icon: Calendar },
    { name: "Approved Appointments", href: "/dashboard/approved-appointments", icon: ClipboardList },
    { name: "Request Leave", href: "/dashboard/request-leave", icon: Clock },
    // { name: "Medications", href: "/dashboard/medications", icon: Pill },
    // { name: "Drug Interaction", href: "/dashboard/drug-interaction", icon: AlertTriangle },
    // { name: "MedAI Bot", href: "/dashboard/medai-bot", icon: MessageSquare },
    // { name: "Profile", href: "/dashboard/profile", icon: User },
  ]

  return (
    <div
      className={cn("flex h-full w-64 flex-col border-r bg-background", mobile ? "min-h-screen w-full border-r-0" : "")}
    >
      {mobile && (
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <Heart className="h-6 w-6 text-rose-500" />
          <span className="text-lg font-bold">UPCHAAR</span>
        </div>
      )}
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href
            const Icon = item.icon

            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={onClose}
                className={cn(
                  "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4" />
                <span>{item.name}</span>
              </Link>
            )
          })}
        </nav>
      </div>
      <div className="mt-auto border-t p-2">
        <button
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <LogOut className="h-4 w-4" />
          <span>Log out</span>
        </button>
      </div>
    </div>
  )
}

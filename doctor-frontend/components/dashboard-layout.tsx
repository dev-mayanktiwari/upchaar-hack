"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Heart, Moon, Sun } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { useMobile } from "@/hooks/use-mobile"
import { Button } from "@/components/ui/button"
import { useTheme } from "next-themes"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { useAuth } from "@/hooks/use-auth"

interface DashboardLayoutProps {
  children: React.ReactNode
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const { toast } = useToast()
  const isMobile = useMobile()
  const { theme, setTheme } = useTheme()
  const [isOpen, setIsOpen] = useState(false)

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
      </div>
    )
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex flex-1 items-center gap-2">
          {isMobile && (
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="h-5 w-5"
                  >
                    <line x1="4" x2="20" y1="12" y2="12" />
                    <line x1="4" x2="20" y1="6" y2="6" />
                    <line x1="4" x2="20" y1="18" y2="18" />
                  </svg>
                  <span className="sr-only">Toggle menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="p-0">
                <DashboardSidebar mobile onClose={() => setIsOpen(false)} />
              </SheetContent>
            </Sheet>
          )}
          <Link href="/dashboard" className="flex items-center gap-2 font-bold text-xl">
            <Heart className="h-6 w-6 text-rose-500" />
            <span>UPCHAAR</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={toggleTheme} className="rounded-full h-9 w-9">
            {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            <span className="sr-only">Toggle theme</span>
          </Button>
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex md:flex-col md:items-end md:gap-0.5">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">{user.email}</div>
              </div>
              <Avatar className="h-9 w-9">
                <AvatarImage src="/placeholder.svg" alt={user.name} />
                <AvatarFallback className="bg-rose-100 text-rose-800 dark:bg-rose-900 dark:text-rose-200">
                  {user.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        <div className="hidden md:block">
          <DashboardSidebar />
        </div>
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  )
}

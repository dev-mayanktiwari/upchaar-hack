"use client";

import type React from "react";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Calendar,
  ClipboardList,
  Heart,
  Home,
  LogOut,
  Menu,
  MessageSquare,
  Pill,
  User,
  AlertTriangle,
  Hospital,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { useMobile } from "@/hooks/use-mobile";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );
  const router = useRouter();
  const pathname = usePathname();
  const { toast } = useToast();
  const isMobile = useMobile();

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem("accessToken");
    const userData = localStorage.getItem("user");

    if (!token) {
      router.push("/auth/login");
      return;
    }

    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("user");

    toast({
      title: "Logged out successfully",
      description: "You have been logged out of your account",
    });

    router.push("/auth/login");
  };

  const navigationItems = [
    { name: "Dashboard", href: "/dashboard", icon: Home },
    { name: "Hospitals", href: "/hospitals", icon: Hospital },
    {
      name: "Book Appointment",
      href: "/dashboard/book-appointment",
      icon: Calendar,
    },
    {
      name: "My Appointments",
      href: "/dashboard/appointments",
      icon: ClipboardList,
    },
    { name: "Medications", href: "/dashboard/medications", icon: Pill },
    {
      name: "Drug Interaction",
      href: "/dashboard/drug-interaction",
      icon: AlertTriangle,
    },
    { name: "MedAI Bot", href: "/dashboard/medai-bot", icon: MessageSquare },
    // { name: "Profile", href: "/dashboard/profile", icon: User },
  ];

  const NavItems = () => (
    <>
      {navigationItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            <Icon className="h-5 w-5" />
            {item.name}
          </Link>
        );
      })}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 flex h-16 items-center gap-4 border-b bg-background px-4 sm:px-6">
        <div className="flex flex-1 items-center gap-2">
          {isMobile && (
            <Sheet>
              <SheetTrigger asChild>
                <Button
                  variant="outline"
                  size="icon"
                  className="shrink-0 md:hidden"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="flex flex-col">
                <div className="flex items-center gap-2 border-b pb-4 pt-2">
                  <Heart className="h-6 w-6 text-rose-500" />
                  <span className="text-lg font-bold">HealthCare</span>
                </div>
                <nav className="flex-1 space-y-2 py-4">
                  <NavItems />
                </nav>
                <div className="border-t pt-4">
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-muted-foreground"
                    onClick={handleLogout}
                  >
                    <LogOut className="mr-3 h-5 w-5" />
                    Log out
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          )}
          <Link
            href="/dashboard"
            className="flex items-center gap-2 font-bold text-xl"
          >
            <Heart className="h-6 w-6 text-rose-500" />
            <span>UPCHAAR</span>
          </Link>
        </div>
        <div className="flex items-center gap-4">
          {user && (
            <div className="flex items-center gap-4">
              <div className="hidden md:flex md:flex-col md:items-end md:gap-0.5">
                <div className="text-sm font-medium">{user.name}</div>
                <div className="text-xs text-muted-foreground">
                  {user.email}
                </div>
              </div>
              <Avatar>
                <AvatarImage src="" alt={user.name} />
                <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
              </Avatar>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1">
        {/* Sidebar (desktop only) */}
        {!isMobile && (
          <aside className="hidden w-64 shrink-0 border-r md:block">
            <div className="flex h-full flex-col gap-2 p-4">
              <nav className="grid gap-1 py-2">
                <NavItems />
              </nav>
              <div className="mt-auto">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground"
                  onClick={handleLogout}
                >
                  <LogOut className="mr-3 h-5 w-5" />
                  Log out
                </Button>
              </div>
            </div>
          </aside>
        )}

        {/* Page Content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">{children}</main>
      </div>
    </div>
  );
}

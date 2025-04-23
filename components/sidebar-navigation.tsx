"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Car, Home, LogOut, Settings, User, Wallet, Receipt } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"

export default function SidebarNavigation({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const { toast } = useToast()
  const [open, setOpen] = useState(true)

  const handleLogout = () => {
    toast({
      title: "Logged out",
      description: "You have been successfully logged out",
    })
    window.location.href = "/"
  }

  return (
    <SidebarProvider defaultOpen={true} open={open} onOpenChange={setOpen}>
      <div className="flex min-h-screen">
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center gap-2 px-4 py-2">
              <Car className="h-6 w-6 text-primary" />
              <span className="text-lg font-bold">Smart Parking</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/dashboard"}>
                  <Link href="/dashboard">
                    <Home className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/reservations"}>
                  <Link href="/reservations">
                    <Car className="h-5 w-5" />
                    <span>My Reservations</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/profile"}>
                  <Link href="/profile">
                    <User className="h-5 w-5" />
                    <span>Profile</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/payment-history"}>
                  <Link href="/payment-history">
                    <Receipt className="h-5 w-5" />
                    <span>Payment History</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/crypto-payments"}>
                  <Link href="/crypto-payments">
                    <Wallet className="h-5 w-5" />
                    <span>Crypto Payments</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname.startsWith("/settings")}>
                  <Link href="/settings">
                    <Settings className="h-5 w-5" />
                    <span>Settings</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <div className="px-3 py-2">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>AJ</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="text-sm font-medium">Alex Johnson</p>
                    <p className="text-xs text-muted-foreground">Premium User</p>
                  </div>
                </div>
              </div>
              <Button variant="outline" size="sm" className="w-full" onClick={handleLogout}>
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </SidebarFooter>
        </Sidebar>
        <div className="flex-1 overflow-auto">
          <div className="container py-4">
            <div className="flex items-center mb-6">
              <SidebarTrigger />
              <div className="ml-4">
                <h1 className="text-2xl font-bold">Smart Parking System</h1>
              </div>
            </div>
            {children}
          </div>
        </div>
      </div>
    </SidebarProvider>
  )
}


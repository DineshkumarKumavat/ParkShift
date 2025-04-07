import type { Metadata } from "next"
import DashboardMap from "@/components/dashboard-map"
import DashboardHeader from "@/components/dashboard-header"

export const metadata: Metadata = {
  title: "Smart Parking - Dashboard",
  description: "Find and reserve parking spots near you",
}

export default function DashboardPage() {
  return (
    <main className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 p-4">
        <DashboardMap />
      </div>
    </main>
  )
}


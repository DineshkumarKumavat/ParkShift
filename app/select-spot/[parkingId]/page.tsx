import type { Metadata } from "next"
import SpotSelection from "@/components/spot-selection"
import DashboardHeader from "@/components/dashboard-header"

export const metadata: Metadata = {
  title: "Select Parking Spot",
  description: "Choose your preferred parking spot",
}

export default function SelectSpotPage({ params }: { params: { parkingId: string } }) {
  return (
    <main className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 p-4">
        <SpotSelection parkingId={params.parkingId} />
      </div>
    </main>
  )
}


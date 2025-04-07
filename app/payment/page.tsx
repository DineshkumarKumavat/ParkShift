import type { Metadata } from "next"
import PaymentForm from "@/components/payment-form"
import DashboardHeader from "@/components/dashboard-header"

export const metadata: Metadata = {
  title: "Payment - Smart Parking",
  description: "Complete your parking reservation payment",
}

export default function PaymentPage({
  searchParams,
}: {
  searchParams: {
    parkingId: string
    spot: string
    date: string
    time: string
    duration: string
    cost: string
  }
}) {
  return (
    <main className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex-1 p-4">
        <PaymentForm
          parkingId={searchParams.parkingId}
          spot={searchParams.spot}
          date={searchParams.date}
          time={searchParams.time}
          duration={searchParams.duration}
          cost={searchParams.cost}
        />
      </div>
    </main>
  )
}


import type { Metadata } from "next"
import PaymentHistory from "@/components/payment-history"
import SidebarNavigation from "@/components/sidebar-navigation"

export const metadata: Metadata = {
  title: "Payment History - Smart Parking",
  description: "View your payment history and transaction details",
}

export default function PaymentHistoryPage() {
  return (
    <SidebarNavigation>
      <PaymentHistory />
    </SidebarNavigation>
  )
}


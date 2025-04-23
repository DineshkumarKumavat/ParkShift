import type { Metadata } from "next"
import CryptoTransactionHistory from "@/components/crypto-transaction-history"
import SidebarNavigation from "@/components/sidebar-navigation"

export const metadata: Metadata = {
  title: "Crypto Payments - Smart Parking",
  description: "View your cryptocurrency transaction history",
}

export default function CryptoPaymentsPage() {
  return (
    <SidebarNavigation>
      <CryptoTransactionHistory />
    </SidebarNavigation>
  )
}


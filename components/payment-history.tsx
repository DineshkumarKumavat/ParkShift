"use client"

import { useState } from "react"
import { format } from "date-fns"
import {
  CreditCard,
  Search,
  Filter,
  ArrowUpRight,
  Clock,
  Calendar,
  MapPin,
  Receipt,
  Download,
  FileText,
  Printer,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { useToast } from "@/hooks/use-toast"
import { Separator } from "@/components/ui/separator"

// Mock payment data
const MOCK_PAYMENTS = [
  {
    id: "pay-001",
    parkingId: 1,
    parkingName: "Downtown Parking",
    parkingAddress: "123 Main St",
    spot: "A4",
    date: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    startTime: "10:00 AM",
    duration: 2,
    amount: 11.98,
    status: "completed",
    paymentMethod: "credit-card",
    cardLast4: "4242",
    cardBrand: "Visa",
    receiptUrl: "#",
    invoiceNumber: "INV-2023-001",
  },
  {
    id: "pay-002",
    parkingId: 2,
    parkingName: "City Center Garage",
    parkingAddress: "456 Park Ave",
    spot: "P8",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    startTime: "02:00 PM",
    duration: 3,
    amount: 23.97,
    status: "completed",
    paymentMethod: "paypal",
    paypalEmail: "alex.johnson@example.com",
    receiptUrl: "#",
    invoiceNumber: "INV-2023-002",
  },
  {
    id: "pay-003",
    parkingId: 3,
    parkingName: "Riverside Parking",
    parkingAddress: "789 River Rd",
    spot: "R2",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    startTime: "09:00 AM",
    duration: 4,
    amount: 19.96,
    status: "completed",
    paymentMethod: "apple-pay",
    receiptUrl: "#",
    invoiceNumber: "INV-2023-003",
  },
  {
    id: "pay-004",
    parkingId: 1,
    parkingName: "Downtown Parking",
    parkingAddress: "123 Main St",
    spot: "A1",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    startTime: "11:00 AM",
    duration: 2,
    amount: 11.98,
    status: "refunded",
    paymentMethod: "credit-card",
    cardLast4: "4242",
    cardBrand: "Visa",
    refundReason: "Reservation cancelled",
    refundDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 6), // 6 days ago
    receiptUrl: "#",
    invoiceNumber: "INV-2023-004",
  },
  {
    id: "pay-005",
    parkingId: 2,
    parkingName: "City Center Garage",
    parkingAddress: "456 Park Ave",
    spot: "P3",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    startTime: "04:00 PM",
    duration: 5,
    amount: 39.95,
    status: "completed",
    paymentMethod: "credit-card",
    cardLast4: "8765",
    cardBrand: "Mastercard",
    receiptUrl: "#",
    invoiceNumber: "INV-2023-005",
  },
  {
    id: "pay-006",
    parkingId: 3,
    parkingName: "Riverside Parking",
    parkingAddress: "789 River Rd",
    spot: "R5",
    date: new Date(Date.now() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
    startTime: "10:30 AM",
    duration: 6,
    amount: 29.94,
    status: "failed",
    paymentMethod: "credit-card",
    cardLast4: "1234",
    cardBrand: "Visa",
    failureReason: "Card declined",
    receiptUrl: "#",
    invoiceNumber: "INV-2023-006",
  },
]

export default function PaymentHistory() {
  const { toast } = useToast()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [methodFilter, setMethodFilter] = useState("all")
  const [selectedPayment, setSelectedPayment] = useState<any>(null)
  const [isReceiptOpen, setIsReceiptOpen] = useState(false)

  // Filter payments
  const filteredPayments = MOCK_PAYMENTS.filter((payment) => {
    // Apply search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      payment.parkingName.toLowerCase().includes(searchLower) ||
      payment.spot.toLowerCase().includes(searchLower) ||
      payment.invoiceNumber.toLowerCase().includes(searchLower) ||
      payment.amount.toString().includes(searchLower)

    // Apply status filter
    const matchesStatus = statusFilter === "all" || statusFilter === payment.status

    // Apply payment method filter
    const matchesMethod = methodFilter === "all" || methodFilter === payment.paymentMethod

    return matchesSearch && matchesStatus && matchesMethod
  })

  const handleDownloadReceipt = () => {
    toast({
      title: "Receipt downloaded",
      description: "Your receipt has been downloaded successfully",
    })
  }

  const handlePrintReceipt = () => {
    toast({
      title: "Printing receipt",
      description: "Your receipt is being sent to the printer",
    })
  }

  const getPaymentMethodIcon = (method: string) => {
    switch (method) {
      case "credit-card":
        return <CreditCard className="h-5 w-5" />
      case "paypal":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M7.5 19.5H3.5L5 7.5H9C11.5 7.5 12.5 9 12 11C11.5 13 9.5 14.5 7 14.5H5.5L6.5 19.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <path
              d="M13.5 19.5H9.5L11 7.5H15C17.5 7.5 18.5 9 18 11C17.5 13 15.5 14.5 13 14.5H11.5L12.5 19.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      case "apple-pay":
        return (
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12.5 7.5C12.5 7.5 14 6 16 6C18 6 19.5 7.5 19.5 9.5C19.5 11.5 18 13 16 14.5L12 18.5L8 14.5C6 13 4.5 11.5 4.5 9.5C4.5 7.5 6 6 8 6C10 6 11.5 7.5 11.5 7.5"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )
      default:
        return <CreditCard className="h-5 w-5" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completed</Badge>
      case "pending":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            Pending
          </Badge>
        )
      case "failed":
        return <Badge variant="destructive">Failed</Badge>
      case "refunded":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Refunded
          </Badge>
        )
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Payment History</h1>
          <p className="text-muted-foreground">View and manage your payment transactions</p>
        </div>
      </div>

      <div className="bg-background rounded-lg border shadow-sm mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search payments..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Status</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
                <SelectItem value="refunded">Refunded</SelectItem>
              </SelectContent>
            </Select>
            <Select value={methodFilter} onValueChange={setMethodFilter}>
              <SelectTrigger className="w-[150px]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Payment Method</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Methods</SelectItem>
                <SelectItem value="credit-card">Credit Card</SelectItem>
                <SelectItem value="paypal">PayPal</SelectItem>
                <SelectItem value="apple-pay">Apple Pay</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="details">Payment Details</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredPayments.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Receipt className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No payments found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {searchQuery || statusFilter !== "all" || methodFilter !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "You haven't made any payments yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredPayments.map((payment) => (
                <Card
                  key={payment.id}
                  className={`overflow-hidden cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedPayment?.id === payment.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedPayment(payment)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium">{payment.parkingName}</h3>
                          {getStatusBadge(payment.status)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {format(payment.date, "MMM d, yyyy")} • Spot {payment.spot} • {payment.invoiceNumber}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">${payment.amount.toFixed(2)}</span>
                          <div className="flex items-center gap-1 text-muted-foreground">
                            {getPaymentMethodIcon(payment.paymentMethod)}
                            <span>
                              {payment.paymentMethod === "credit-card"
                                ? `${payment.cardBrand} •••• ${payment.cardLast4}`
                                : payment.paymentMethod === "paypal"
                                  ? payment.paypalEmail
                                  : payment.paymentMethod === "apple-pay"
                                    ? "Apple Pay"
                                    : payment.paymentMethod}
                            </span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          {selectedPayment ? (
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle>Payment Details</CardTitle>
                    <CardDescription>
                      {selectedPayment.invoiceNumber} • {format(selectedPayment.date, "MMMM d, yyyy")}
                    </CardDescription>
                  </div>
                  {getStatusBadge(selectedPayment.status)}
                </div>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Reservation Details</h3>
                      <div className="bg-accent p-4 rounded-lg space-y-3">
                        <div className="flex items-start gap-3">
                          <MapPin className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">{selectedPayment.parkingName}</p>
                            <p className="text-sm text-muted-foreground">{selectedPayment.parkingAddress}</p>
                            <p className="text-sm font-medium mt-1">Spot {selectedPayment.spot}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Calendar className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">{format(selectedPayment.date, "EEEE, MMMM d, yyyy")}</p>
                            <p className="text-sm text-muted-foreground">Starting at {selectedPayment.startTime}</p>
                          </div>
                        </div>
                        <div className="flex items-start gap-3">
                          <Clock className="h-5 w-5 text-primary mt-0.5" />
                          <div>
                            <p className="font-medium">
                              {selectedPayment.duration} hour{selectedPayment.duration > 1 ? "s" : ""}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Rate: ${(selectedPayment.amount / selectedPayment.duration).toFixed(2)}/hour
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {selectedPayment.status === "failed" && (
                      <div className="bg-red-50 p-4 rounded-lg border border-red-200">
                        <h4 className="text-red-800 font-medium flex items-center gap-2 mb-1">
                          <Badge variant="destructive">Failed</Badge>
                          Payment Failed
                        </h4>
                        <p className="text-sm text-red-700">Reason: {selectedPayment.failureReason}</p>
                      </div>
                    )}

                    {selectedPayment.status === "refunded" && (
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                        <h4 className="text-blue-800 font-medium flex items-center gap-2 mb-1">
                          <Badge variant="outline" className="border-blue-500 text-blue-700">
                            Refunded
                          </Badge>
                          Payment Refunded
                        </h4>
                        <p className="text-sm text-blue-700">
                          Refund processed on {format(selectedPayment.refundDate, "MMMM d, yyyy")}
                        </p>
                        <p className="text-sm text-blue-700 mt-1">Reason: {selectedPayment.refundReason}</p>
                      </div>
                    )}
                  </div>

                  <div className="space-y-4">
                    <div>
                      <h3 className="text-lg font-medium mb-2">Payment Information</h3>
                      <div className="bg-accent p-4 rounded-lg space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-sm">Payment Method</span>
                          <div className="flex items-center gap-2">
                            {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                            <span className="font-medium">
                              {selectedPayment.paymentMethod === "credit-card"
                                ? `${selectedPayment.cardBrand} •••• ${selectedPayment.cardLast4}`
                                : selectedPayment.paymentMethod === "paypal"
                                  ? "PayPal"
                                  : selectedPayment.paymentMethod === "apple-pay"
                                    ? "Apple Pay"
                                    : selectedPayment.paymentMethod}
                            </span>
                          </div>
                        </div>

                        {selectedPayment.paymentMethod === "paypal" && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm">PayPal Email</span>
                            <span className="font-medium">{selectedPayment.paypalEmail}</span>
                          </div>
                        )}

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Date</span>
                          <span className="font-medium">{format(selectedPayment.date, "MMM d, yyyy h:mm a")}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Transaction ID</span>
                          <span className="font-medium font-mono text-xs">{selectedPayment.id}</span>
                        </div>

                        <Separator />

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Subtotal</span>
                          <span>${selectedPayment.amount.toFixed(2)}</span>
                        </div>

                        <div className="flex justify-between items-center">
                          <span className="text-sm">Service Fee</span>
                          <span>$0.00</span>
                        </div>

                        <div className="flex justify-between items-center font-medium">
                          <span>Total</span>
                          <span>${selectedPayment.amount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex gap-2 justify-end">
                      <Button
                        variant="outline"
                        className="flex items-center gap-2"
                        onClick={() => setIsReceiptOpen(true)}
                      >
                        <FileText className="h-4 w-4" />
                        View Receipt
                      </Button>
                      <Button variant="outline" className="flex items-center gap-2" onClick={handleDownloadReceipt}>
                        <Download className="h-4 w-4" />
                        Download
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <Receipt className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No payment selected</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Select a payment from the list view to see its details.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Receipt Dialog */}
      <Dialog open={isReceiptOpen} onOpenChange={setIsReceiptOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Payment Receipt</DialogTitle>
            <DialogDescription>
              {selectedPayment?.invoiceNumber} • {selectedPayment && format(selectedPayment.date, "MMMM d, yyyy")}
            </DialogDescription>
          </DialogHeader>

          {selectedPayment && (
            <div className="space-y-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-xl">Smart Parking</h3>
                  <p className="text-sm text-muted-foreground">123 Parking Avenue</p>
                  <p className="text-sm text-muted-foreground">support@smartparking.com</p>
                </div>
                <div className="text-right">
                  <p className="font-medium">Receipt #{selectedPayment.invoiceNumber}</p>
                  <p className="text-sm text-muted-foreground">{format(selectedPayment.date, "MMM d, yyyy h:mm a")}</p>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Parking Details</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Location</span>
                    <span className="font-medium">{selectedPayment.parkingName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Spot</span>
                    <span className="font-medium">{selectedPayment.spot}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Date</span>
                    <span className="font-medium">{format(selectedPayment.date, "MMM d, yyyy")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Time</span>
                    <span className="font-medium">
                      {selectedPayment.startTime} ({selectedPayment.duration} hours)
                    </span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Payment Summary</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal</span>
                    <span>${selectedPayment.amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Service Fee</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Tax</span>
                    <span>$0.00</span>
                  </div>
                  <div className="flex justify-between font-medium">
                    <span>Total</span>
                    <span>${selectedPayment.amount.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-2">Payment Method</h4>
                <div className="flex items-center gap-2">
                  {getPaymentMethodIcon(selectedPayment.paymentMethod)}
                  <span>
                    {selectedPayment.paymentMethod === "credit-card"
                      ? `${selectedPayment.cardBrand} •••• ${selectedPayment.cardLast4}`
                      : selectedPayment.paymentMethod === "paypal"
                        ? `PayPal (${selectedPayment.paypalEmail})`
                        : selectedPayment.paymentMethod === "apple-pay"
                          ? "Apple Pay"
                          : selectedPayment.paymentMethod}
                  </span>
                </div>
              </div>

              <div className="text-center text-xs text-muted-foreground pt-4">
                <p>Thank you for using Smart Parking!</p>
                <p>For any questions, please contact support@smartparking.com</p>
              </div>
            </div>
          )}

          <DialogFooter className="flex gap-2">
            <Button
              variant="outline"
              className="flex-1 flex items-center justify-center gap-2"
              onClick={handlePrintReceipt}
            >
              <Printer className="h-4 w-4" />
              Print
            </Button>
            <Button className="flex-1 flex items-center justify-center gap-2" onClick={handleDownloadReceipt}>
              <Download className="h-4 w-4" />
              Download
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}


"use client"

import { useState } from "react"
import { format } from "date-fns"
import { CheckCircle2, XCircle, ExternalLink, Search, Filter, ArrowUpRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

// Mock transaction data
const MOCK_TRANSACTIONS = [
  {
    id: "tx-001",
    hash: "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef",
    from: "0x1234567890123456789012345678901234567890",
    to: "0x0987654321098765432109876543210987654321",
    amount: "0.0024",
    amountUsd: "5.99",
    timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
    status: "confirmed",
    type: "payment",
    parkingSpot: "A4",
    blockNumber: 12345678,
    gasUsed: "21000",
    gasPrice: "20",
  },
  {
    id: "tx-002",
    hash: "0xabcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890",
    from: "0x1234567890123456789012345678901234567890",
    to: "0x5432109876543210987654321098765432109876",
    amount: "0.0096",
    amountUsd: "23.97",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    status: "confirmed",
    type: "payment",
    parkingSpot: "P8",
    blockNumber: 12345670,
    gasUsed: "21000",
    gasPrice: "20",
  },
  {
    id: "tx-003",
    hash: "0x7890abcdef1234567890abcdef1234567890abcdef1234567890abcdef123456",
    from: "0x1234567890123456789012345678901234567890",
    to: "0x6789012345678901234567890123456789012345",
    amount: "0.0080",
    amountUsd: "19.96",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 5), // 5 days ago
    status: "confirmed",
    type: "payment",
    parkingSpot: "R2",
    blockNumber: 12345660,
    gasUsed: "21000",
    gasPrice: "20",
  },
  {
    id: "tx-004",
    hash: "0xdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abc",
    from: "0x1234567890123456789012345678901234567890",
    to: "0x3456789012345678901234567890123456789012",
    amount: "0.0048",
    amountUsd: "11.98",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    status: "confirmed",
    type: "payment",
    parkingSpot: "A1",
    blockNumber: 12345650,
    gasUsed: "21000",
    gasPrice: "20",
  },
  {
    id: "tx-005",
    hash: "0x567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234",
    from: "0x1234567890123456789012345678901234567890",
    to: "0x9012345678901234567890123456789012345678",
    amount: "0.0160",
    amountUsd: "39.95",
    timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10), // 10 days ago
    status: "confirmed",
    type: "payment",
    parkingSpot: "P3",
    blockNumber: 12345640,
    gasUsed: "21000",
    gasPrice: "20",
  },
]

export default function CryptoTransactionHistory() {
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [selectedTransaction, setSelectedTransaction] = useState<any>(null)

  // Filter transactions
  const filteredTransactions = MOCK_TRANSACTIONS.filter((tx) => {
    // Apply search filter
    const searchLower = searchQuery.toLowerCase()
    const matchesSearch =
      tx.hash.toLowerCase().includes(searchLower) ||
      tx.parkingSpot.toLowerCase().includes(searchLower) ||
      tx.amount.includes(searchLower)

    // Apply status filter
    const matchesStatus = statusFilter === "all" || statusFilter === tx.status

    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Crypto Transactions</h1>
          <p className="text-muted-foreground">View your cryptocurrency transaction history</p>
        </div>
      </div>

      <div className="bg-background rounded-lg border shadow-sm mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search transactions..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Status</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="details">Transaction Details</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredTransactions.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <ExternalLink className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No transactions found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {searchQuery || statusFilter !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "You haven't made any cryptocurrency transactions yet."}
                </p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {filteredTransactions.map((tx) => (
                <Card
                  key={tx.id}
                  className={`overflow-hidden cursor-pointer transition-colors hover:bg-accent/50 ${
                    selectedTransaction?.id === tx.id ? "border-primary" : ""
                  }`}
                  onClick={() => setSelectedTransaction(tx)}
                >
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium">Parking Spot {tx.parkingSpot}</h3>
                          {tx.status === "confirmed" ? (
                            <Badge className="bg-green-500">Confirmed</Badge>
                          ) : tx.status === "pending" ? (
                            <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                              Pending
                            </Badge>
                          ) : (
                            <Badge variant="destructive">Failed</Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {format(tx.timestamp, "MMM d, yyyy 'at' h:mm a")}
                        </p>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="font-medium">{tx.amount} ETH</span>
                          <span className="text-muted-foreground">(${tx.amountUsd})</span>
                        </div>
                      </div>
                      <div className="flex items-center">
                        <Button variant="ghost" size="icon">
                          <ArrowUpRight className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t">
                      <p className="text-xs font-mono text-muted-foreground truncate">{tx.hash}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="details">
          {selectedTransaction ? (
            <Card>
              <CardHeader>
                <CardTitle>Transaction Details</CardTitle>
                <CardDescription>Detailed information about the selected transaction</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-medium">Parking Spot {selectedTransaction.parkingSpot}</h3>
                  {selectedTransaction.status === "confirmed" ? (
                    <div className="flex items-center text-green-600">
                      <CheckCircle2 className="h-5 w-5 mr-1" />
                      <span>Confirmed</span>
                    </div>
                  ) : selectedTransaction.status === "pending" ? (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                      Pending
                    </Badge>
                  ) : (
                    <div className="flex items-center text-red-600">
                      <XCircle className="h-5 w-5 mr-1" />
                      <span>Failed</span>
                    </div>
                  )}
                </div>

                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Transaction Hash</p>
                      <div className="flex items-center gap-1">
                        <p className="text-sm font-mono break-all">{selectedTransaction.hash}</p>
                        <Button variant="ghost" size="icon" className="h-6 w-6">
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Block</p>
                      <p className="text-sm">{selectedTransaction.blockNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">From</p>
                      <p className="text-sm font-mono truncate">{selectedTransaction.from}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">To</p>
                      <p className="text-sm font-mono truncate">{selectedTransaction.to}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Value</p>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium">{selectedTransaction.amount} ETH</p>
                        <p className="text-xs text-muted-foreground">(${selectedTransaction.amountUsd} USD)</p>
                      </div>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Timestamp</p>
                      <p className="text-sm">{format(selectedTransaction.timestamp, "MMM d, yyyy 'at' h:mm:ss a")}</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Gas Used</p>
                      <p className="text-sm">{selectedTransaction.gasUsed} units</p>
                    </div>
                    <div className="space-y-1">
                      <p className="text-sm text-muted-foreground">Gas Price</p>
                      <p className="text-sm">{selectedTransaction.gasPrice} Gwei</p>
                    </div>
                  </div>
                </div>

                <div className="bg-accent p-4 rounded-lg">
                  <h4 className="font-medium mb-2">Transaction Purpose</h4>
                  <p className="text-sm">
                    Payment for parking reservation at Spot {selectedTransaction.parkingSpot}. Transaction completed on{" "}
                    {format(selectedTransaction.timestamp, "MMMM d, yyyy")}.
                  </p>
                </div>

                <div className="flex justify-end">
                  <Button variant="outline" className="flex items-center gap-2">
                    <ExternalLink className="h-4 w-4" />
                    View on Etherscan
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <div className="rounded-full bg-muted p-3 mb-4">
                  <ExternalLink className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-2">No transaction selected</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  Select a transaction from the list view to see its details.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}


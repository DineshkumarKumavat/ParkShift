"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { format } from "date-fns"
import { CreditCard, CheckCircle2, Clock, Calendar, MapPin, Wallet, AlertCircle, ExternalLink } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import useBlockchainIntegration from "@/components/blockchain-integration"

// Mock parking data
const PARKING_LOCATIONS = {
  "1": { name: "Downtown Parking", address: "123 Main St" },
  "2": { name: "City Center Garage", address: "456 Park Ave" },
  "3": { name: "Riverside Parking", address: "789 River Rd" },
}

// Mock ETH to USD conversion rate
const ETH_TO_USD_RATE = 2500

export default function PaymentForm({
  parkingId,
  spot,
  date,
  time,
  duration,
  cost,
}: {
  parkingId: string
  spot: string
  date: string
  time: string
  duration: string
  cost: string
}) {
  const router = useRouter()
  const { toast } = useToast()
  const searchParams = useSearchParams()
  const [paymentMethod, setPaymentMethod] = useState("credit-card")
  const [cardNumber, setCardNumber] = useState("")
  const [cardName, setCardName] = useState("")
  const [expiryMonth, setExpiryMonth] = useState("")
  const [expiryYear, setExpiryYear] = useState("")
  const [cvv, setCvv] = useState("")
  const [isProcessing, setIsProcessing] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  // Crypto payment states
  const [walletAddress, setWalletAddress] = useState("")
  const [privateKey, setPrivateKey] = useState("")
  const [isWalletConnected, setIsWalletConnected] = useState(false)
  const [ethAmount, setEthAmount] = useState("")
  const [transactionHash, setTransactionHash] = useState("")
  const [transactionStatus, setTransactionStatus] = useState<"idle" | "pending" | "success" | "error">("idle")
  const [ganacheAccounts, setGanacheAccounts] = useState<string[]>([])
  const [selectedAccount, setSelectedAccount] = useState("")
  const [accountBalance, setAccountBalance] = useState("")
  const [transactionProgress, setTransactionProgress] = useState(0)
  const [walletBalance, setWalletBalance] = useState<string>("")

  const parkingLocation = PARKING_LOCATIONS[parkingId as keyof typeof PARKING_LOCATIONS]
  const reservationDate = date ? new Date(date) : new Date()
  const costValue = Number.parseFloat(cost)

  const { isConnected, account, connectWallet, processCryptoPayment, processGanachePayment } =
    useBlockchainIntegration()

  // Calculate ETH amount based on cost
  useEffect(() => {
    if (costValue) {
      const ethValue = (costValue / ETH_TO_USD_RATE).toFixed(6)
      setEthAmount(ethValue)
    }
  }, [costValue])

  useEffect(() => {
    if (isConnected) {
      setIsWalletConnected(true)
    }
  }, [isConnected])

  // Simulate connecting to Ganache
  const connectToGanache = async () => {
    setIsProcessing(true)

    try {
      // Simulate API call to Ganache
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Mock Ganache accounts
      const mockAccounts = [
        "0x1234567890123456789012345678901234567890",
        "0x2345678901234567890123456789012345678901",
        "0x3456789012345678901234567890123456789012",
      ]

      setGanacheAccounts(mockAccounts)
      setIsWalletConnected(true)

      toast({
        title: "Wallet connected",
        description: "Successfully connected to Ganache",
      })
    } catch (error) {
      toast({
        title: "Connection failed",
        description: "Failed to connect to Ganache. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsProcessing(false)
    }
  }

  // Simulate account selection
  const handleAccountSelect = (account: string) => {
    setSelectedAccount(account)

    // Simulate getting account balance
    const mockBalance = (Math.random() * 10).toFixed(4)
    setAccountBalance(mockBalance)

    setWalletAddress(account)

    toast({
      title: "Account selected",
      description: `Selected account with balance: ${mockBalance} ETH`,
    })
  }

  // Process crypto transaction
  const processCryptoTransaction = async () => {
    if (!ethAmount) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid ETH amount",
        variant: "destructive",
      })
      return
    }

    setTransactionStatus("pending")
    setIsProcessing(true)

    // Simulate transaction progress
    const interval = setInterval(() => {
      setTransactionProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval)
          return 100
        }
        return prev + 10
      })
    }, 500)

    try {
      // Define the parking owner address - in production this would come from environment variables
      const parkingOwnerAddress =
        process.env.NEXT_PUBLIC_PAYMENT_ADDRESS || "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199"

      let txHash = ""

      // If connected with MetaMask, use the connected account
      if (isConnected && account) {
        const result = await processCryptoPayment(ethAmount, parkingOwnerAddress)
        if (result.success && result.hash) {
          txHash = result.hash
        } else {
          throw new Error(result.error || "Transaction failed")
        }
      } else if (walletAddress && privateKey) {
        // Use Ganache account
        const result = await processGanachePayment(ethAmount, walletAddress, privateKey, parkingOwnerAddress)
        if (result.success && result.hash) {
          txHash = result.hash
        } else {
          throw new Error(result.error || "Transaction failed")
        }
      } else {
        // Simulate blockchain transaction for demo purposes
        await new Promise((resolve) => setTimeout(resolve, 5000))

        // Mock transaction hash
        txHash = "0x" + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join("")
      }

      setTransactionHash(txHash)
      setTransactionStatus("success")

      // Show success notification
      toast({
        title: "Transaction successful",
        description: "Your crypto payment has been processed successfully",
      })

      // Simulate notification
      setTimeout(() => {
        toast({
          title: "Reservation confirmed",
          description: "You will receive a notification before your reservation starts",
        })
      }, 2000)

      // Redirect to confirmation page after a delay
      setTimeout(() => {
        setIsSuccess(true)
      }, 3000)
    } catch (error: any) {
      setTransactionStatus("error")

      toast({
        title: "Transaction failed",
        description: error.message || "Failed to process crypto payment. Please try again.",
        variant: "destructive",
      })
    } finally {
      clearInterval(interval)
      setTransactionProgress(100)
      setIsProcessing(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (paymentMethod === "crypto") {
      processCryptoTransaction()
      return
    }

    // Basic validation for credit card
    if (paymentMethod === "credit-card") {
      if (!cardNumber || !cardName || !expiryMonth || !expiryYear || !cvv) {
        toast({
          title: "Missing information",
          description: "Please fill in all payment details",
          variant: "destructive",
        })
        return
      }

      if (cardNumber.length < 16) {
        toast({
          title: "Invalid card number",
          description: "Please enter a valid card number",
          variant: "destructive",
        })
        return
      }

      if (cvv.length < 3) {
        toast({
          title: "Invalid CVV",
          description: "Please enter a valid CVV code",
          variant: "destructive",
        })
        return
      }
    }

    // Process payment
    setIsProcessing(true)

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false)
      setIsSuccess(true)

      // Show success notification
      toast({
        title: "Payment successful",
        description: `Your parking spot ${spot} has been reserved`,
      })

      // Simulate notification
      setTimeout(() => {
        toast({
          title: "Reservation confirmed",
          description: `You will receive a notification before your reservation starts`,
        })
      }, 2000)

      // Redirect to confirmation page after a delay
      setTimeout(() => {
        router.push("/dashboard")
      }, 3000)
    }, 2000)
  }

  if (isSuccess) {
    return (
      <div className="max-w-md mx-auto mt-8">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-green-100 p-3">
                <CheckCircle2 className="h-8 w-8 text-green-600" />
              </div>
            </div>
            <CardTitle className="text-center">Payment Successful</CardTitle>
            <CardDescription className="text-center">Your parking reservation is confirmed</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{parkingLocation?.name}</p>
                  <p className="text-sm text-muted-foreground">{parkingLocation?.address}</p>
                  <p className="text-sm font-medium mt-1">Spot {spot}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{format(reservationDate, "EEEE, MMMM d, yyyy")}</p>
                  <p className="text-sm text-muted-foreground">Starting at {time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">
                    {duration} hour{Number.parseInt(duration) > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Total cost: {paymentMethod === "crypto" ? `${ethAmount} ETH` : `$${cost}`}
                  </p>
                </div>
              </div>

              {paymentMethod === "crypto" && transactionHash && (
                <div className="flex items-start gap-3">
                  <Wallet className="h-5 w-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-medium">Transaction Details</p>
                    <p className="text-sm text-muted-foreground break-all">
                      Hash: {transactionHash.substring(0, 18)}...{transactionHash.substring(transactionHash.length - 6)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <p className="text-sm text-center text-muted-foreground mb-2">
              You will receive a notification 30 minutes before your reservation starts.
            </p>
            <Button className="w-full" onClick={() => router.push("/dashboard")}>
              Return to Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Payment Details</CardTitle>
            <CardDescription>Complete your payment to reserve your parking spot</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="grid grid-cols-4 gap-4">
                <div>
                  <RadioGroupItem value="credit-card" id="credit-card" className="peer sr-only" />
                  <Label
                    htmlFor="credit-card"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <CreditCard className="mb-3 h-6 w-6" />
                    Card
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="paypal" id="paypal" className="peer sr-only" />
                  <Label
                    htmlFor="paypal"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg className="mb-3 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
                    PayPal
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="apple-pay" id="apple-pay" className="peer sr-only" />
                  <Label
                    htmlFor="apple-pay"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <svg className="mb-3 h-6 w-6" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path
                        d="M12.5 7.5C12.5 7.5 14 6 16 6C18 6 19.5 7.5 19.5 9.5C19.5 11.5 18 13 16 14.5L12 18.5L8 14.5C6 13 4.5 11.5 4.5 9.5C4.5 7.5 6 6 8 6C10 6 11.5 7.5 11.5 7.5"
                        stroke="currentColor"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                    Apple Pay
                  </Label>
                </div>
                <div>
                  <RadioGroupItem value="crypto" id="crypto" className="peer sr-only" />
                  <Label
                    htmlFor="crypto"
                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary"
                  >
                    <Wallet className="mb-3 h-6 w-6" />
                    Crypto
                  </Label>
                </div>
              </RadioGroup>

              {paymentMethod === "credit-card" && (
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="card-number">Card Number</Label>
                    <Input
                      id="card-number"
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value.replace(/\D/g, "").slice(0, 16))}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="card-name">Cardholder Name</Label>
                    <Input
                      id="card-name"
                      placeholder="John Doe"
                      value={cardName}
                      onChange={(e) => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="expiry-month">Month</Label>
                      <Select value={expiryMonth} onValueChange={setExpiryMonth}>
                        <SelectTrigger id="expiry-month">
                          <SelectValue placeholder="MM" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 12 }, (_, i) => {
                            const month = i + 1
                            return (
                              <SelectItem key={month} value={month.toString().padStart(2, "0")}>
                                {month.toString().padStart(2, "0")}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="expiry-year">Year</Label>
                      <Select value={expiryYear} onValueChange={setExpiryYear}>
                        <SelectTrigger id="expiry-year">
                          <SelectValue placeholder="YY" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: 10 }, (_, i) => {
                            const year = new Date().getFullYear() + i
                            return (
                              <SelectItem key={year} value={year.toString().slice(-2)}>
                                {year}
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="cvv">CVV</Label>
                      <Input
                        id="cvv"
                        placeholder="123"
                        value={cvv}
                        onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                      />
                    </div>
                  </div>
                </div>
              )}

              {paymentMethod === "paypal" && (
                <div className="bg-accent p-4 rounded-lg text-center">
                  <p className="mb-2">You will be redirected to PayPal to complete your payment.</p>
                  <p className="text-sm text-muted-foreground">Make sure you have your PayPal account details ready.</p>
                </div>
              )}

              {paymentMethod === "apple-pay" && (
                <div className="bg-accent p-4 rounded-lg text-center">
                  <p className="mb-2">You will complete your payment using Apple Pay.</p>
                  <p className="text-sm text-muted-foreground">Make sure you have Apple Pay set up on your device.</p>
                </div>
              )}

              {paymentMethod === "crypto" && (
                <div className="space-y-4">
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Cryptocurrency Payment</AlertTitle>
                    <AlertDescription>
                      Pay with Ethereum using Ganache. Current ETH/USD rate: ${ETH_TO_USD_RATE}
                    </AlertDescription>
                  </Alert>

                  <Tabs defaultValue={isWalletConnected ? "payment" : "connect"} className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                      <TabsTrigger value="connect" disabled={isWalletConnected}>
                        Connect Wallet
                      </TabsTrigger>
                      <TabsTrigger value="payment" disabled={!isWalletConnected}>
                        Make Payment
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="connect" className="space-y-4 py-4">
                      <div className="text-center">
                        <Wallet className="h-12 w-12 mx-auto mb-2 text-primary" />
                        <h3 className="text-lg font-medium mb-1">Connect to Ganache</h3>
                        <p className="text-sm text-muted-foreground mb-4">
                          Connect to your Ganache wallet to make a payment
                        </p>

                        <Button
                          onClick={connectToGanache}
                          disabled={isProcessing || isWalletConnected}
                          className="w-full"
                        >
                          {isProcessing ? "Connecting..." : "Connect to Ganache"}
                        </Button>
                      </div>

                      {!isConnected && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-medium mb-2">Enter Ganache Account Details</h4>
                          <div className="space-y-4">
                            <div className="space-y-2">
                              <Label htmlFor="ganache-address">Ganache Address</Label>
                              <Input
                                id="ganache-address"
                                placeholder="0x..."
                                value={walletAddress}
                                onChange={(e) => setWalletAddress(e.target.value)}
                              />
                            </div>
                            <div className="space-y-2">
                              <Label htmlFor="private-key">Private Key</Label>
                              <Input
                                id="private-key"
                                type="password"
                                placeholder="Enter your private key"
                                value={privateKey}
                                onChange={(e) => setPrivateKey(e.target.value)}
                              />
                              <p className="text-xs text-muted-foreground">
                                Your private key is never stored and only used to sign this transaction.
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {ganacheAccounts.length > 0 && (
                        <div className="mt-4 border-t pt-4">
                          <h4 className="font-medium mb-2">Select Account</h4>
                          <div className="space-y-2">
                            {ganacheAccounts.map((account) => (
                              <div
                                key={account}
                                className={`p-3 border rounded-md cursor-pointer hover:bg-accent transition-colors ${
                                  selectedAccount === account ? "border-primary bg-primary/10" : ""
                                }`}
                                onClick={() => handleAccountSelect(account)}
                              >
                                <div className="flex justify-between items-center">
                                  <div className="truncate flex-1">
                                    <p className="font-mono text-sm truncate">{account}</p>
                                  </div>
                                  {selectedAccount === account && (
                                    <CheckCircle2 className="h-4 w-4 text-primary ml-2 flex-shrink-0" />
                                  )}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </TabsContent>

                    <TabsContent value="payment" className="space-y-4 py-4">
                      {isConnected && (
                        <div className="bg-accent p-3 rounded-md mb-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">Connected Wallet</p>
                              <p className="text-xs font-mono truncate">{account}</p>
                            </div>
                            <div className="text-right">
                              <p className="text-sm font-medium">Balance</p>
                              <p className="text-xs">{Number.parseFloat(walletBalance || "0").toFixed(4)} ETH</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {walletAddress && !isConnected && (
                        <div className="bg-accent p-3 rounded-md mb-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <p className="text-sm font-medium">Ganache Address</p>
                              <p className="text-xs font-mono truncate">{walletAddress}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="eth-amount">Amount (ETH)</Label>
                          <div className="relative">
                            <Input
                              id="eth-amount"
                              value={ethAmount}
                              onChange={(e) => setEthAmount(e.target.value)}
                              className="pr-16"
                            />
                            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                              <span className="text-sm text-muted-foreground">ETH</span>
                            </div>
                          </div>
                          <p className="text-xs text-muted-foreground">Equivalent to ${costValue.toFixed(2)} USD</p>
                        </div>

                        {transactionStatus === "pending" && (
                          <div className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span>Transaction in progress</span>
                              <span>{transactionProgress}%</span>
                            </div>
                            <Progress value={transactionProgress} className="h-2" />
                          </div>
                        )}

                        {transactionStatus === "success" && transactionHash && (
                          <Alert className="bg-green-50 border-green-200">
                            <CheckCircle2 className="h-4 w-4 text-green-600" />
                            <AlertTitle className="text-green-800">Transaction Successful</AlertTitle>
                            <AlertDescription className="text-green-700">
                              <p className="text-xs font-mono break-all mt-1">Transaction Hash: {transactionHash}</p>
                            </AlertDescription>
                          </Alert>
                        )}

                        {transactionStatus === "error" && (
                          <Alert variant="destructive">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle>Transaction Failed</AlertTitle>
                            <AlertDescription>
                              There was an error processing your transaction. Please try again.
                            </AlertDescription>
                          </Alert>
                        )}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isProcessing || (paymentMethod === "crypto" && !isWalletConnected && !walletAddress)}
              >
                {isProcessing ? "Processing..." : paymentMethod === "crypto" ? `Pay ${ethAmount} ETH` : `Pay $${cost}`}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Reservation Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-accent p-4 rounded-lg space-y-3">
              <div className="flex items-start gap-3">
                <MapPin className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{parkingLocation?.name}</p>
                  <p className="text-sm text-muted-foreground">{parkingLocation?.address}</p>
                  <p className="text-sm font-medium mt-1">Spot {spot}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">{format(reservationDate, "EEEE, MMMM d, yyyy")}</p>
                  <p className="text-sm text-muted-foreground">Starting at {time}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-primary mt-0.5" />
                <div>
                  <p className="font-medium">
                    {duration} hour{Number.parseInt(duration) > 1 ? "s" : ""}
                  </p>
                  <p className="text-sm text-muted-foreground">Total cost: ${cost}</p>
                </div>
              </div>
            </div>
            <div className="border-t pt-4">
              <div className="flex justify-between mb-2">
                <span className="text-sm">Subtotal</span>
                <span>${cost}</span>
              </div>
              <div className="flex justify-between mb-2">
                <span className="text-sm">Service fee</span>
                <span>$0.00</span>
              </div>
              <div className="flex justify-between font-medium">
                <span>Total</span>
                <span>${cost}</span>
              </div>

              {paymentMethod === "crypto" && (
                <div className="flex justify-between mt-2 pt-2 border-t">
                  <span className="text-sm">ETH Equivalent</span>
                  <span className="font-medium">{ethAmount} ETH</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {paymentMethod === "crypto" && (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base">About Crypto Payments</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <p>
                  Pay for your parking reservation using cryptocurrency. We currently support Ethereum payments through
                  Ganache, a personal blockchain for Ethereum development.
                </p>
                <div className="flex items-center gap-2 border-l-4 border-blue-400 pl-3 py-1 bg-blue-50 text-blue-800">
                  <AlertCircle className="h-4 w-4" />
                  <p className="text-xs">Transactions may take a few moments to process on the blockchain.</p>
                </div>
                <p>To make a payment:</p>
                <ol className="list-decimal list-inside space-y-1 pl-2">
                  <li>Connect your wallet or enter your Ganache address</li>
                  <li>Confirm the ETH amount (automatically calculated based on current rates)</li>
                  <li>Submit your transaction</li>
                </ol>
                <p className="flex items-center gap-1 text-xs text-muted-foreground">
                  <ExternalLink className="h-3 w-3" />
                  <a
                    href="https://trufflesuite.com/ganache/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline"
                  >
                    Learn more about Ganache
                  </a>
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {searchParams.get("txHash") && (
          <div className="bg-green-50 p-4 rounded-lg border border-green-200 mt-4">
            <h4 className="text-green-800 font-medium flex items-center gap-2 mb-1">
              <CheckCircle2 className="h-4 w-4" />
              Blockchain Transaction Confirmed
            </h4>
            <p className="text-sm text-green-700">Your reservation has been recorded on the blockchain.</p>
            <p className="text-xs font-mono break-all mt-1">Transaction Hash: {searchParams.get("txHash")}</p>
            {searchParams.get("reservationId") && (
              <p className="text-xs font-mono break-all mt-1">Reservation ID: {searchParams.get("reservationId")}</p>
            )}
          </div>
        )}

        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Reservation Policy</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Free cancellation up to 1 hour before reservation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Automatic notifications 30 minutes before reservation</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Automatic release when time period is over</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-primary mt-0.5" />
                <span>Penalty for overstaying without extending reservation</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


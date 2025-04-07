"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { CalendarIcon, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import useBlockchainIntegration from "@/components/blockchain-integration"

// Mock parking data
const PARKING_LOCATIONS = {
  "1": {
    id: 1,
    name: "Downtown Parking",
    address: "123 Main St",
    spots: [
      { id: "A1", status: "available" },
      { id: "A2", status: "available" },
      { id: "A3", status: "occupied" },
      { id: "A4", status: "available" },
      { id: "A5", status: "reserved" },
      { id: "B1", status: "available" },
      { id: "B2", status: "occupied" },
      { id: "B3", status: "available" },
      { id: "B4", status: "available" },
      { id: "B5", status: "occupied" },
      { id: "C1", status: "reserved" },
      { id: "C2", status: "available" },
      { id: "C3", status: "available" },
      { id: "C4", status: "occupied" },
      { id: "C5", status: "available" },
    ],
    hourlyRate: 5.99,
  },
  "2": {
    id: 2,
    name: "City Center Garage",
    address: "456 Park Ave",
    spots: [
      { id: "P1", status: "available" },
      { id: "P2", status: "available" },
      { id: "P3", status: "occupied" },
      { id: "P4", status: "available" },
      { id: "P5", status: "reserved" },
      { id: "P6", status: "available" },
      { id: "P7", status: "occupied" },
      { id: "P8", status: "available" },
      { id: "P9", status: "available" },
      { id: "P10", status: "occupied" },
      { id: "P11", status: "reserved" },
      { id: "P12", status: "available" },
    ],
    hourlyRate: 7.99,
  },
  "3": {
    id: 3,
    name: "Riverside Parking",
    address: "789 River Rd",
    spots: [
      { id: "R1", status: "available" },
      { id: "R2", status: "available" },
      { id: "R3", status: "occupied" },
      { id: "R4", status: "available" },
      { id: "R5", status: "reserved" },
      { id: "R6", status: "available" },
      { id: "R7", status: "occupied" },
      { id: "R8", status: "available" },
    ],
    hourlyRate: 4.99,
  },
}

const TIME_SLOTS = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
  "07:00 PM",
  "08:00 PM",
  "09:00 PM",
  "10:00 PM",
]

const DURATION_OPTIONS = [
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
  { value: "3", label: "3 hours" },
  { value: "4", label: "4 hours" },
  { value: "5", label: "5 hours" },
  { value: "6", label: "6 hours" },
  { value: "12", label: "12 hours" },
  { value: "24", label: "24 hours" },
]

export default function SpotSelection({ parkingId }: { parkingId: string }) {
  const router = useRouter()
  const { toast } = useToast()
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [startTime, setStartTime] = useState<string>(TIME_SLOTS[0])
  const [duration, setDuration] = useState<string>("2")
  const [selectedSpot, setSelectedSpot] = useState<string | null>(null)

  const {
    isConnected,
    isLoading: blockchainLoading,
    connectWallet,
    getAvailableSpots,
    createReservation,
  } = useBlockchainIntegration()

  const parkingLocation = PARKING_LOCATIONS[parkingId as keyof typeof PARKING_LOCATIONS]

  useEffect(() => {
    const loadBlockchainSpots = async () => {
      if (isConnected) {
        const result = await getAvailableSpots(parkingId)
        if (result.success && result.spots) {
          // You could use this data to update your UI
          console.log("Available spots from blockchain:", result.spots)
        }
      }
    }

    loadBlockchainSpots()
  }, [isConnected, parkingId, getAvailableSpots])

  if (!parkingLocation) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <MapPin className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Parking Location Not Found</h2>
        <p className="text-center text-muted-foreground mb-4 max-w-md">
          The parking location you're looking for doesn't exist or has been removed.
        </p>
        <Button onClick={() => router.push("/dashboard")}>Back to Dashboard</Button>
      </div>
    )
  }

  const handleSpotSelect = (spotId: string) => {
    setSelectedSpot(spotId)
  }

  const handleReserve = async () => {
    if (!selectedSpot || !date || !startTime || !duration) {
      toast({
        title: "Incomplete selection",
        description: "Please select a spot, date, time, and duration",
        variant: "destructive",
      })
      return
    }

    // Calculate total cost
    const hours = Number.parseInt(duration)
    const totalCost = hours * parkingLocation.hourlyRate

    if (isConnected) {
      // Parse the start time
      const [hourStr, minuteStr, period] = startTime.split(/:|\s/)
      let hour = Number.parseInt(hourStr)
      const minute = Number.parseInt(minuteStr)

      // Convert to 24-hour format
      if (period === "PM" && hour < 12) hour += 12
      if (period === "AM" && hour === 12) hour = 0

      // Create a Date object with the selected date and time
      const reservationDate = new Date(date)
      reservationDate.setHours(hour, minute, 0, 0)

      // Create reservation on blockchain
      const result = await createReservation(
        parkingId,
        selectedSpot,
        reservationDate,
        hours,
        "crypto", // You might want to make this dynamic based on user selection
      )

      if (result.success) {
        toast({
          title: "Reservation created",
          description: `Your reservation for spot ${selectedSpot} has been confirmed on the blockchain`,
        })

        // Navigate to payment page with blockchain transaction details
        router.push(
          `/payment?parkingId=${parkingId}&spot=${selectedSpot}&date=${date.toISOString()}&time=${encodeURIComponent(startTime)}&duration=${duration}&cost=${totalCost.toFixed(2)}&txHash=${result.txHash}&reservationId=${result.reservationId}`,
        )
      }
    } else {
      // Fallback to the original implementation
      router.push(
        `/payment?parkingId=${parkingId}&spot=${selectedSpot}&date=${date.toISOString()}&time=${encodeURIComponent(startTime)}&duration=${duration}&cost=${totalCost.toFixed(2)}`,
      )
    }
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-2 space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{parkingLocation.name}</CardTitle>
            <CardDescription>
              <div className="flex items-center gap-1">
                <MapPin className="h-4 w-4 text-muted-foreground" />
                <span>{parkingLocation.address}</span>
              </div>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-accent p-6 rounded-lg">
              <h3 className="text-lg font-medium mb-4">Select a Parking Spot</h3>
              <div className="grid grid-cols-5 gap-3">
                {parkingLocation.spots.map((spot) => (
                  <button
                    key={spot.id}
                    className={`
                      h-12 rounded-md flex items-center justify-center font-medium text-sm
                      ${
                        spot.status === "available"
                          ? selectedSpot === spot.id
                            ? "bg-primary text-primary-foreground"
                            : "bg-background hover:bg-primary/20 border border-border"
                          : spot.status === "occupied"
                            ? "bg-destructive/20 text-destructive cursor-not-allowed"
                            : "bg-yellow-100 text-yellow-800 cursor-not-allowed"
                      }
                    `}
                    disabled={spot.status !== "available"}
                    onClick={() => handleSpotSelect(spot.id)}
                  >
                    {spot.id}
                  </button>
                ))}
              </div>
              <div className="flex items-center justify-center gap-6 mt-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-background border border-border rounded-sm"></div>
                  <span className="text-sm">Available</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded-sm"></div>
                  <span className="text-sm">Selected</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive/20 rounded-sm"></div>
                  <span className="text-sm">Occupied</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-yellow-100 rounded-sm"></div>
                  <span className="text-sm">Reserved</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Parking Map</CardTitle>
            <CardDescription>View the layout of the parking facility</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="bg-accent rounded-lg overflow-hidden">
              {/* This would be replaced with an actual parking map */}
              <div className="h-[300px] bg-[url('/placeholder.svg?height=300&width=600')] bg-cover bg-center relative">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
                    <p className="text-center">Interactive Parking Map</p>
                    <p className="text-xs text-muted-foreground text-center">Navigate to your reserved spot easily</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Reservation Details</CardTitle>
            <CardDescription>Select date, time and duration</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start text-left font-normal">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {date ? format(date, "PPP") : "Select date"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={date}
                      onSelect={setDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                    />
                  </PopoverContent>
                </Popover>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Start Time</label>
                <Select value={startTime} onValueChange={setStartTime}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select start time" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIME_SLOTS.map((time) => (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Duration</label>
                <Select value={duration} onValueChange={setDuration}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    {DURATION_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex-col items-stretch gap-4">
            <div className="bg-accent p-4 rounded-lg space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Spot</span>
                <span className="font-medium">{selectedSpot || "Not selected"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Rate</span>
                <span className="font-medium">${parkingLocation.hourlyRate.toFixed(2)}/hour</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Duration</span>
                <span className="font-medium">{duration} hours</span>
              </div>
              <div className="border-t pt-2 mt-2">
                <div className="flex justify-between font-medium">
                  <span>Total</span>
                  <span>${(Number.parseInt(duration) * parkingLocation.hourlyRate).toFixed(2)}</span>
                </div>
              </div>
            </div>
            {!isConnected ? (
              <Button onClick={connectWallet} className="w-full" disabled={blockchainLoading}>
                {blockchainLoading ? "Connecting..." : "Connect Wallet to Reserve"}
              </Button>
            ) : (
              <Button className="w-full" disabled={!selectedSpot} onClick={handleReserve}>
                Reserve Spot
              </Button>
            )}
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base">Parking Information</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>Operating hours: 6:00 AM - 11:00 PM</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>Maximum stay: 24 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <Clock className="h-4 w-4 text-muted-foreground mt-0.5" />
                <span>Cancellation: Free up to 1 hour before</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


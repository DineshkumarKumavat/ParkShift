"use client"

import { Label } from "@/components/ui/label"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { format, addHours, isPast, isToday, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay } from "date-fns"
import {
  CalendarIcon,
  Clock,
  MapPin,
  MoreHorizontal,
  Navigation,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Car,
  ChevronLeft,
  ChevronRight,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"

// Import the NavigationModal component
import NavigationModal from "@/components/navigation-modal"
import ParkingSpotView from "@/components/parking-spot-view"

// Add this import at the top of the file
import useBlockchainIntegration from "@/components/blockchain-integration"

// Mock reservation data
const MOCK_RESERVATIONS = [
  {
    id: "res-001",
    parkingId: 1,
    parkingName: "Downtown Parking",
    parkingAddress: "123 Main St",
    spot: "A4",
    startDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24), // Tomorrow
    startTime: "10:00 AM",
    duration: 2,
    cost: 11.98,
    status: "upcoming",
  },
  {
    id: "res-002",
    parkingId: 2,
    parkingName: "City Center Garage",
    parkingAddress: "456 Park Ave",
    spot: "P8",
    startDate: new Date(), // Today
    startTime: "02:00 PM",
    duration: 3,
    cost: 23.97,
    status: "active",
  },
  {
    id: "res-003",
    parkingId: 3,
    parkingName: "Riverside Parking",
    parkingAddress: "789 River Rd",
    spot: "R2",
    startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
    startTime: "09:00 AM",
    duration: 4,
    cost: 19.96,
    status: "completed",
  },
  {
    id: "res-004",
    parkingId: 1,
    parkingName: "Downtown Parking",
    parkingAddress: "123 Main St",
    spot: "A1",
    startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 7), // 7 days ago
    startTime: "11:00 AM",
    duration: 2,
    cost: 11.98,
    status: "completed",
  },
  {
    id: "res-005",
    parkingId: 2,
    parkingName: "City Center Garage",
    parkingAddress: "456 Park Ave",
    spot: "P3",
    startDate: new Date(new Date().getTime() + 1000 * 60 * 60 * 24 * 3), // 3 days from now
    startTime: "04:00 PM",
    duration: 5,
    cost: 39.95,
    status: "upcoming",
  },
  {
    id: "res-006",
    parkingId: 3,
    parkingName: "Riverside Parking",
    parkingAddress: "789 River Rd",
    spot: "R5",
    startDate: new Date(new Date().getTime() - 1000 * 60 * 60 * 24 * 14), // 14 days ago
    startTime: "10:30 AM",
    duration: 6,
    cost: 29.94,
    status: "cancelled",
  },
]

// Duration options for extending reservation
const DURATION_OPTIONS = [
  { value: "1", label: "1 hour" },
  { value: "2", label: "2 hours" },
  { value: "3", label: "3 hours" },
  { value: "4", label: "4 hours" },
]

export default function ReservationsList() {
  const router = useRouter()
  const { toast } = useToast()

  // Inside your ReservationsList component, add this near the top
  const {
    isConnected,
    isLoading: blockchainLoading,
    connectWallet,
    getUserReservations,
    cancelReservation,
    extendReservation,
  } = useBlockchainIntegration()

  const [reservations, setReservations] = useState(MOCK_RESERVATIONS)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const [sortOrder, setSortOrder] = useState("newest")
  const [selectedReservation, setSelectedReservation] = useState<any>(null)
  const [extendDuration, setExtendDuration] = useState("1")
  const [isExtendDialogOpen, setIsExtendDialogOpen] = useState(false)
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false)

  // Add state for the navigation modal
  const [isNavigationModalOpen, setIsNavigationModalOpen] = useState(false)
  const [selectedForNavigation, setSelectedForNavigation] = useState<any>(null)

  // Add state for the parking spot view
  const [isParkingSpotViewOpen, setIsParkingSpotViewOpen] = useState(false)

  // Calendar view states
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  // Add state for the in-app navigation
  const [isInAppNavigationOpen, setIsInAppNavigationOpen] = useState(false)

  // Add this useEffect to load blockchain reservations when connected
  useEffect(() => {
    const loadBlockchainReservations = async () => {
      if (isConnected) {
        const result = await getUserReservations()
        if (result.success && result.reservations) {
          // Merge blockchain reservations with mock data or replace entirely
          // This is just an example - you might want to handle this differently
          setReservations((prevReservations) => {
            // Convert blockchain reservations to your app's format
            const blockchainReservations = result.reservations.map((res) => ({
              id: res.id,
              parkingId: Number.parseInt(res.locationId),
              parkingName: getParkingNameById(Number.parseInt(res.locationId)),
              parkingAddress: getParkingAddressById(Number.parseInt(res.locationId)),
              spot: res.spotId,
              startDate: res.startTime,
              startTime: formatTime(res.startTime),
              duration: calculateDurationInHours(res.startTime, res.endTime),
              cost: Number.parseFloat(res.totalCost) * 2500, // Convert ETH to USD (assuming 1 ETH = $2500)
              status: res.status,
            }))

            return [...blockchainReservations]
          })
        }
      }
    }

    loadBlockchainReservations()
  }, [isConnected, getUserReservations])

  // Add these helper functions
  const getParkingNameById = (id: number) => {
    const locationMap: Record<number, string> = {
      1: "Downtown Parking",
      2: "City Center Garage",
      3: "Riverside Parking",
    }
    return locationMap[id] || `Parking Location ${id}`
  }

  const getParkingAddressById = (id: number) => {
    const addressMap: Record<number, string> = {
      1: "123 Main St",
      2: "456 Park Ave",
      3: "789 River Rd",
    }
    return addressMap[id] || "Unknown Address"
  }

  const formatTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const hour = hours % 12 || 12
    return `${hour}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }

  const calculateDurationInHours = (start: Date, end: Date) => {
    const diffMs = end.getTime() - start.getTime()
    return Math.round(diffMs / (1000 * 60 * 60))
  }

  // Filter and sort reservations
  const filteredReservations = reservations
    .filter((reservation) => {
      // Apply search filter
      const searchLower = searchQuery.toLowerCase()
      const matchesSearch =
        reservation.parkingName.toLowerCase().includes(searchLower) ||
        reservation.spot.toLowerCase().includes(searchLower) ||
        reservation.id.toLowerCase().includes(searchLower)

      // Apply status filter
      const matchesStatus =
        filterStatus === "all" ||
        (filterStatus === "active" &&
          (reservation.status === "active" || (reservation.status === "upcoming" && isToday(reservation.startDate)))) ||
        filterStatus === reservation.status

      // Apply date filter for calendar view
      const matchesDate = !selectedDate || isSameDay(reservation.startDate, selectedDate)

      return matchesSearch && matchesStatus && (selectedDate ? matchesDate : true)
    })
    .sort((a, b) => {
      // Apply sorting
      if (sortOrder === "newest") {
        return b.startDate.getTime() - a.startDate.getTime()
      } else if (sortOrder === "oldest") {
        return a.startDate.getTime() - b.startDate.getTime()
      } else if (sortOrder === "price-high") {
        return b.cost - a.cost
      } else if (sortOrder === "price-low") {
        return a.cost - b.cost
      }
      return 0
    })

  // Update the handleCancelReservation function
  const handleCancelReservation = async () => {
    if (!selectedReservation) return

    if (isConnected) {
      // Use blockchain cancellation
      const result = await cancelReservation(selectedReservation.id)
      if (result.success) {
        // Update reservation status
        setReservations((prev) =>
          prev.map((res) => (res.id === selectedReservation.id ? { ...res, status: "cancelled" } : res)),
        )

        // Show success notification
        toast({
          title: "Reservation cancelled",
          description: `Your reservation for ${selectedReservation.parkingName} has been cancelled.`,
        })
      }
    } else {
      // Fallback to mock implementation
      // Update reservation status
      setReservations((prev) =>
        prev.map((res) => (res.id === selectedReservation.id ? { ...res, status: "cancelled" } : res)),
      )

      // Show success notification
      toast({
        title: "Reservation cancelled",
        description: `Your reservation for ${selectedReservation.parkingName} has been cancelled.`,
      })
    }

    setIsCancelDialogOpen(false)
  }

  // Update the handleExtendReservation function
  const handleExtendReservation = async () => {
    if (!selectedReservation) return

    const additionalHours = Number.parseInt(extendDuration)

    if (isConnected) {
      // Use blockchain extension
      const result = await extendReservation(
        selectedReservation.id,
        additionalHours,
        "crypto", // You might want to make this dynamic based on user selection
      )

      if (result.success) {
        const additionalCost = Number.parseFloat(result.additionalCost || "0") * 2500 // Convert ETH to USD

        // Update reservation
        setReservations((prev) =>
          prev.map((res) =>
            res.id === selectedReservation.id
              ? {
                  ...res,
                  duration: res.duration + additionalHours,
                  cost: res.cost + additionalCost,
                }
              : res,
          ),
        )

        // Show success notification
        toast({
          title: "Reservation extended",
          description: `Your reservation has been extended by ${additionalHours} hour${additionalHours > 1 ? "s" : ""}.`,
        })
      }
    } else {
      // Fallback to mock implementation
      const additionalCost = additionalHours * (selectedReservation.cost / selectedReservation.duration)

      // Update reservation
      setReservations((prev) =>
        prev.map((res) =>
          res.id === selectedReservation.id
            ? {
                ...res,
                duration: res.duration + additionalHours,
                cost: res.cost + additionalCost,
              }
            : res,
        ),
      )

      // Show success notification
      toast({
        title: "Reservation extended",
        description: `Your reservation has been extended by ${additionalHours} hour${additionalHours > 1 ? "s" : ""}.`,
      })
    }

    setIsExtendDialogOpen(false)
  }

  // Update the handleNavigateToSpot function to use the new in-app navigation
  const handleNavigateToSpot = (reservation: any) => {
    setSelectedForNavigation(reservation)
    setIsNavigationModalOpen(true)
  }

  // Update the handleViewParkingSpot function to use the new in-app navigation
  const handleViewParkingSpot = (reservation: any) => {
    setSelectedForNavigation(reservation)
    setIsParkingSpotViewOpen(true)
  }

  const getStatusBadge = (status: string, startDate: Date) => {
    if (
      status === "active" ||
      (status === "upcoming" &&
        isToday(startDate) &&
        !isPast(new Date(`${format(startDate, "yyyy-MM-dd")} ${startTime(startDate)}`).getTime() + 1000 * 60 * 60 * 2))
    ) {
      return <Badge className="bg-green-500">Active</Badge>
    } else if (status === "upcoming") {
      return (
        <Badge variant="outline" className="border-blue-500 text-blue-500">
          Upcoming
        </Badge>
      )
    } else if (status === "completed") {
      return <Badge variant="secondary">Completed</Badge>
    } else if (status === "cancelled") {
      return <Badge variant="destructive">Cancelled</Badge>
    }
    return null
  }

  const startTime = (date: Date) => {
    const hours = date.getHours()
    const minutes = date.getMinutes()
    const ampm = hours >= 12 ? "PM" : "AM"
    const hour = hours % 12 || 12
    return `${hour}:${minutes.toString().padStart(2, "0")} ${ampm}`
  }

  const canCancel = (reservation: any) => {
    return (
      (reservation.status === "upcoming" || reservation.status === "active") &&
      !isPast(
        new Date(`${format(reservation.startDate, "yyyy-MM-dd")} ${reservation.startTime}`).getTime() +
          1000 * 60 * 60 * reservation.duration,
      )
    )
  }

  const canExtend = (reservation: any) => {
    return reservation.status === "active" || (reservation.status === "upcoming" && isToday(reservation.startDate))
  }

  // Calendar navigation functions
  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
  }

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
  }

  // Get days in current month
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  })

  // Get reservations for a specific day
  const getReservationsForDay = (day: Date) => {
    return reservations.filter((res) => isSameDay(res.startDate, day))
  }

  return (
    <div className="max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">My Reservations</h1>
          {!isConnected && (
            <Button onClick={connectWallet} disabled={blockchainLoading}>
              {blockchainLoading ? "Connecting..." : "Connect Wallet"}
            </Button>
          )}
          <p className="text-muted-foreground">View and manage your parking reservations</p>
        </div>
        <Button onClick={() => router.push("/dashboard")}>Find New Parking</Button>
      </div>

      <div className="bg-background rounded-lg border shadow-sm mb-6">
        <div className="p-4 flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search reservations..."
              className="pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <Select value={filterStatus} onValueChange={setFilterStatus}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Status</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortOrder} onValueChange={setSortOrder}>
              <SelectTrigger className="w-[130px]">
                <Filter className="mr-2 h-4 w-4" />
                <span>Sort</span>
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest first</SelectItem>
                <SelectItem value="oldest">Oldest first</SelectItem>
                <SelectItem value="price-high">Price: High to low</SelectItem>
                <SelectItem value="price-low">Price: Low to high</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <Tabs defaultValue="list" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-6">
          <TabsTrigger value="list">List View</TabsTrigger>
          <TabsTrigger value="calendar">Calendar View</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          {filteredReservations.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-10">
                <Car className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No reservations found</h3>
                <p className="text-muted-foreground text-center max-w-md mb-6">
                  {searchQuery || filterStatus !== "all"
                    ? "Try adjusting your search or filters to find what you're looking for."
                    : "You don't have any parking reservations yet. Start by finding a parking spot."}
                </p>
                <Button onClick={() => router.push("/dashboard")}>Find Parking</Button>
              </CardContent>
            </Card>
          ) : (
            filteredReservations.map((reservation) => (
              <Card key={reservation.id} className="overflow-hidden">
                <div className="flex flex-col md:flex-row">
                  <div className="flex-1 p-6">
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-medium">{reservation.parkingName}</h3>
                          {getStatusBadge(reservation.status, reservation.startDate)}
                        </div>
                        <p className="text-sm text-muted-foreground mb-4">
                          Spot {reservation.spot} • Reservation #{reservation.id}
                        </p>
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Actions</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem
                            onClick={() => {
                              setSelectedReservation(reservation)
                              setIsExtendDialogOpen(true)
                            }}
                            disabled={!canExtend(reservation)}
                          >
                            <Clock className="mr-2 h-4 w-4" />
                            Extend Reservation
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleNavigateToSpot(reservation)}
                            disabled={reservation.status !== "active"}
                          >
                            <Navigation className="mr-2 h-4 w-4" />
                            Navigate to Spot
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleViewParkingSpot(reservation)}>
                            <MapPin className="mr-2 h-4 w-4" />
                            View Parking Spot
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => {
                              setSelectedReservation(reservation)
                              setIsCancelDialogOpen(true)
                            }}
                            disabled={!canCancel(reservation)}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancel Reservation
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">{reservation.parkingAddress}</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <CalendarIcon className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Date & Time</p>
                          <p className="text-sm text-muted-foreground">
                            {format(reservation.startDate, "MMM d, yyyy")} • {reservation.startTime}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-start gap-2">
                        <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Duration & Cost</p>
                          <p className="text-sm text-muted-foreground">
                            {reservation.duration} hour{reservation.duration > 1 ? "s" : ""} • $
                            {reservation.cost.toFixed(2)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="bg-accent p-6 flex flex-col justify-between md:w-64">
                    <div className="space-y-4">
                      <div className="text-center">
                        <p className="text-sm font-medium">Reservation Status</p>
                        <div className="mt-2 flex items-center justify-center">
                          {reservation.status === "active" ||
                          (reservation.status === "upcoming" && isToday(reservation.startDate)) ? (
                            <div className="flex items-center text-green-600">
                              <CheckCircle2 className="mr-1 h-5 w-5" />
                              <span>Active</span>
                            </div>
                          ) : reservation.status === "upcoming" ? (
                            <div className="flex items-center text-blue-600">
                              <Clock className="mr-1 h-5 w-5" />
                              <span>Upcoming</span>
                            </div>
                          ) : reservation.status === "completed" ? (
                            <div className="flex items-center text-muted-foreground">
                              <CheckCircle2 className="mr-1 h-5 w-5" />
                              <span>Completed</span>
                            </div>
                          ) : (
                            <div className="flex items-center text-destructive">
                              <XCircle className="mr-1 h-5 w-5" />
                              <span>Cancelled</span>
                            </div>
                          )}
                        </div>
                      </div>
                      {(reservation.status === "active" ||
                        (reservation.status === "upcoming" && isToday(reservation.startDate))) && (
                        <div className="text-center">
                          <p className="text-sm font-medium">Time Remaining</p>
                          <p className="text-2xl font-bold mt-1">1h 23m</p>
                        </div>
                      )}
                    </div>
                    <div className="mt-4 space-y-2">
                      {canExtend(reservation) && (
                        <Button
                          className="w-full"
                          variant="outline"
                          onClick={() => {
                            setSelectedReservation(reservation)
                            setIsExtendDialogOpen(true)
                          }}
                        >
                          Extend Time
                        </Button>
                      )}
                      {reservation.status === "active" && (
                        <Button className="w-full" onClick={() => handleNavigateToSpot(reservation)}>
                          Navigate
                        </Button>
                      )}
                      <Button className="w-full" variant="outline" onClick={() => handleViewParkingSpot(reservation)}>
                        View Parking Spot
                      </Button>
                      {canCancel(reservation) && (
                        <Button
                          className="w-full"
                          variant="destructive"
                          onClick={() => {
                            setSelectedReservation(reservation)
                            setIsCancelDialogOpen(true)
                          }}
                        >
                          Cancel
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="calendar">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle>Calendar View</CardTitle>
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={prevMonth}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <h2 className="text-lg font-medium">{format(currentMonth, "MMMM yyyy")}</h2>
                <Button variant="outline" size="icon" onClick={nextMonth}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-7 gap-1 mb-2">
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
                  <div key={day} className="text-center font-medium text-sm py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: startOfMonth(currentMonth).getDay() }).map((_, index) => (
                  <div key={`empty-start-${index}`} className="h-24 p-1 border rounded-md bg-muted/20"></div>
                ))}

                {daysInMonth.map((day) => {
                  const dayReservations = getReservationsForDay(day)
                  const isSelected = selectedDate && isSameDay(day, selectedDate)
                  const isToday = isSameDay(day, new Date())

                  return (
                    <div
                      key={day.toString()}
                      className={`h-24 p-1 border rounded-md overflow-hidden transition-colors cursor-pointer
                        ${isSelected ? "border-primary bg-primary/10" : ""}
                        ${isToday ? "bg-accent" : ""}
                      `}
                      onClick={() => setSelectedDate(isSameDay(day, selectedDate) ? null : day)}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className={`text-sm font-medium ${isToday ? "text-primary" : ""}`}>
                          {format(day, "d")}
                        </span>
                        {dayReservations.length > 0 && (
                          <Badge variant="outline" className="text-xs">
                            {dayReservations.length}
                          </Badge>
                        )}
                      </div>
                      <div className="space-y-1 overflow-hidden">
                        {dayReservations.slice(0, 2).map((res) => (
                          <div
                            key={res.id}
                            className={`text-xs p-1 rounded truncate
                              ${res.status === "active" ? "bg-green-100 text-green-800" : ""}
                              ${res.status === "upcoming" ? "bg-blue-100 text-blue-800" : ""}
                              ${res.status === "completed" ? "bg-gray-100 text-gray-800" : ""}
                              ${res.status === "cancelled" ? "bg-red-100 text-red-800" : ""}
                            `}
                          >
                            {res.startTime} - {res.parkingName}
                          </div>
                        ))}
                        {dayReservations.length > 2 && (
                          <div className="text-xs text-muted-foreground text-center">
                            +{dayReservations.length - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}

                {Array.from({ length: (7 - (endOfMonth(currentMonth).getDay() + 1)) % 7 }).map((_, index) => (
                  <div key={`empty-end-${index}`} className="h-24 p-1 border rounded-md bg-muted/20"></div>
                ))}
              </div>

              {selectedDate && (
                <div className="mt-6 border-t pt-4">
                  <h3 className="font-medium mb-3">Reservations for {format(selectedDate, "MMMM d, yyyy")}</h3>
                  <div className="space-y-2">
                    {getReservationsForDay(selectedDate).length > 0 ? (
                      getReservationsForDay(selectedDate).map((res) => (
                        <div key={res.id} className="flex justify-between items-center p-3 border rounded-md">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="font-medium">{res.parkingName}</span>
                              {getStatusBadge(res.status, res.startDate)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {res.startTime} • {res.duration} hour{res.duration > 1 ? "s" : ""} • Spot {res.spot}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            {res.status === "active" && (
                              <Button size="sm" onClick={() => handleNavigateToSpot(res)}>
                                Navigate
                              </Button>
                            )}
                            <Button size="sm" variant="outline" onClick={() => handleViewParkingSpot(res)}>
                              View Spot
                            </Button>
                          </div>
                        </div>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-center py-4">No reservations for this date.</p>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Extend Reservation Dialog */}
      <Dialog open={isExtendDialogOpen} onOpenChange={setIsExtendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Extend Reservation</DialogTitle>
            <DialogDescription>Add more time to your current reservation.</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <>
              <div className="space-y-4 py-2">
                <div className="bg-accent p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">Current Duration</span>
                    <span className="font-medium">{selectedReservation.duration} hours</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Current End Time</span>
                    <span className="font-medium">
                      {format(
                        addHours(
                          new Date(
                            `${format(selectedReservation.startDate, "yyyy-MM-dd")} ${selectedReservation.startTime}`,
                          ),
                          selectedReservation.duration,
                        ),
                        "h:mm a",
                      )}
                    </span>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="extend-duration">Additional Time</Label>
                  <Select value={extendDuration} onValueChange={setExtendDuration}>
                    <SelectTrigger id="extend-duration">
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
                <div className="bg-accent p-4 rounded-lg space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm">New Duration</span>
                    <span className="font-medium">
                      {selectedReservation.duration + Number.parseInt(extendDuration)} hours
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">New End Time</span>
                    <span className="font-medium">
                      {format(
                        addHours(
                          new Date(
                            `${format(selectedReservation.startDate, "yyyy-MM-dd")} ${selectedReservation.startTime}`,
                          ),
                          selectedReservation.duration + Number.parseInt(extendDuration),
                        ),
                        "h:mm a",
                      )}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm">Additional Cost</span>
                    <span className="font-medium">
                      $
                      {(
                        (selectedReservation.cost / selectedReservation.duration) *
                        Number.parseInt(extendDuration)
                      ).toFixed(2)}
                    </span>
                  </div>
                  <div className="border-t pt-2 mt-2">
                    <div className="flex justify-between font-medium">
                      <span>New Total</span>
                      <span>
                        $
                        {(
                          selectedReservation.cost +
                          (selectedReservation.cost / selectedReservation.duration) * Number.parseInt(extendDuration)
                        ).toFixed(2)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsExtendDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleExtendReservation}>Extend and Pay</Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Cancel Reservation Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Reservation</DialogTitle>
            <DialogDescription>Are you sure you want to cancel this reservation?</DialogDescription>
          </DialogHeader>
          {selectedReservation && (
            <>
              <div className="space-y-4 py-2">
                <div className="bg-accent p-4 rounded-lg space-y-3">
                  <div className="flex items-start gap-3">
                    <MapPin className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{selectedReservation.parkingName}</p>
                      <p className="text-sm text-muted-foreground">{selectedReservation.parkingAddress}</p>
                      <p className="text-sm font-medium mt-1">Spot {selectedReservation.spot}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3">
                    <CalendarIcon className="h-5 w-5 text-primary mt-0.5" />
                    <div>
                      <p className="font-medium">{format(selectedReservation.startDate, "EEEE, MMMM d, yyyy")}</p>
                      <p className="text-sm text-muted-foreground">Starting at {selectedReservation.startTime}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-start gap-2 bg-yellow-50 text-yellow-800 p-4 rounded-lg">
                  <AlertCircle className="h-5 w-5 mt-0.5" />
                  <div>
                    <p className="font-medium">Cancellation Policy</p>
                    <p className="text-sm">
                      {isPast(
                        new Date(
                          `${format(selectedReservation.startDate, "yyyy-MM-dd")} ${selectedReservation.startTime}`,
                        ),
                      )
                        ? "Your reservation has already started. You may be charged a cancellation fee."
                        : "Free cancellation up to 1 hour before your reservation starts."}
                    </p>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
                  Keep Reservation
                </Button>
                <Button variant="destructive" onClick={handleCancelReservation}>
                  Cancel Reservation
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Navigation Modal */}
      {selectedForNavigation && (
        <NavigationModal
          open={isNavigationModalOpen}
          onOpenChange={setIsNavigationModalOpen}
          parkingName={selectedForNavigation.parkingName}
          parkingAddress={selectedForNavigation.parkingAddress}
          spot={selectedForNavigation.spot}
        />
      )}

      {/* Parking Spot View */}
      {selectedForNavigation && (
        <ParkingSpotView
          open={isParkingSpotViewOpen}
          onOpenChange={setIsParkingSpotViewOpen}
          parkingName={selectedForNavigation.parkingName}
          parkingSpot={selectedForNavigation.spot}
        />
      )}
    </div>
  )
}


"use client"

import { useState } from "react"
import { Car, X, Info, Navigation } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"

interface ParkingSpotViewProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parkingName: string
  parkingSpot: string
}

// Mock parking spots data
const PARKING_SPOTS = [
  { id: "A1", status: "occupied", vehicle: "Tesla Model 3" },
  { id: "A2", status: "available" },
  { id: "A3", status: "available" },
  { id: "A4", status: "reserved", reservedBy: "You" },
  { id: "A5", status: "occupied", vehicle: "Toyota Camry" },
  { id: "B1", status: "available" },
  { id: "B2", status: "maintenance" },
  { id: "B3", status: "occupied", vehicle: "Honda Civic" },
  { id: "B4", status: "available" },
  { id: "B5", status: "occupied", vehicle: "Ford F-150" },
]

// Mock parking lot layout data
const PARKING_LOT_LAYOUT = {
  name: "Main Parking Lot",
  sections: [
    {
      id: "A",
      name: "Section A",
      rows: 2,
      cols: 5,
      spots: [
        { id: "A1", row: 0, col: 0, status: "occupied", vehicle: "Tesla Model 3" },
        { id: "A2", row: 0, col: 1, status: "available" },
        { id: "A3", row: 0, col: 2, status: "available" },
        { id: "A4", row: 0, col: 3, status: "reserved", reservedBy: "You" },
        { id: "A5", row: 0, col: 4, status: "occupied", vehicle: "Toyota Camry" },
        { id: "A6", row: 1, col: 0, status: "available" },
        { id: "A7", row: 1, col: 1, status: "available" },
        { id: "A8", row: 1, col: 2, status: "occupied", vehicle: "Nissan Leaf" },
        { id: "A9", row: 1, col: 3, status: "available" },
        { id: "A10", row: 1, col: 4, status: "maintenance" },
      ],
    },
    {
      id: "B",
      name: "Section B",
      rows: 2,
      cols: 5,
      spots: [
        { id: "B1", row: 0, col: 0, status: "available" },
        { id: "B2", row: 0, col: 1, status: "maintenance" },
        { id: "B3", row: 0, col: 2, status: "occupied", vehicle: "Honda Civic" },
        { id: "B4", row: 0, col: 3, status: "available" },
        { id: "B5", row: 0, col: 4, status: "occupied", vehicle: "Ford F-150" },
        { id: "B6", row: 1, col: 0, status: "available" },
        { id: "B7", row: 1, col: 1, status: "available" },
        { id: "B8", row: 1, col: 2, status: "occupied", vehicle: "Chevrolet Bolt" },
        { id: "B9", row: 1, col: 3, status: "available" },
        { id: "B10", row: 1, col: 4, status: "available" },
      ],
    },
  ],
  facilities: [
    { id: "entrance", name: "Main Entrance", type: "entrance", position: { x: 50, y: 0 } },
    { id: "exit", name: "Exit", type: "exit", position: { x: 100, y: 50 } },
    { id: "elevator", name: "Elevator", type: "elevator", position: { x: 75, y: 50 } },
    { id: "payment", name: "Payment Kiosk", type: "payment", position: { x: 25, y: 75 } },
  ],
}

export default function ParkingSpotView({ open, onOpenChange, parkingName, parkingSpot }: ParkingSpotViewProps) {
  const { toast } = useToast()
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<"list" | "map">("map")
  const [showDirections, setShowDirections] = useState(false)

  // Get status color
  const getStatusColor = (status: string, isYourSpot: boolean) => {
    if (isYourSpot) return "bg-primary text-primary-foreground"

    switch (status) {
      case "available":
        return "bg-green-100 text-green-800 border-green-300"
      case "occupied":
        return "bg-red-100 text-red-800 border-red-300"
      case "maintenance":
        return "bg-yellow-100 text-yellow-800 border-yellow-300"
      case "reserved":
        return "bg-blue-100 text-blue-800 border-blue-300"
      default:
        return "bg-gray-100 text-gray-800 border-gray-300"
    }
  }

  // Get status badge
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "available":
        return <Badge className="bg-green-500">Available</Badge>
      case "occupied":
        return <Badge variant="destructive">Occupied</Badge>
      case "maintenance":
        return (
          <Badge variant="outline" className="border-yellow-500 text-yellow-700">
            Maintenance
          </Badge>
        )
      case "reserved":
        return (
          <Badge variant="outline" className="border-blue-500 text-blue-700">
            Reserved
          </Badge>
        )
      default:
        return null
    }
  }

  const handleNavigateToSpot = () => {
    onOpenChange(false)
    setShowDirections(true)

    toast({
      title: "Navigation started",
      description: `Navigating to Spot ${parkingSpot}`,
    })
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Parking Spot View</DialogTitle>
          <DialogDescription>{parkingName} - Viewing parking layout</DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="map" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="map">Map View</TabsTrigger>
            <TabsTrigger value="details">Spot Details</TabsTrigger>
          </TabsList>

          <TabsContent value="map" className="space-y-4">
            <div className="bg-accent p-3 rounded-lg mb-4 flex items-center justify-between">
              <div>
                <h3 className="font-medium">Your Spot: {parkingSpot}</h3>
                <p className="text-sm text-muted-foreground">Navigate to this spot when you arrive</p>
              </div>
              <Badge className="bg-primary">Your Reservation</Badge>
            </div>

            <div className="relative bg-muted/30 border rounded-lg p-6">
              {/* Entrance */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border px-3 py-1 rounded-full text-sm font-medium">
                Entrance
              </div>

              {/* Parking layout - improved with more detailed visualization */}
              <div className="grid grid-cols-1 gap-6">
                {PARKING_LOT_LAYOUT.sections.map((section) => (
                  <div key={section.id} className="space-y-2">
                    <h4 className="font-medium text-sm">{section.name}</h4>
                    <div className="grid grid-cols-5 gap-2">
                      {section.spots.map((spot) => {
                        const isYourSpot = spot.id === parkingSpot

                        return (
                          <TooltipProvider key={spot.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`relative h-14 border-2 rounded-md flex items-center justify-center cursor-pointer transition-all ${getStatusColor(
                                    spot.status,
                                    isYourSpot,
                                  )} ${isYourSpot ? "ring-2 ring-primary ring-offset-2" : ""}`}
                                  onMouseEnter={() => setHoveredSpot(spot.id)}
                                  onMouseLeave={() => setHoveredSpot(null)}
                                >
                                  <div className="absolute top-1 left-1 text-xs font-bold">{spot.id}</div>

                                  {spot.status === "occupied" || (spot.status === "reserved" && isYourSpot) ? (
                                    <Car
                                      className={`h-6 w-6 ${isYourSpot ? "text-primary-foreground" : "text-muted-foreground"}`}
                                    />
                                  ) : spot.status === "maintenance" ? (
                                    <X className="h-6 w-6 text-yellow-600" />
                                  ) : null}

                                  {isYourSpot && (
                                    <div className="absolute bottom-1 right-1">
                                      <Badge variant="outline" className="text-[0.65rem] bg-white">
                                        YOU
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-sm">
                                  <p className="font-medium">Spot {spot.id}</p>
                                  <div className="flex items-center mt-1">
                                    {getStatusBadge(spot.status)}
                                    {spot.vehicle && <span className="ml-2">{spot.vehicle}</span>}
                                    {isYourSpot && <span className="ml-2 font-medium">Your reservation</span>}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>

              {/* Facilities */}
              <div className="mt-4 flex flex-wrap gap-2 justify-center">
                {PARKING_LOT_LAYOUT.facilities.map((facility) => (
                  <Badge key={facility.id} variant="outline" className="bg-white">
                    {facility.name}
                  </Badge>
                ))}
              </div>

              {/* Legend */}
              <div className="mt-6 flex flex-wrap gap-3 justify-center">
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-green-100 border border-green-300 rounded-sm mr-1"></div>
                  <span className="text-xs">Available</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-red-100 border border-red-300 rounded-sm mr-1"></div>
                  <span className="text-xs">Occupied</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-300 rounded-sm mr-1"></div>
                  <span className="text-xs">Maintenance</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-blue-100 border border-blue-300 rounded-sm mr-1"></div>
                  <span className="text-xs">Reserved</span>
                </div>
                <div className="flex items-center">
                  <div className="w-4 h-4 bg-primary border border-primary rounded-sm mr-1"></div>
                  <span className="text-xs">Your Spot</span>
                </div>
              </div>
            </div>

            <div className="flex items-start gap-2 mt-4 bg-blue-50 p-3 rounded-lg text-blue-800">
              <Info className="h-5 w-5 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Parking Information</p>
                <p className="text-xs">
                  This view shows the current status of parking spots. Your reserved spot is highlighted. When you
                  arrive at the parking facility, follow the signs to find your designated spot.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="details" className="space-y-4">
            <div className="bg-accent p-4 rounded-lg">
              <h3 className="font-medium mb-2">Spot Details</h3>

              {/* Find the spot details */}
              {(() => {
                const allSpots = PARKING_LOT_LAYOUT.sections.flatMap((section) => section.spots)
                const spotDetails = allSpots.find((s) => s.id === parkingSpot)

                if (!spotDetails) {
                  return <p className="text-sm text-muted-foreground">Spot information not available</p>
                }

                return (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      <div
                        className={`w-8 h-8 rounded-md flex items-center justify-center ${getStatusColor(spotDetails.status, true)}`}
                      >
                        {spotDetails.status === "occupied" || spotDetails.status === "reserved" ? (
                          <Car className="h-5 w-5" />
                        ) : spotDetails.status === "maintenance" ? (
                          <X className="h-5 w-5" />
                        ) : null}
                      </div>
                      <div>
                        <p className="font-medium">Spot {spotDetails.id}</p>
                        <div className="flex items-center">{getStatusBadge(spotDetails.status)}</div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div>
                        <p className="text-muted-foreground">Section</p>
                        <p className="font-medium">
                          {PARKING_LOT_LAYOUT.sections.find((s) => s.id === spotDetails.id.charAt(0))?.name ||
                            "Unknown"}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">
                          Row {spotDetails.row + 1}, Column {spotDetails.col + 1}
                        </p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Type</p>
                        <p className="font-medium">Standard</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Size</p>
                        <p className="font-medium">Regular</p>
                      </div>
                    </div>
                  </div>
                )
              })()}
            </div>

            <div className="bg-accent p-4 rounded-lg">
              <h3 className="font-medium mb-2">Nearby Facilities</h3>
              <div className="grid grid-cols-2 gap-3">
                {PARKING_LOT_LAYOUT.facilities.map((facility) => (
                  <div key={facility.id} className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      {facility.type === "entrance" ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M9 18L15 12L9 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : facility.type === "exit" ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M15 18L9 12L15 6"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : facility.type === "elevator" ? (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M7 10L12 5L17 10M7 14L12 19L17 14"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      ) : (
                        <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path
                            d="M3 10H21M7 15H8M12 15H13M17 15H18M6 19H18C19.1046 19 20 18.1046 20 17V7C20 5.89543 19.1046 5 18 5H6C4.89543 5 4 5.89543 4 7V17C4 18.1046 4.89543 19 6 19Z"
                            stroke="currentColor"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium">{facility.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {facility.type === "entrance"
                          ? "Entry point"
                          : facility.type === "exit"
                            ? "Exit point"
                            : facility.type === "elevator"
                              ? "Access to other floors"
                              : "Payment station"}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-accent p-4 rounded-lg">
              <h3 className="font-medium mb-2">Directions to Your Spot</h3>
              <ol className="text-sm space-y-2 pl-5 list-decimal">
                <li>Enter through the Main Entrance</li>
                <li>Drive straight ahead to Section {parkingSpot.charAt(0)}</li>
                <li>Turn right at the Section {parkingSpot.charAt(0)} sign</li>
                <li>
                  Your spot {parkingSpot} will be on the{" "}
                  {Number.parseInt(parkingSpot.substring(1)) % 2 === 0 ? "right" : "left"}
                </li>
                <li>Park your vehicle within the designated lines</li>
              </ol>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          <Button onClick={handleNavigateToSpot} className="flex items-center gap-2">
            <Navigation className="h-4 w-4" />
            Navigate to Spot
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


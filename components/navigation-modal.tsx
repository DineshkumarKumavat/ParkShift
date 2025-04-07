"use client"

import { useState, useEffect } from "react"
import { ArrowLeft, ChevronRight, Clock, MapPin, Navigation, RotateCw, Car, Info } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import ParkingNavigation from "@/components/parking-navigation"

interface NavigationModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parkingName: string
  parkingAddress: string
  spot: string
}

// Mock parking lot data
const PARKING_LOT_MAP = {
  sections: [
    {
      id: "A",
      name: "Section A",
      spots: [
        { id: "A1", status: "occupied", vehicle: "Tesla Model 3" },
        { id: "A2", status: "available" },
        { id: "A3", status: "available" },
        { id: "A4", status: "reserved", reservedBy: "You" },
        { id: "A5", status: "occupied", vehicle: "Toyota Camry" },
      ],
    },
    {
      id: "B",
      name: "Section B",
      spots: [
        { id: "B1", status: "available" },
        { id: "B2", status: "maintenance" },
        { id: "B3", status: "occupied", vehicle: "Honda Civic" },
        { id: "B4", status: "available" },
        { id: "B5", status: "occupied", vehicle: "Ford F-150" },
      ],
    },
    {
      id: "C",
      name: "Section C",
      spots: [
        { id: "C1", status: "available" },
        { id: "C2", status: "available" },
        { id: "C3", status: "occupied", vehicle: "BMW X5" },
        { id: "C4", status: "available" },
        { id: "C5", status: "maintenance" },
      ],
    },
  ],
  entrances: [
    { id: "main", name: "Main Entrance", position: { x: 50, y: 0 } },
    { id: "side", name: "Side Entrance", position: { x: 0, y: 50 } },
  ],
  exits: [{ id: "main", name: "Main Exit", position: { x: 100, y: 50 } }],
}

export default function NavigationModal({
  open,
  onOpenChange,
  parkingName,
  parkingAddress,
  spot,
}: NavigationModalProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(0)
  const [eta, setEta] = useState("12 min")
  const [distance, setDistance] = useState("2.3 miles")
  const [hoveredSpot, setHoveredSpot] = useState<string | null>(null)
  const [showInAppNavigation, setShowInAppNavigation] = useState(false)

  // Mock navigation directions
  const directions = [
    {
      instruction: "Head south on Main St",
      distance: "0.5 miles",
      time: "2 min",
    },
    {
      instruction: "Turn right onto Park Ave",
      distance: "0.8 miles",
      time: "4 min",
    },
    {
      instruction: "Continue onto Central Blvd",
      distance: "0.7 miles",
      time: "3 min",
    },
    {
      instruction: "Turn left onto Parking Entrance",
      distance: "0.3 miles",
      time: "1 min",
    },
    {
      instruction: `Arrive at ${parkingName}, proceed to Spot ${spot}`,
      distance: "0 miles",
      time: "2 min",
    },
  ]

  useEffect(() => {
    if (open) {
      // Simulate loading the map and directions
      setIsLoading(true)
      const timer = setTimeout(() => {
        setIsLoading(false)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [open])

  const handleStartNavigation = () => {
    // Show in-app navigation instead of redirecting
    setShowInAppNavigation(true)
    onOpenChange(false)
  }

  const handleNextStep = () => {
    if (currentStep < directions.length - 1) {
      setCurrentStep(currentStep + 1)
    }
  }

  const handlePrevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  // Get status color for parking spots
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

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[600px] p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>Navigate to Parking Spot</DialogTitle>
            <DialogDescription>
              Directions to {parkingName}, Spot {spot}
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="map" className="w-full">
            <div className="px-6">
              <TabsList className="grid w-full grid-cols-3 mb-4">
                <TabsTrigger value="map">Map View</TabsTrigger>
                <TabsTrigger value="directions">Directions</TabsTrigger>
                <TabsTrigger value="parking-lot">Parking Lot</TabsTrigger>
              </TabsList>
            </div>

            <TabsContent value="map" className="m-0">
              <div className="relative h-[300px] bg-accent">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <RotateCw className="h-8 w-8 animate-spin text-primary mb-4" />
                    <p className="text-sm font-medium">Loading directions...</p>
                  </div>
                ) : (
                  <>
                    {/* This would be replaced with an actual map component */}
                    <div className="h-full bg-[url('/placeholder.svg?height=300&width=500')] bg-cover bg-center relative">
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="bg-background/80 backdrop-blur-sm p-4 rounded-lg">
                          <p className="text-center font-medium">Interactive Map</p>
                          <p className="text-xs text-muted-foreground text-center">Route to {parkingName}</p>
                        </div>
                      </div>
                    </div>
                    <div className="absolute bottom-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-3 shadow-lg">
                      <div className="flex justify-between items-center mb-2">
                        <div className="flex items-center">
                          <Clock className="h-4 w-4 text-primary mr-1" />
                          <span className="text-sm font-medium">{eta}</span>
                        </div>
                        <div className="text-sm">{distance}</div>
                      </div>
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 text-primary mr-2 shrink-0" />
                        <p className="text-sm truncate">{parkingAddress}</p>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </TabsContent>

            <TabsContent value="directions" className="m-0">
              <div className="h-[300px] overflow-auto">
                <div className="p-4 bg-accent flex items-center justify-between">
                  <div className="flex items-center">
                    <Navigation className="h-5 w-5 text-primary mr-2" />
                    <div>
                      <p className="font-medium text-sm">ETA: {eta}</p>
                      <p className="text-xs text-muted-foreground">Distance: {distance}</p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handlePrevStep}
                      disabled={currentStep === 0}
                    >
                      <ArrowLeft className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={handleNextStep}
                      disabled={currentStep === directions.length - 1}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="divide-y">
                  {directions.map((direction, index) => (
                    <div
                      key={index}
                      className={`p-4 ${currentStep === index ? "bg-primary/10" : currentStep > index ? "bg-muted" : ""}`}
                    >
                      <div className="flex items-start gap-3">
                        <div
                          className={`rounded-full h-6 w-6 flex items-center justify-center text-xs font-medium ${
                            currentStep === index
                              ? "bg-primary text-primary-foreground"
                              : currentStep > index
                                ? "bg-primary/30 text-primary-foreground"
                                : "bg-muted text-muted-foreground"
                          }`}
                        >
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className={`font-medium ${currentStep === index ? "text-primary" : ""}`}>
                            {direction.instruction}
                          </p>
                          <div className="flex justify-between mt-1 text-sm text-muted-foreground">
                            <span>{direction.distance}</span>
                            <span>{direction.time}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="parking-lot" className="m-0">
              <div className="h-[300px] overflow-auto p-4">
                <div className="bg-accent p-3 rounded-lg mb-4 flex items-center justify-between">
                  <div>
                    <h3 className="font-medium">Your Spot: {spot}</h3>
                    <p className="text-sm text-muted-foreground">Navigate to this spot when you arrive</p>
                  </div>
                  <Badge className="bg-primary">Your Reservation</Badge>
                </div>

                <div className="relative bg-muted/30 border rounded-lg p-6">
                  {/* Entrance */}
                  <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background border px-3 py-1 rounded-full text-sm font-medium">
                    Entrance
                  </div>

                  {/* Parking layout */}
                  <div className="grid grid-cols-5 gap-2">
                    {PARKING_LOT_MAP.sections.flatMap((section) =>
                      section.spots.map((parkingSpot) => {
                        const isYourSpot = parkingSpot.id === spot

                        return (
                          <TooltipProvider key={parkingSpot.id}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <div
                                  className={`relative h-12 border-2 rounded-md flex items-center justify-center cursor-pointer transition-all ${getStatusColor(
                                    parkingSpot.status,
                                    isYourSpot,
                                  )} ${isYourSpot ? "ring-2 ring-primary ring-offset-2" : ""}`}
                                  onMouseEnter={() => setHoveredSpot(parkingSpot.id)}
                                  onMouseLeave={() => setHoveredSpot(null)}
                                >
                                  <div className="absolute top-1 left-1 text-xs font-bold">{parkingSpot.id}</div>

                                  {parkingSpot.status === "occupied" ||
                                  (parkingSpot.status === "reserved" && isYourSpot) ? (
                                    <Car
                                      className={`h-5 w-5 ${isYourSpot ? "text-primary-foreground" : "text-muted-foreground"}`}
                                    />
                                  ) : null}

                                  {isYourSpot && (
                                    <div className="absolute bottom-0 right-0">
                                      <Badge variant="outline" className="text-[0.65rem] bg-white">
                                        YOU
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </TooltipTrigger>
                              <TooltipContent side="top">
                                <div className="text-sm">
                                  <p className="font-medium">Spot {parkingSpot.id}</p>
                                  <div className="flex items-center mt-1">
                                    <Badge
                                      className={
                                        parkingSpot.status === "available"
                                          ? "bg-green-500"
                                          : parkingSpot.status === "occupied"
                                            ? "bg-red-500"
                                            : parkingSpot.status === "maintenance"
                                              ? "bg-yellow-500"
                                              : "bg-blue-500"
                                      }
                                    >
                                      {parkingSpot.status.charAt(0).toUpperCase() + parkingSpot.status.slice(1)}
                                    </Badge>
                                    {parkingSpot.vehicle && <span className="ml-2">{parkingSpot.vehicle}</span>}
                                    {isYourSpot && <span className="ml-2 font-medium">Your reservation</span>}
                                  </div>
                                </div>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        )
                      }),
                    )}
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
              </div>
            </TabsContent>
          </Tabs>

          <DialogFooter className="p-6 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
              Close
            </Button>
            <Button onClick={handleStartNavigation}>
              <Navigation className="mr-2 h-4 w-4" />
              Start Navigation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* In-app navigation component */}
      <ParkingNavigation
        open={showInAppNavigation}
        onOpenChange={setShowInAppNavigation}
        parkingName={parkingName}
        parkingSpot={spot}
      />
    </>
  )
}


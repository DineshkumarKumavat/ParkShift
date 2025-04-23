"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { MapPin, Navigation, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"

// Mock parking data
const PARKING_SPOTS = [
  { id: 1, name: "Downtown Parking", address: "123 Main St", available: 5, total: 20, lat: 40.7128, lng: -74.006 },
  { id: 2, name: "City Center Garage", address: "456 Park Ave", available: 12, total: 50, lat: 40.7138, lng: -74.013 },
  { id: 3, name: "Riverside Parking", address: "789 River Rd", available: 3, total: 15, lat: 40.7118, lng: -74.009 },
]

export default function DashboardMap() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(true)
  const [locationPermission, setLocationPermission] = useState<boolean | null>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [selectedParking, setSelectedParking] = useState<number | null>(null)

  useEffect(() => {
    // Simulate map loading
    const timer = setTimeout(() => {
      setLoading(false)
      // Request location permission
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setUserLocation({
              lat: position.coords.latitude,
              lng: position.coords.longitude,
            })
            setLocationPermission(true)
          },
          () => {
            setLocationPermission(false)
            toast({
              title: "Location access denied",
              description: "Please enable location services to find parking spots near you.",
              variant: "destructive",
            })
          },
        )
      } else {
        setLocationPermission(false)
        toast({
          title: "Location not supported",
          description: "Your browser does not support geolocation.",
          variant: "destructive",
        })
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [toast])

  const handleSelectParking = (id: number) => {
    setSelectedParking(id)
  }

  const handleNavigate = () => {
    if (selectedParking) {
      router.push(`/select-spot/${selectedParking}`)
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-4" />
        <p className="text-lg font-medium">Loading map...</p>
        <p className="text-sm text-muted-foreground">Please wait while we find parking spots near you</p>
      </div>
    )
  }

  if (locationPermission === false) {
    return (
      <div className="flex flex-col items-center justify-center h-[calc(100vh-4rem)]">
        <MapPin className="h-12 w-12 text-destructive mb-4" />
        <h2 className="text-xl font-bold mb-2">Location Access Required</h2>
        <p className="text-center text-muted-foreground mb-4 max-w-md">
          To find parking spots near you, please enable location services in your browser settings and refresh the page.
        </p>
        <Button onClick={() => window.location.reload()}>Refresh Page</Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[calc(100vh-5rem)]">
      <div className="md:col-span-2 bg-accent rounded-lg relative overflow-hidden">
        {/* This would be replaced with an actual Google Maps component */}
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=600&width=800')] bg-cover bg-center">
          <div className="absolute inset-0 bg-black/10"></div>
        </div>
        <div className="absolute top-4 left-4 right-4 bg-background/90 backdrop-blur-sm rounded-lg p-4 shadow-lg">
          <h2 className="text-lg font-medium mb-2">Find Parking Near You</h2>
          <p className="text-sm text-muted-foreground">
            {userLocation ? "We've found several parking options near your location." : "Determining your location..."}
          </p>
        </div>
        {/* Map markers for parking spots */}
        {PARKING_SPOTS.map((spot) => (
          <div
            key={spot.id}
            className={`absolute p-2 rounded-full cursor-pointer transition-all ${
              selectedParking === spot.id
                ? "bg-primary text-primary-foreground scale-125"
                : "bg-background text-foreground hover:bg-primary/20"
            }`}
            style={{
              left: `${30 + spot.id * 20}%`,
              top: `${40 + spot.id * 10}%`,
            }}
            onClick={() => handleSelectParking(spot.id)}
          >
            <MapPin className="h-6 w-6" />
          </div>
        ))}
        {/* User location marker */}
        {userLocation && (
          <div
            className="absolute p-2 rounded-full bg-blue-500 text-white animate-pulse"
            style={{ left: "50%", top: "50%" }}
          >
            <Navigation className="h-6 w-6" />
          </div>
        )}
      </div>
      <div className="space-y-4 overflow-auto pb-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Available Parking</CardTitle>
            <CardDescription>Select a parking location to reserve a spot</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {PARKING_SPOTS.map((spot) => (
                <div
                  key={spot.id}
                  className={`p-4 rounded-lg cursor-pointer transition-all ${
                    selectedParking === spot.id ? "bg-primary/10 border border-primary" : "bg-accent hover:bg-accent/80"
                  }`}
                  onClick={() => handleSelectParking(spot.id)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">{spot.name}</h3>
                    <span
                      className={`text-sm px-2 py-1 rounded-full ${
                        spot.available > 5
                          ? "bg-green-100 text-green-800"
                          : spot.available > 0
                            ? "bg-yellow-100 text-yellow-800"
                            : "bg-red-100 text-red-800"
                      }`}
                    >
                      {spot.available} spots
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground mb-1">{spot.address}</p>
                  <div className="flex justify-between text-sm">
                    <span>
                      {spot.available} of {spot.total} available
                    </span>
                    <span>0.5 miles away</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
          <CardFooter>
            <Button className="w-full" disabled={selectedParking === null} onClick={handleNavigate}>
              {selectedParking === null
                ? "Select a parking location"
                : `Reserve at ${PARKING_SPOTS.find((s) => s.id === selectedParking)?.name}`}
            </Button>
          </CardFooter>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle>Quick Tips</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm">
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <span>Click on a marker or listing to select a parking location</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <span>Green indicators show plenty of available spots</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="rounded-full bg-primary/20 p-1 mt-0.5">
                  <MapPin className="h-3 w-3 text-primary" />
                </div>
                <span>Reserve in advance for guaranteed parking</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}


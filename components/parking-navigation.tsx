"use client"

import { useState, useEffect, useRef } from "react"
import { ArrowLeft, ArrowRight, ArrowUp, ArrowDown, Navigation, RotateCw, Info, CheckCircle } from "lucide-react"
import { useRouter } from "next/navigation"

import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

interface ParkingNavigationProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  parkingName: string
  parkingSpot: string
  onComplete?: () => void
}

// Define the parking lot layout
const PARKING_LOT = {
  width: 800,
  height: 600,
  grid: {
    cellSize: 40,
    rows: 15,
    cols: 20,
  },
  entrances: [
    { id: "main", name: "Main Entrance", x: 10, y: 14 },
    { id: "side", name: "Side Entrance", x: 0, y: 7 },
  ],
  exits: [{ id: "main", name: "Main Exit", x: 19, y: 7 }],
  sections: [
    {
      id: "A",
      name: "Section A",
      spots: [
        { id: "A1", x: 2, y: 2, status: "occupied" },
        { id: "A2", x: 3, y: 2, status: "available" },
        { id: "A3", x: 4, y: 2, status: "available" },
        { id: "A4", x: 5, y: 2, status: "reserved" },
        { id: "A5", x: 6, y: 2, status: "occupied" },
        { id: "A6", x: 2, y: 3, status: "available" },
        { id: "A7", x: 3, y: 3, status: "available" },
        { id: "A8", x: 4, y: 3, status: "occupied" },
        { id: "A9", x: 5, y: 3, status: "available" },
        { id: "A10", x: 6, y: 3, status: "maintenance" },
      ],
    },
    {
      id: "B",
      name: "Section B",
      spots: [
        { id: "B1", x: 10, y: 2, status: "available" },
        { id: "B2", x: 11, y: 2, status: "maintenance" },
        { id: "B3", x: 12, y: 2, status: "occupied" },
        { id: "B4", x: 13, y: 2, status: "available" },
        { id: "B5", x: 14, y: 2, status: "occupied" },
        { id: "B6", x: 10, y: 3, status: "available" },
        { id: "B7", x: 11, y: 3, status: "available" },
        { id: "B8", x: 12, y: 3, status: "occupied" },
        { id: "B9", x: 13, y: 3, status: "available" },
        { id: "B10", x: 14, y: 3, status: "available" },
      ],
    },
    {
      id: "C",
      name: "Section C",
      spots: [
        { id: "C1", x: 2, y: 6, status: "available" },
        { id: "C2", x: 3, y: 6, status: "available" },
        { id: "C3", x: 4, y: 6, status: "occupied" },
        { id: "C4", x: 5, y: 6, status: "available" },
        { id: "C5", x: 6, y: 6, status: "maintenance" },
        { id: "C6", x: 2, y: 7, status: "available" },
        { id: "C7", x: 3, y: 7, status: "available" },
        { id: "C8", x: 4, y: 7, status: "occupied" },
        { id: "C9", x: 5, y: 7, status: "available" },
        { id: "C10", x: 6, y: 7, status: "available" },
      ],
    },
    {
      id: "D",
      name: "Section D",
      spots: [
        { id: "D1", x: 10, y: 6, status: "available" },
        { id: "D2", x: 11, y: 6, status: "available" },
        { id: "D3", x: 12, y: 6, status: "occupied" },
        { id: "D4", x: 13, y: 6, status: "available" },
        { id: "D5", x: 14, y: 6, status: "maintenance" },
        { id: "D6", x: 10, y: 7, status: "available" },
        { id: "D7", x: 11, y: 7, status: "available" },
        { id: "D8", x: 12, y: 7, status: "occupied" },
        { id: "D9", x: 13, y: 7, status: "available" },
        { id: "D10", x: 14, y: 7, status: "available" },
      ],
    },
  ],
  obstacles: [
    { x: 8, y: 2, width: 1, height: 6, type: "wall" },
    { x: 8, y: 9, width: 1, height: 5, type: "wall" },
    { x: 16, y: 2, width: 1, height: 6, type: "wall" },
    { x: 16, y: 9, width: 1, height: 5, type: "wall" },
    { x: 2, y: 10, width: 14, height: 1, type: "wall" },
    { x: 2, y: 4, width: 14, height: 1, type: "wall" },
    { x: 9, y: 5, width: 2, height: 2, type: "column" },
    { x: 9, y: 8, width: 2, height: 2, type: "column" },
  ],
  facilities: [
    { id: "elevator1", name: "Elevator 1", x: 7, y: 5, type: "elevator" },
    { id: "elevator2", name: "Elevator 2", x: 15, y: 5, type: "elevator" },
    { id: "payment1", name: "Payment Kiosk 1", x: 7, y: 8, type: "payment" },
    { id: "payment2", name: "Payment Kiosk 2", x: 15, y: 8, type: "payment" },
    { id: "info", name: "Information Desk", x: 10, y: 12, type: "info" },
  ],
  paths: [
    // Main driving lanes
    { from: { x: 10, y: 14 }, to: { x: 10, y: 11 }, type: "main" },
    { from: { x: 10, y: 11 }, to: { x: 2, y: 11 }, type: "main" },
    { from: { x: 10, y: 11 }, to: { x: 18, y: 11 }, type: "main" },
    { from: { x: 2, y: 11 }, to: { x: 2, y: 9 }, type: "main" },
    { from: { x: 18, y: 11 }, to: { x: 18, y: 9 }, type: "main" },
    { from: { x: 2, y: 9 }, to: { x: 7, y: 9 }, type: "main" },
    { from: { x: 18, y: 9 }, to: { x: 17, y: 9 }, type: "main" },
    { from: { x: 7, y: 9 }, to: { x: 7, y: 5 }, type: "main" },
    { from: { x: 17, y: 9 }, to: { x: 17, y: 5 }, type: "main" },
    { from: { x: 7, y: 5 }, to: { x: 2, y: 5 }, type: "main" },
    { from: { x: 17, y: 5 }, to: { x: 18, y: 5 }, type: "main" },
    { from: { x: 2, y: 5 }, to: { x: 2, y: 1 }, type: "main" },
    { from: { x: 18, y: 5 }, to: { x: 18, y: 1 }, type: "main" },
    { from: { x: 2, y: 1 }, to: { x: 7, y: 1 }, type: "main" },
    { from: { x: 18, y: 1 }, to: { x: 17, y: 1 }, type: "main" },
    { from: { x: 7, y: 1 }, to: { x: 9, y: 1 }, type: "main" },
    { from: { x: 17, y: 1 }, to: { x: 9, y: 1 }, type: "main" },

    // Section A access
    { from: { x: 2, y: 5 }, to: { x: 2, y: 4 }, type: "access" },
    { from: { x: 2, y: 4 }, to: { x: 6, y: 4 }, type: "access" },
    { from: { x: 6, y: 4 }, to: { x: 6, y: 2 }, type: "access" },
    { from: { x: 6, y: 2 }, to: { x: 2, y: 2 }, type: "access" },

    // Section B access
    { from: { x: 18, y: 5 }, to: { x: 18, y: 4 }, type: "access" },
    { from: { x: 18, y: 4 }, to: { x: 14, y: 4 }, type: "access" },
    { from: { x: 14, y: 4 }, to: { x: 14, y: 2 }, type: "access" },
    { from: { x: 14, y: 2 }, to: { x: 10, y: 2 }, type: "access" },

    // Section C access
    { from: { x: 2, y: 9 }, to: { x: 2, y: 8 }, type: "access" },
    { from: { x: 2, y: 8 }, to: { x: 6, y: 8 }, type: "access" },
    { from: { x: 6, y: 8 }, to: { x: 6, y: 6 }, type: "access" },
    { from: { x: 6, y: 6 }, to: { x: 2, y: 6 }, type: "access" },

    // Section D access
    { from: { x: 18, y: 9 }, to: { x: 18, y: 8 }, type: "access" },
    { from: { x: 18, y: 8 }, to: { x: 14, y: 8 }, type: "access" },
    { from: { x: 14, y: 8 }, to: { x: 14, y: 6 }, type: "access" },
    { from: { x: 14, y: 6 }, to: { x: 10, y: 6 }, type: "access" },
  ],
}

// Define the navigation states
type NavigationState = "initializing" | "navigating" | "rerouting" | "arrived" | "completed"

export default function ParkingNavigation({
  open,
  onOpenChange,
  parkingName,
  parkingSpot,
  onComplete,
}: ParkingNavigationProps) {
  const router = useRouter()
  const { toast } = useToast()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [navigationState, setNavigationState] = useState<NavigationState>("initializing")
  const [progress, setProgress] = useState(0)
  const [currentStep, setCurrentStep] = useState(0)
  const [userLocation, setUserLocation] = useState({ x: 10, y: 14 }) // Start at main entrance
  const [showObstacleAlert, setShowObstacleAlert] = useState(false)
  const [eta, setEta] = useState("3 min")
  const [remainingDistance, setRemainingDistance] = useState("120m")

  // Find the target spot coordinates
  const targetSpot = PARKING_LOT.sections.flatMap((section) => section.spots).find((spot) => spot.id === parkingSpot)

  // Generate navigation path
  const [navigationPath, setNavigationPath] = useState<{ x: number; y: number }[]>([])
  const [navigationDirections, setNavigationDirections] = useState<string[]>([])

  // Initialize navigation
  useEffect(() => {
    if (open) {
      setIsLoading(true)
      setNavigationState("initializing")
      setProgress(0)
      setCurrentStep(0)
      setUserLocation({ x: 10, y: 14 }) // Reset to entrance

      // Simulate loading
      const timer = setTimeout(() => {
        setIsLoading(false)
        setNavigationState("navigating")

        // Generate initial path
        if (targetSpot) {
          const path = generatePath(userLocation, { x: targetSpot.x, y: targetSpot.y })
          setNavigationPath(path)

          // Generate directions from path
          const directions = generateDirections(path)
          setNavigationDirections(directions)
        }
      }, 2000)

      return () => clearTimeout(timer)
    }
  }, [open, parkingSpot])

  // Update canvas when navigation state changes
  useEffect(() => {
    if (!isLoading && navigationState !== "initializing") {
      const canvas = canvasRef.current
      if (canvas) {
        drawParkingLot(canvas)
      }
    }
  }, [isLoading, navigationState, userLocation, navigationPath, currentStep])

  // Simulate user movement along the path
  useEffect(() => {
    if (navigationState === "navigating" && navigationPath.length > 0) {
      const moveInterval = setInterval(() => {
        setUserLocation((prevLocation) => {
          // Calculate next position in path
          const nextStepIndex = currentStep + 1

          if (nextStepIndex >= navigationPath.length) {
            // Reached destination
            clearInterval(moveInterval)
            setNavigationState("arrived")
            setProgress(100)
            return prevLocation
          }

          const nextPosition = navigationPath[nextStepIndex]

          // Update progress
          const progressValue = Math.min(100, Math.round((nextStepIndex / (navigationPath.length - 1)) * 100))
          setProgress(progressValue)

          // Update current step
          setCurrentStep(nextStepIndex)

          // Update ETA and distance
          const remainingSteps = navigationPath.length - nextStepIndex - 1
          const newEta = Math.max(1, Math.round(remainingSteps / 5)) + " min"
          setEta(newEta)

          const newDistance = Math.round(remainingSteps * 10) + "m"
          setRemainingDistance(newDistance)

          // Randomly simulate obstacle (5% chance)
          if (Math.random() < 0.05 && nextStepIndex < navigationPath.length - 3) {
            setNavigationState("rerouting")
            setShowObstacleAlert(true)

            // Recalculate path after a delay
            setTimeout(() => {
              const newPath = generatePath(nextPosition, { x: targetSpot!.x, y: targetSpot!.y }, true)
              setNavigationPath([...navigationPath.slice(0, nextStepIndex), ...newPath])

              // Generate new directions
              const newDirections = generateDirections(newPath)
              setNavigationDirections(newDirections)

              setNavigationState("navigating")
              setShowObstacleAlert(false)
            }, 3000)
          }

          return nextPosition
        })
      }, 1000) // Move every second

      return () => clearInterval(moveInterval)
    }
  }, [navigationState, navigationPath, currentStep])

  // Function to generate a path between two points
  function generatePath(start: { x: number; y: number }, end: { x: number; y: number }, avoidObstacle = false) {
    // This is a simplified A* pathfinding algorithm
    // In a real app, this would be more sophisticated

    // For demo purposes, we'll create a path with waypoints
    const path: { x: number; y: number }[] = [start]

    // Find the section of the target spot
    const spotSection = targetSpot?.id.charAt(0) || "A"

    // Add waypoints based on the section
    if (spotSection === "A") {
      path.push({ x: 10, y: 11 })
      path.push({ x: 2, y: 11 })
      path.push({ x: 2, y: 9 })
      path.push({ x: 2, y: 5 })
      path.push({ x: 2, y: 4 })

      // If avoiding obstacle, take a different route
      if (avoidObstacle) {
        path.push({ x: 3, y: 4 })
        path.push({ x: 4, y: 4 })
        path.push({ x: 5, y: 4 })
        path.push({ x: 5, y: 3 })
        path.push({ x: 5, y: 2 })
        path.push({ x: end.x, y: end.y })
      } else {
        path.push({ x: 6, y: 4 })
        path.push({ x: 6, y: 3 })
        path.push({ x: 6, y: 2 })
        path.push({ x: end.x, y: end.y })
      }
    } else if (spotSection === "B") {
      path.push({ x: 10, y: 11 })
      path.push({ x: 18, y: 11 })
      path.push({ x: 18, y: 9 })
      path.push({ x: 18, y: 5 })
      path.push({ x: 18, y: 4 })

      // If avoiding obstacle, take a different route
      if (avoidObstacle) {
        path.push({ x: 17, y: 4 })
        path.push({ x: 16, y: 4 })
        path.push({ x: 15, y: 4 })
        path.push({ x: 15, y: 3 })
        path.push({ x: 15, y: 2 })
        path.push({ x: end.x, y: end.y })
      } else {
        path.push({ x: 14, y: 4 })
        path.push({ x: 14, y: 3 })
        path.push({ x: 14, y: 2 })
        path.push({ x: end.x, y: end.y })
      }
    } else if (spotSection === "C") {
      path.push({ x: 10, y: 11 })
      path.push({ x: 2, y: 11 })
      path.push({ x: 2, y: 9 })
      path.push({ x: 2, y: 8 })

      // If avoiding obstacle, take a different route
      if (avoidObstacle) {
        path.push({ x: 3, y: 8 })
        path.push({ x: 4, y: 8 })
        path.push({ x: 5, y: 8 })
        path.push({ x: 5, y: 7 })
        path.push({ x: 5, y: 6 })
        path.push({ x: end.x, y: end.y })
      } else {
        path.push({ x: 6, y: 8 })
        path.push({ x: 6, y: 7 })
        path.push({ x: 6, y: 6 })
        path.push({ x: end.x, y: end.y })
      }
    } else if (spotSection === "D") {
      path.push({ x: 10, y: 11 })
      path.push({ x: 18, y: 11 })
      path.push({ x: 18, y: 9 })
      path.push({ x: 18, y: 8 })

      // If avoiding obstacle, take a different route
      if (avoidObstacle) {
        path.push({ x: 17, y: 8 })
        path.push({ x: 16, y: 8 })
        path.push({ x: 15, y: 8 })
        path.push({ x: 15, y: 7 })
        path.push({ x: 15, y: 6 })
        path.push({ x: end.x, y: end.y })
      } else {
        path.push({ x: 14, y: 8 })
        path.push({ x: 14, y: 7 })
        path.push({ x: 14, y: 6 })
        path.push({ x: end.x, y: end.y })
      }
    }

    return path
  }

  // Function to generate turn-by-turn directions from a path
  function generateDirections(path: { x: number; y: number }[]) {
    const directions: string[] = []

    if (path.length < 2) return directions

    // Add initial direction
    directions.push("Start from the entrance")

    for (let i = 1; i < path.length - 1; i++) {
      const prev = path[i - 1]
      const current = path[i]
      const next = path[i + 1]

      // Determine direction change
      const currentDirection = getDirection(prev, current)
      const nextDirection = getDirection(current, next)

      if (currentDirection !== nextDirection) {
        if (nextDirection === "north") {
          directions.push(`Turn left at ${getLocationDescription(current)}`)
        } else if (nextDirection === "south") {
          directions.push(`Turn right at ${getLocationDescription(current)}`)
        } else if (nextDirection === "east") {
          if (currentDirection === "north") {
            directions.push(`Turn right at ${getLocationDescription(current)}`)
          } else {
            directions.push(`Turn left at ${getLocationDescription(current)}`)
          }
        } else if (nextDirection === "west") {
          if (currentDirection === "north") {
            directions.push(`Turn left at ${getLocationDescription(current)}`)
          } else {
            directions.push(`Turn right at ${getLocationDescription(current)}`)
          }
        }
      }
    }

    // Add final direction
    directions.push(`Arrive at parking spot ${parkingSpot}`)

    return directions
  }

  // Helper function to get direction between two points
  function getDirection(from: { x: number; y: number }, to: { x: number; y: number }) {
    if (to.y < from.y) return "north"
    if (to.y > from.y) return "south"
    if (to.x > from.x) return "east"
    if (to.x < from.x) return "west"
    return "unknown"
  }

  // Helper function to get location description
  function getLocationDescription(point: { x: number; y: number }) {
    // Check if point is near a facility
    const nearbyFacility = PARKING_LOT.facilities.find(
      (f) => Math.abs(f.x - point.x) <= 1 && Math.abs(f.y - point.y) <= 1,
    )

    if (nearbyFacility) {
      return nearbyFacility.name
    }

    // Check if point is in a section
    for (const section of PARKING_LOT.sections) {
      const inSection = section.spots.some((spot) => Math.abs(spot.x - point.x) <= 2 && Math.abs(spot.y - point.y) <= 2)

      if (inSection) {
        return `Section ${section.id}`
      }
    }

    return "the intersection"
  }

  // Function to draw the parking lot on canvas
  function drawParkingLot(canvas: HTMLCanvasElement) {
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Set canvas dimensions
    canvas.width = PARKING_LOT.width
    canvas.height = PARKING_LOT.height

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Draw background
    ctx.fillStyle = "#f5f5f5"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw grid (for reference)
    ctx.strokeStyle = "#e0e0e0"
    ctx.lineWidth = 0.5

    const cellSize = PARKING_LOT.grid.cellSize

    for (let x = 0; x <= PARKING_LOT.grid.cols; x++) {
      ctx.beginPath()
      ctx.moveTo(x * cellSize, 0)
      ctx.lineTo(x * cellSize, PARKING_LOT.height)
      ctx.stroke()
    }

    for (let y = 0; y <= PARKING_LOT.grid.rows; y++) {
      ctx.beginPath()
      ctx.moveTo(0, y * cellSize)
      ctx.lineTo(PARKING_LOT.width, y * cellSize)
      ctx.stroke()
    }

    // Draw paths
    ctx.strokeStyle = "#d0d0d0"
    ctx.lineWidth = 10

    for (const path of PARKING_LOT.paths) {
      ctx.beginPath()
      ctx.moveTo(path.from.x * cellSize + cellSize / 2, path.from.y * cellSize + cellSize / 2)
      ctx.lineTo(path.to.x * cellSize + cellSize / 2, path.to.y * cellSize + cellSize / 2)
      ctx.stroke()
    }

    // Draw obstacles
    ctx.fillStyle = "#a0a0a0"

    for (const obstacle of PARKING_LOT.obstacles) {
      ctx.fillRect(obstacle.x * cellSize, obstacle.y * cellSize, obstacle.width * cellSize, obstacle.height * cellSize)
    }

    // Draw facilities
    for (const facility of PARKING_LOT.facilities) {
      ctx.fillStyle = "#e0e0ff"
      ctx.fillRect(
        facility.x * cellSize - cellSize / 3,
        facility.y * cellSize - cellSize / 3,
        (cellSize * 2) / 3,
        (cellSize * 2) / 3,
      )

      ctx.fillStyle = "#000"
      ctx.font = "10px Arial"
      ctx.fillText(facility.name, facility.x * cellSize - cellSize / 3, facility.y * cellSize - cellSize / 2)
    }

    // Draw entrances and exits
    for (const entrance of PARKING_LOT.entrances) {
      ctx.fillStyle = "#c0ffc0"
      ctx.beginPath()
      ctx.arc(entrance.x * cellSize + cellSize / 2, entrance.y * cellSize + cellSize / 2, cellSize / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#000"
      ctx.font = "10px Arial"
      ctx.fillText(entrance.name, entrance.x * cellSize, entrance.y * cellSize + cellSize)
    }

    for (const exit of PARKING_LOT.exits) {
      ctx.fillStyle = "#ffc0c0"
      ctx.beginPath()
      ctx.arc(exit.x * cellSize + cellSize / 2, exit.y * cellSize + cellSize / 2, cellSize / 2, 0, Math.PI * 2)
      ctx.fill()

      ctx.fillStyle = "#000"
      ctx.font = "10px Arial"
      ctx.fillText(exit.name, exit.x * cellSize, exit.y * cellSize + cellSize)
    }

    // Draw parking spots
    for (const section of PARKING_LOT.sections) {
      for (const spot of section.spots) {
        // Determine color based on status
        if (spot.id === parkingSpot) {
          // Highlight user's reserved spot
          ctx.fillStyle = "#4f46e5" // Primary color
          ctx.strokeStyle = "#4f46e5"
          ctx.lineWidth = 2
        } else if (spot.status === "occupied") {
          ctx.fillStyle = "#fee2e2" // Light red
          ctx.strokeStyle = "#ef4444" // Red
          ctx.lineWidth = 1
        } else if (spot.status === "available") {
          ctx.fillStyle = "#dcfce7" // Light green
          ctx.strokeStyle = "#22c55e" // Green
          ctx.lineWidth = 1
        } else if (spot.status === "maintenance") {
          ctx.fillStyle = "#fef3c7" // Light yellow
          ctx.strokeStyle = "#f59e0b" // Yellow
          ctx.lineWidth = 1
        } else if (spot.status === "reserved") {
          ctx.fillStyle = "#dbeafe" // Light blue
          ctx.strokeStyle = "#3b82f6" // Blue
          ctx.lineWidth = 1
        }

        // Draw the parking spot
        ctx.fillRect(spot.x * cellSize, spot.y * cellSize, cellSize, cellSize)

        ctx.strokeRect(spot.x * cellSize, spot.y * cellSize, cellSize, cellSize)

        // Draw spot ID
        ctx.fillStyle = "#000"
        ctx.font = "10px Arial"
        ctx.fillText(spot.id, spot.x * cellSize + 5, spot.y * cellSize + 15)
      }
    }

    // Draw navigation path if available
    if (navigationPath.length > 0) {
      ctx.strokeStyle = "#4f46e5" // Primary color
      ctx.lineWidth = 3

      // Draw the path
      ctx.beginPath()
      ctx.moveTo(navigationPath[0].x * cellSize + cellSize / 2, navigationPath[0].y * cellSize + cellSize / 2)

      for (let i = 1; i < navigationPath.length; i++) {
        ctx.lineTo(navigationPath[i].x * cellSize + cellSize / 2, navigationPath[i].y * cellSize + cellSize / 2)
      }

      ctx.stroke()

      // Draw arrows along the path
      for (let i = 0; i < navigationPath.length - 1; i++) {
        // Only draw arrows for every other segment to avoid clutter
        if (i % 2 === 0) continue

        const start = navigationPath[i]
        const end = navigationPath[i + 1]

        // Calculate direction
        const dx = end.x - start.x
        const dy = end.y - start.y
        const angle = Math.atan2(dy, dx)

        // Draw arrow
        const arrowLength = cellSize / 3
        const arrowX = start.x * cellSize + cellSize / 2 + (dx * cellSize) / 2
        const arrowY = start.y * cellSize + cellSize / 2 + (dy * cellSize) / 2

        ctx.beginPath()
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle - Math.PI / 6),
          arrowY - arrowLength * Math.sin(angle - Math.PI / 6),
        )
        ctx.moveTo(arrowX, arrowY)
        ctx.lineTo(
          arrowX - arrowLength * Math.cos(angle + Math.PI / 6),
          arrowY - arrowLength * Math.sin(angle + Math.PI / 6),
        )
        ctx.stroke()
      }
    }

    // Draw user location
    ctx.fillStyle = "#4f46e5" // Primary color
    ctx.beginPath()
    ctx.arc(
      userLocation.x * cellSize + cellSize / 2,
      userLocation.y * cellSize + cellSize / 2,
      cellSize / 3,
      0,
      Math.PI * 2,
    )
    ctx.fill()

    // Draw a pulsing effect around user location
    if (navigationState === "navigating" || navigationState === "rerouting") {
      const pulseRadius = cellSize / 2 + (Math.sin(Date.now() / 200) * cellSize) / 6
      ctx.strokeStyle = "#4f46e5"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(
        userLocation.x * cellSize + cellSize / 2,
        userLocation.y * cellSize + cellSize / 2,
        pulseRadius,
        0,
        Math.PI * 2,
      )
      ctx.stroke()
    }

    // Draw destination marker
    if (targetSpot) {
      ctx.fillStyle = "#ef4444" // Red
      ctx.beginPath()
      ctx.arc(
        targetSpot.x * cellSize + cellSize / 2,
        targetSpot.y * cellSize + cellSize / 2,
        cellSize / 4,
        0,
        Math.PI * 2,
      )
      ctx.fill()

      // Draw a flag or marker
      ctx.fillStyle = "#ef4444"
      ctx.beginPath()
      ctx.moveTo(targetSpot.x * cellSize + cellSize / 2, targetSpot.y * cellSize + cellSize / 4)
      ctx.lineTo(
        targetSpot.x * cellSize + cellSize / 2 + cellSize / 3,
        targetSpot.y * cellSize + cellSize / 4 + cellSize / 6,
      )
      ctx.lineTo(targetSpot.x * cellSize + cellSize / 2, targetSpot.y * cellSize + cellSize / 4 + cellSize / 3)
      ctx.fill()
    }
  }

  // Handle completion of navigation
  const handleComplete = () => {
    setNavigationState("completed")
    toast({
      title: "Navigation completed",
      description: `You have arrived at your parking spot ${parkingSpot}`,
    })

    // Close the dialog after a delay
    setTimeout(() => {
      onOpenChange(false)
      if (onComplete) onComplete()
    }, 2000)
  }

  // Get the current direction instruction
  const getCurrentDirection = () => {
    if (navigationDirections.length === 0) return "Calculating route..."

    // If we're at the last step, show the arrival message
    if (currentStep >= navigationPath.length - 2) {
      return "You have arrived at your destination"
    }

    // Otherwise, show the current direction
    const directionIndex = Math.min(
      Math.floor(currentStep / (navigationPath.length / navigationDirections.length)),
      navigationDirections.length - 1,
    )

    return navigationDirections[directionIndex]
  }

  // Get the direction arrow based on current movement
  const getDirectionArrow = () => {
    if (navigationPath.length <= currentStep + 1) return <CheckCircle className="h-8 w-8 text-green-500" />

    const current = navigationPath[currentStep]
    const next = navigationPath[currentStep + 1]

    if (next.y < current.y) return <ArrowUp className="h-8 w-8" />
    if (next.y > current.y) return <ArrowDown className="h-8 w-8" />
    if (next.x > current.x) return <ArrowRight className="h-8 w-8" />
    if (next.x < current.x) return <ArrowLeft className="h-8 w-8" />

    return <Navigation className="h-8 w-8" />
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-2">
          <DialogTitle>Navigate to Parking Spot {parkingSpot}</DialogTitle>
          <DialogDescription>{parkingName} - Real-time navigation guidance</DialogDescription>
        </DialogHeader>

        <div className="relative">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-[500px] bg-accent">
              <RotateCw className="h-12 w-12 animate-spin text-primary mb-4" />
              <p className="text-lg font-medium">Initializing navigation...</p>
              <p className="text-sm text-muted-foreground mt-2">Calculating the best route to your spot</p>
            </div>
          ) : (
            <div className="h-[500px] relative overflow-hidden">
              {/* Canvas for drawing the parking lot */}
              <canvas ref={canvasRef} className="w-full h-full" style={{ touchAction: "none" }} />

              {/* Navigation overlay */}
              <div className="absolute bottom-0 left-0 right-0 bg-background/95 backdrop-blur-sm p-4 border-t">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="bg-primary/10 rounded-full p-2">{getDirectionArrow()}</div>
                    <div>
                      <p className="font-medium">{getCurrentDirection()}</p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <span>ETA: {eta}</span>
                        <span>•</span>
                        <span>{remainingDistance} remaining</span>
                      </div>
                    </div>
                  </div>

                  {navigationState === "arrived" && (
                    <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                      <CheckCircle className="mr-2 h-4 w-4" />
                      I've Arrived
                    </Button>
                  )}
                </div>

                <Progress value={progress} className="h-2" />
              </div>

              {/* Obstacle alert */}
              {showObstacleAlert && (
                <div className="absolute top-4 left-4 right-4">
                  <Alert variant="destructive">
                    <Info className="h-4 w-4" />
                    <AlertTitle>Obstacle Detected</AlertTitle>
                    <AlertDescription>Recalculating route to avoid obstacle...</AlertDescription>
                  </Alert>
                </div>
              )}

              {/* Arrived overlay */}
              {navigationState === "arrived" && (
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm p-6 rounded-lg shadow-lg text-center">
                  <div className="rounded-full bg-green-100 p-3 mx-auto mb-4 w-16 h-16 flex items-center justify-center">
                    <CheckCircle className="h-8 w-8 text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold mb-2">You Have Arrived!</h3>
                  <p className="text-muted-foreground mb-4">You have reached parking spot {parkingSpot}</p>
                  <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
                    Complete Navigation
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="p-6 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} className="mr-2">
            Cancel Navigation
          </Button>
          {navigationState !== "arrived" && navigationState !== "completed" && !isLoading && (
            <Button
              onClick={() => {
                // Simulate arriving at destination
                setUserLocation(targetSpot ? { x: targetSpot.x, y: targetSpot.y } : userLocation)
                setNavigationState("arrived")
                setProgress(100)
              }}
              className="bg-primary"
            >
              <Navigation className="mr-2 h-4 w-4" />
              Skip to Destination
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}


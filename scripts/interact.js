// Script to interact with the deployed contracts

const { ethers } = require("hardhat")

// Contract addresses (replace with actual deployed addresses)
const PARKING_SYSTEM_ADDRESS = "0x..."
const PAYMENT_ADDRESS = "0x..."

async function main() {
  // Get contract instances
  const parkingSystem = await ethers.getContractAt("ParkingSystem", PARKING_SYSTEM_ADDRESS)
  const payment = await ethers.getContractAt("Payment", PAYMENT_ADDRESS)

  // Get signers
  const [owner, user1, user2] = await ethers.getSigners()

  console.log("Interacting with Smart Parking System contracts...")
  console.log("Owner address:", owner.address)
  console.log("User1 address:", user1.address)
  console.log("User2 address:", user2.address)

  // Register users
  console.log("\nRegistering users...")
  await parkingSystem.connect(user1).registerUser("Alice Johnson", "alice@example.com", "+1234567890")
  console.log("User1 registered")

  await parkingSystem.connect(user2).registerUser("Bob Smith", "bob@example.com", "+1987654321")
  console.log("User2 registered")

  // Get all parking locations
  console.log("\nGetting all parking locations...")
  const locationIds = await parkingSystem.getAllLocationIds()
  console.log(
    "Location IDs:",
    locationIds.map((id) => id.toString()),
  )

  // Get details for each location
  for (const locationId of locationIds) {
    const location = await parkingSystem.getLocationDetails(locationId)
    console.log(`\nLocation ${locationId}:`)
    console.log("Name:", location.name)
    console.log("Address:", location.address_)
    console.log("Total spots:", location.totalSpots.toString())
    console.log("Available spots:", location.availableSpots.toString())
    console.log("Base hourly rate:", ethers.utils.formatEther(location.baseHourlyRate), "ETH")
    console.log("Active:", location.active)

    // Get available spots for this location
    const availableSpots = await parkingSystem.getAvailableSpots(locationId)
    console.log("Available spot IDs:", availableSpots)
  }

  // Create a reservation for user1
  console.log("\nCreating a reservation for user1...")

  // Calculate start time (1 hour from now)
  const startTime = Math.floor(Date.now() / 1000) + 3600
  const duration = 2 // 2 hours

  // Create reservation with crypto payment
  const reservationCost = ethers.utils.parseEther("0.02") // 0.01 ETH per hour * 2 hours

  const tx = await parkingSystem.connect(user1).createReservation(
    1, // locationId (Downtown Parking)
    "A1", // spotId
    startTime,
    duration,
    "crypto", // paymentMethod
    { value: reservationCost }, // Send ETH for payment
  )

  const receipt = await tx.wait()

  // Find the ReservationCreated event to get the reservationId
  const reservationCreatedEvent = receipt.events.find((event) => event.event === "ReservationCreated")
  const reservationId = reservationCreatedEvent.args.reservationId

  console.log("Reservation created with ID:", reservationId)

  // Get reservation details
  const reservationDetails = await parkingSystem.getReservationDetails(reservationId)
  console.log("\nReservation details:")
  console.log("User:", reservationDetails.userAddress)
  console.log("Location ID:", reservationDetails.locationId.toString())
  console.log("Spot ID:", reservationDetails.spotId)
  console.log("Start time:", new Date(reservationDetails.startTime * 1000).toLocaleString())
  console.log("End time:", new Date(reservationDetails.endTime * 1000).toLocaleString())
  console.log("Total cost:", ethers.utils.formatEther(reservationDetails.totalCost), "ETH")
  console.log("Status:", reservationDetails.status)
  console.log("Payment method:", reservationDetails.paymentMethod)

  // Check if spot is now unavailable
  const isSpotAvailable = await parkingSystem.isSpotAvailable(1, "A1", startTime, duration)
  console.log("\nIs spot A1 available for the same time period?", isSpotAvailable)

  // Get user's reservations
  const userReservations = await parkingSystem.getUserReservations(user1.address)
  console.log(
    "\nUser1's reservations:",
    userReservations.map((id) => id.toString()),
  )

  // Extend the reservation
  console.log("\nExtending the reservation...")
  const additionalHours = 1
  const additionalCost = ethers.utils.parseEther("0.01") // 0.01 ETH per hour * 1 hour

  await parkingSystem
    .connect(user1)
    .extendReservation(reservationId, additionalHours, "crypto", { value: additionalCost })

  // Get updated reservation details
  const updatedReservationDetails = await parkingSystem.getReservationDetails(reservationId)
  console.log("\nUpdated reservation details:")
  console.log("End time:", new Date(updatedReservationDetails.endTime * 1000).toLocaleString())
  console.log("Total cost:", ethers.utils.formatEther(updatedReservationDetails.totalCost), "ETH")

  // Cancel the reservation
  console.log("\nCancelling the reservation...")
  await parkingSystem.connect(user1).cancelReservation(reservationId)

  // Get final reservation details
  const finalReservationDetails = await parkingSystem.getReservationDetails(reservationId)
  console.log("\nFinal reservation details:")
  console.log("Status:", finalReservationDetails.status)

  // Check contract balance
  const contractBalance = await payment.getBalance()
  console.log("\nPayment contract balance:", ethers.utils.formatEther(contractBalance), "ETH")

  console.log("\nInteraction completed successfully!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })


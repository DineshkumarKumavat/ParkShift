// Script to deploy the smart contracts

const { ethers } = require("hardhat")

async function main() {
  console.log("Deploying Smart Parking System contracts...")

  // Deploy Payment contract first
  const Payment = await ethers.getContractFactory("Payment")
  const payment = await Payment.deploy()
  await payment.deployed()
  console.log("Payment contract deployed to:", payment.address)

  // Deploy ParkingSystem contract with Payment address
  const ParkingSystem = await ethers.getContractFactory("ParkingSystem")
  const parkingSystem = await ParkingSystem.deploy(payment.address)
  await parkingSystem.deployed()
  console.log("ParkingSystem contract deployed to:", parkingSystem.address)

  // Set ParkingSystem address in Payment contract
  await payment.setParkingSystemAddress(parkingSystem.address)
  console.log("Set ParkingSystem address in Payment contract")

  // Add sample parking locations and spots
  console.log("Adding sample parking locations and spots...")

  // Downtown Parking
  await parkingSystem.addParkingLocation("Downtown Parking", "123 Main St", ethers.utils.parseEther("0.01"))
  console.log("Added Downtown Parking location")

  // Add spots to Downtown Parking
  const spotTypes = ["standard", "handicap", "electric"]
  for (let i = 1; i <= 5; i++) {
    await parkingSystem.addParkingSpot(
      1, // locationId
      `A${i}`, // spotId
      ethers.utils.parseEther("0.01"), // hourlyRate
      spotTypes[i % spotTypes.length], // spotType
    )
    console.log(`Added spot A${i} to Downtown Parking`)
  }

  // City Center Garage
  await parkingSystem.addParkingLocation("City Center Garage", "456 Park Ave", ethers.utils.parseEther("0.015"))
  console.log("Added City Center Garage location")

  // Add spots to City Center Garage
  for (let i = 1; i <= 5; i++) {
    await parkingSystem.addParkingSpot(
      2, // locationId
      `P${i}`, // spotId
      ethers.utils.parseEther("0.015"), // hourlyRate
      spotTypes[i % spotTypes.length], // spotType
    )
    console.log(`Added spot P${i} to City Center Garage`)
  }

  // Riverside Parking
  await parkingSystem.addParkingLocation("Riverside Parking", "789 River Rd", ethers.utils.parseEther("0.008"))
  console.log("Added Riverside Parking location")

  // Add spots to Riverside Parking
  for (let i = 1; i <= 5; i++) {
    await parkingSystem.addParkingSpot(
      3, // locationId
      `R${i}`, // spotId
      ethers.utils.parseEther("0.008"), // hourlyRate
      spotTypes[i % spotTypes.length], // spotType
    )
    console.log(`Added spot R${i} to Riverside Parking`)
  }

  console.log("Deployment and setup completed successfully!")
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })


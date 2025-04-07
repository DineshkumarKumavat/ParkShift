// Integration layer between frontend and smart contracts

const { ethers } = require("ethers")
const ParkingSystemABI = require("../artifacts/contracts/ParkingSystem.sol/ParkingSystem.json").abi
const PaymentABI = require("../artifacts/contracts/Payment.sol/Payment.json").abi

class ParkingSystemIntegration {
  constructor(parkingSystemAddress, paymentAddress, provider) {
    this.provider = provider || new ethers.providers.Web3Provider(window.ethereum)
    this.signer = this.provider.getSigner()
    this.parkingSystem = new ethers.Contract(parkingSystemAddress, ParkingSystemABI, this.signer)
    this.payment = new ethers.Contract(paymentAddress, PaymentABI, this.signer)
  }

  // User functions
  async registerUser(fullName, email, phone) {
    try {
      const tx = await this.parkingSystem.registerUser(fullName, email, phone)
      await tx.wait()
      return { success: true, txHash: tx.hash }
    } catch (error) {
      console.error("Error registering user:", error)
      return { success: false, error: error.message }
    }
  }

  async getUserReservations() {
    try {
      const userAddress = await this.signer.getAddress()
      const reservationIds = await this.parkingSystem.getUserReservations(userAddress)

      const reservations = []
      for (const id of reservationIds) {
        const details = await this.parkingSystem.getReservationDetails(id)

        // Format the reservation data
        reservations.push({
          id: id,
          locationId: details.locationId.toString(),
          spotId: details.spotId,
          startTime: new Date(details.startTime.toNumber() * 1000),
          endTime: new Date(details.endTime.toNumber() * 1000),
          totalCost: ethers.utils.formatEther(details.totalCost),
          status: details.status,
          paymentMethod: details.paymentMethod,
        })
      }

      return { success: true, reservations }
    } catch (error) {
      console.error("Error getting user reservations:", error)
      return { success: false, error: error.message }
    }
  }

  // Parking location functions
  async getAllParkingLocations() {
    try {
      const locationIds = await this.parkingSystem.getAllLocationIds()

      const locations = []
      for (const id of locationIds) {
        const details = await this.parkingSystem.getLocationDetails(id)

        // Format the location data
        locations.push({
          id: id.toString(),
          name: details.name,
          address: details.address_,
          totalSpots: details.totalSpots.toString(),
          availableSpots: details.availableSpots.toString(),
          baseHourlyRate: ethers.utils.formatEther(details.baseHourlyRate),
          active: details.active,
        })
      }

      return { success: true, locations }
    } catch (error) {
      console.error("Error getting parking locations:", error)
      return { success: false, error: error.message }
    }
  }

  async getAvailableSpots(locationId) {
    try {
      const spotIds = await this.parkingSystem.getAvailableSpots(locationId)

      const spots = []
      for (const id of spotIds) {
        const details = await this.parkingSystem.getSpotDetails(locationId, id)

        // Format the spot data
        spots.push({
          id: details.spotId,
          type: details.spotType,
          hourlyRate: ethers.utils.formatEther(details.hourlyRate),
          available: details.available,
        })
      }

      return { success: true, spots }
    } catch (error) {
      console.error("Error getting available spots:", error)
      return { success: false, error: error.message }
    }
  }

  async isSpotAvailable(locationId, spotId, startTime, duration) {
    try {
      // Convert startTime to Unix timestamp if it's a Date object
      if (startTime instanceof Date) {
        startTime = Math.floor(startTime.getTime() / 1000)
      }

      const isAvailable = await this.parkingSystem.isSpotAvailable(locationId, spotId, startTime, duration)
      return { success: true, isAvailable }
    } catch (error) {
      console.error("Error checking spot availability:", error)
      return { success: false, error: error.message }
    }
  }

  // Reservation functions
  async createReservation(locationId, spotId, startTime, duration, paymentMethod) {
    try {
      // Convert startTime to Unix timestamp if it's a Date object
      if (startTime instanceof Date) {
        startTime = Math.floor(startTime.getTime() / 1000)
      }

      // Get spot details to calculate cost
      const spotDetails = await this.parkingSystem.getSpotDetails(locationId, spotId)
      const hourlyRate = spotDetails.hourlyRate
      const totalCost = hourlyRate.mul(ethers.BigNumber.from(duration))

      let tx
      if (paymentMethod === "crypto") {
        // For crypto payments, send ETH with the transaction
        tx = await this.parkingSystem.createReservation(locationId, spotId, startTime, duration, paymentMethod, {
          value: totalCost,
        })
      } else {
        // For other payment methods, no ETH is sent
        tx = await this.parkingSystem.createReservation(locationId, spotId, startTime, duration, paymentMethod)
      }

      const receipt = await tx.wait()

      // Find the ReservationCreated event to get the reservationId
      const reservationCreatedEvent = receipt.events.find((event) => event.event === "ReservationCreated")

      const reservationId = reservationCreatedEvent.args.reservationId

      return {
        success: true,
        txHash: tx.hash,
        reservationId,
        totalCost: ethers.utils.formatEther(totalCost),
      }
    } catch (error) {
      console.error("Error creating reservation:", error)
      return { success: false, error: error.message }
    }
  }

  async cancelReservation(reservationId) {
    try {
      const tx = await this.parkingSystem.cancelReservation(reservationId)
      await tx.wait()
      return { success: true, txHash: tx.hash }
    } catch (error) {
      console.error("Error cancelling reservation:", error)
      return { success: false, error: error.message }
    }
  }

  async extendReservation(reservationId, additionalHours, paymentMethod) {
    try {
      // Get reservation details to calculate additional cost
      const details = await this.parkingSystem.getReservationDetails(reservationId)
      const locationId = details.locationId
      const spotId = details.spotId

      // Get spot details to calculate cost
      const spotDetails = await this.parkingSystem.getSpotDetails(locationId, spotId)
      const hourlyRate = spotDetails.hourlyRate
      const additionalCost = hourlyRate.mul(ethers.BigNumber.from(additionalHours))

      let tx
      if (paymentMethod === "crypto") {
        // For crypto payments, send ETH with the transaction
        tx = await this.parkingSystem.extendReservation(reservationId, additionalHours, paymentMethod, {
          value: additionalCost,
        })
      } else {
        // For other payment methods, no ETH is sent
        tx = await this.parkingSystem.extendReservation(reservationId, additionalHours, paymentMethod)
      }

      await tx.wait()

      return {
        success: true,
        txHash: tx.hash,
        additionalCost: ethers.utils.formatEther(additionalCost),
      }
    } catch (error) {
      console.error("Error extending reservation:", error)
      return { success: false, error: error.message }
    }
  }

  async getReservationDetails(reservationId) {
    try {
      const details = await this.parkingSystem.getReservationDetails(reservationId)

      // Format the reservation data
      const reservation = {
        id: reservationId,
        userAddress: details.userAddress,
        locationId: details.locationId.toString(),
        spotId: details.spotId,
        startTime: new Date(details.startTime.toNumber() * 1000),
        endTime: new Date(details.endTime.toNumber() * 1000),
        totalCost: ethers.utils.formatEther(details.totalCost),
        status: details.status,
        paymentMethod: details.paymentMethod,
      }

      return { success: true, reservation }
    } catch (error) {
      console.error("Error getting reservation details:", error)
      return { success: false, error: error.message }
    }
  }

  // Helper functions
  async connectWallet() {
    try {
      // Request account access
      await window.ethereum.request({ method: "eth_requestAccounts" })

      // Get the connected account
      const accounts = await this.provider.listAccounts()
      const account = accounts[0]

      return { success: true, account }
    } catch (error) {
      console.error("Error connecting wallet:", error)
      return { success: false, error: error.message }
    }
  }

  async getWalletBalance() {
    try {
      const address = await this.signer.getAddress()
      const balance = await this.provider.getBalance(address)
      return { success: true, balance: ethers.utils.formatEther(balance) }
    } catch (error) {
      console.error("Error getting wallet balance:", error)
      return { success: false, error: error.message }
    }
  }
}

module.exports = ParkingSystemIntegration


"use client"

import { useState, useEffect, useCallback } from "react"
import { ethers } from "ethers"
import ParkingSystemABI from "../contracts/abis/ParkingSystem.json"

// Environment variables for contract addresses
const PARKING_SYSTEM_ADDRESS =
  process.env.NEXT_PUBLIC_PARKING_SYSTEM_ADDRESS || "0x512D6F4004f805ca4483b6Eb660b92862f40ca66" // Default for local testing

export type BlockchainState = {
  provider: ethers.providers.Web3Provider | null
  signer: ethers.Signer | null
  parkingContract: ethers.Contract | null
  account: string | null
  isConnected: boolean
  balance: string
  chainId: number | null
  networkName: string
}

export type TransactionResult = {
  success: boolean
  hash?: string
  error?: string
  reservationId?: number
  additionalCost?: string
}

export function useBlockchainIntegration() {
  const [state, setState] = useState<BlockchainState>({
    provider: null,
    signer: null,
    parkingContract: null,
    account: null,
    isConnected: false,
    balance: "0",
    chainId: null,
    networkName: "Not Connected",
  })

  // Initialize provider and contracts
  const initialize = useCallback(async () => {
    if (typeof window !== "undefined" && window.ethereum) {
      try {
        // Create provider
        const provider = new ethers.providers.Web3Provider(window.ethereum)

        // Get network information
        const network = await provider.getNetwork()
        const networkName = getNetworkName(network.chainId)

        // Create contract instances
        const parkingContract = new ethers.Contract(PARKING_SYSTEM_ADDRESS, ParkingSystemABI, provider)

        setState((prev) => ({
          ...prev,
          provider,
          parkingContract,
          chainId: network.chainId,
          networkName,
        }))

        return true
      } catch (error) {
        console.error("Error initializing blockchain:", error)
        return false
      }
    } else {
      console.log("Ethereum object not found, web3 not available")
      return false
    }
  }, [])

  // Connect wallet
  const connectWallet = useCallback(async () => {
    if (!state.provider) {
      const initialized = await initialize()
      if (!initialized) return false
    }

    try {
      if (state.provider) {
        // Request account access
        const accounts = await state.provider.send("eth_requestAccounts", [])
        const account = accounts[0]

        // Get signer
        const signer = state.provider.getSigner()

        // Get balance
        const balance = await state.provider.getBalance(account)
        const formattedBalance = ethers.utils.formatEther(balance)

        // Create contract instances with signer
        const parkingContract = state.parkingContract?.connect(signer) || null

        setState((prev) => ({
          ...prev,
          signer,
          account,
          isConnected: true,
          balance: formattedBalance,
          parkingContract,
        }))

        return true
      }
      return false
    } catch (error) {
      console.error("Error connecting wallet:", error)
      return false
    }
  }, [state.provider, state.parkingContract, initialize])

  // Disconnect wallet
  const disconnectWallet = useCallback(() => {
    setState((prev) => ({
      ...prev,
      signer: null,
      account: null,
      isConnected: false,
      balance: "0",
    }))
    return true
  }, [])

  // Register user
  const registerUser = useCallback(
    async (fullName: string, email: string, phone: string): Promise<TransactionResult> => {
      try {
        if (!state.parkingContract || !state.signer) {
          throw new Error("Contract or signer not initialized")
        }

        const tx = await state.parkingContract.registerUser(fullName, email, phone)
        await tx.wait()

        return {
          success: true,
          hash: tx.hash,
        }
      } catch (error: any) {
        console.error("Error registering user:", error)
        return {
          success: false,
          error: error.message || "Unknown error",
        }
      }
    },
    [state.parkingContract, state.signer],
  )

  // Create reservation
  const createReservation = useCallback(
    async (
      locationId: string,
      spotId: string,
      startTime: Date,
      duration: number,
      paymentMethod: string,
    ): Promise<TransactionResult> => {
      try {
        if (!state.parkingContract || !state.signer) {
          throw new Error("Contract or signer not initialized")
        }

        const startTimeSeconds = Math.floor(startTime.getTime() / 1000)

        const tx = await state.parkingContract.createReservation(
          locationId,
          spotId,
          startTimeSeconds,
          duration,
          paymentMethod,
        )
        const receipt = await tx.wait()

        const event = receipt.events?.find((e: any) => e.event === "ReservationCreated")
        const reservationId = event?.args?.reservationId.toNumber()

        return {
          success: true,
          hash: tx.hash,
          reservationId: reservationId,
        }
      } catch (error: any) {
        console.error("Error creating reservation:", error)
        return {
          success: false,
          error: error.message || "Unknown error",
        }
      }
    },
    [state.parkingContract, state.signer],
  )

  // Cancel reservation
  const cancelReservation = useCallback(
    async (reservationId: string): Promise<TransactionResult> => {
      try {
        if (!state.parkingContract || !state.signer) {
          throw new Error("Contract or signer not initialized")
        }

        const tx = await state.parkingContract.cancelReservation(reservationId)
        await tx.wait()

        return {
          success: true,
          hash: tx.hash,
        }
      } catch (error: any) {
        console.error("Error cancelling reservation:", error)
        return {
          success: false,
          error: error.message || "Unknown error",
        }
      }
    },
    [state.parkingContract, state.signer],
  )

  // Extend reservation
  const extendReservation = useCallback(
    async (reservationId: string, additionalHours: number, paymentMethod: string): Promise<TransactionResult> => {
      try {
        if (!state.parkingContract || !state.signer) {
          throw new Error("Contract or signer not initialized")
        }

        const tx = await state.parkingContract.extendReservation(reservationId, additionalHours, paymentMethod)
        const receipt = await tx.wait()

        const event = receipt.events?.find((e: any) => e.event === "ReservationExtended")
        const additionalCost = event?.args?.additionalCost?.toString() || "0"

        return {
          success: true,
          hash: tx.hash,
          additionalCost: additionalCost,
        }
      } catch (error: any) {
        console.error("Error extending reservation:", error)
        return {
          success: false,
          error: error.message || "Unknown error",
        }
      }
    },
    [state.parkingContract, state.signer],
  )

  // Get user reservations
  const getUserReservations = useCallback(async (): Promise<{
    success: boolean
    reservations?: any[]
    error?: string
  }> => {
    try {
      if (!state.parkingContract || !state.signer) {
        throw new Error("Contract or signer not initialized")
      }

      const userAddress = await state.signer.getAddress()
      const reservationIds = await state.parkingContract.getUserReservations(userAddress)

      const reservations = []
      for (const id of reservationIds) {
        const details = await state.parkingContract.getReservationDetails(id)
        reservations.push({
          id: id.toString(),
          locationId: details.locationId.toString(),
          spotId: details.spotId,
          startTime: new Date(details.startTime * 1000),
          endTime: new Date(details.endTime * 1000),
          totalCost: ethers.utils.formatEther(details.totalAmount),
          status: details.status,
          paymentMethod: details.paymentMethod,
        })
      }

      return { success: true, reservations }
    } catch (error: any) {
      console.error("Error getting user reservations:", error)
      return { success: false, error: error.message || "Unknown error" }
    }
  }, [state.parkingContract, state.signer])

  // Get available spots
  const getAvailableSpots = useCallback(
    async (locationId: string): Promise<{ success: boolean; spots?: any[]; error?: string }> => {
      try {
        if (!state.parkingContract) {
          throw new Error("Contract not initialized")
        }

        const availableSpaceIds = await state.parkingContract.getAvailableParkingSpaces()
        const availableSpots = availableSpaceIds.map((id: ethers.BigNumber) => ({ id: id.toNumber() }))

        return { success: true, spots: availableSpots }
      } catch (error: any) {
        console.error("Error getting available spots:", error)
        return { success: false, error: error.message || "Unknown error" }
      }
    },
    [state.parkingContract],
  )

  // Process crypto payment
  const processCryptoPayment = useCallback(
    async (amount: string, recipientAddress: string): Promise<TransactionResult> => {
      try {
        if (!state.signer) {
          throw new Error("Wallet not connected")
        }

        const amountWei = ethers.utils.parseEther(amount)

        // Send transaction
        const tx = await state.signer.sendTransaction({
          to: recipientAddress,
          value: amountWei,
        })

        await tx.wait()

        return {
          success: true,
          hash: tx.hash,
        }
      } catch (error: any) {
        console.error("Error processing crypto payment:", error)
        return {
          success: false,
          error: error.message || "Unknown error",
        }
      }
    },
    [state.signer],
  )

  // Process payment with Ganache account
  const processGanachePayment = useCallback(
    async (
      amount: string,
      senderAddress: string,
      privateKey: string,
      recipientAddress: string,
    ): Promise<TransactionResult> => {
      try {
        if (!state.provider) {
          throw new Error("Provider not initialized")
        }

        // Create wallet from private key
        const wallet = new ethers.Wallet(privateKey, state.provider)

        // Verify wallet address matches sender address
        if (wallet.address.toLowerCase() !== senderAddress.toLowerCase()) {
          throw new Error("Private key does not match sender address")
        }

        // Get sender balance
        const balance = await state.provider.getBalance(senderAddress)
        const amountWei = ethers.utils.parseEther(amount)

        if (balance.lt(amountWei)) {
          throw new Error("Insufficient balance")
        }

        // Send transaction
        const tx = await wallet.sendTransaction({
          to: recipientAddress,
          value: amountWei,
        })

        await tx.wait()

        return {
          success: true,
          hash: tx.hash,
        }
      } catch (error: any) {
        console.error("Error processing Ganache payment:", error)
        return {
          success: false,
          error: error.message || "Unknown error",
        }
      }
    },
    [state.provider],
  )

  // Initialize on component mount
  useEffect(() => {
    initialize()

    // Setup event listeners for account and network changes
    if (typeof window !== "undefined" && window.ethereum) {
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          disconnectWallet()
        } else if (state.isConnected) {
          setState((prev) => ({
            ...prev,
            account: accounts[0],
          }))
        }
      })

      window.ethereum.on("chainChanged", () => {
        window.location.reload()
      })
    }

    return () => {
      if (typeof window !== "undefined" && window.ethereum) {
        window.ethereum.removeAllListeners()
      }
    }
  }, [initialize, disconnectWallet, state.isConnected])

  // Helper function to get network name
  const getNetworkName = (chainId: number): string => {
    switch (chainId) {
      case 1:
        return "Ethereum Mainnet"
      case 5:
        return "Goerli Testnet"
      case 1337:
        return "Local Testnet"
      default:
        return `Chain ID: ${chainId}`
    }
  }

  return {
    ...state,
    initialize,
    connectWallet,
    disconnectWallet,
    registerUser,
    createReservation,
    cancelReservation,
    extendReservation,
    getUserReservations,
    getAvailableSpots,
    processCryptoPayment,
    processGanachePayment,
  }
}

export default useBlockchainIntegration


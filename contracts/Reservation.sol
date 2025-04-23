// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title Reservation
 * @dev Contract representing a parking reservation
 */
contract Reservation {
    // State variables
    bytes32 public reservationId;
    address public userAddress;
    uint256 public locationId;
    string public spotId;
    uint256 public startTime;
    uint256 public endTime;
    uint256 public duration; // in hours
    uint256 public totalCost;
    string public paymentMethod;
    string public status; // "upcoming", "active", "completed", "cancelled"
    uint256 public createdAt;
    uint256 public lastUpdated;
    
    // Constants
    uint256 private constant SECONDS_PER_HOUR = 3600;
    uint256 private constant FREE_CANCELLATION_WINDOW = 3600; // 1 hour in seconds
    
    // Events
    event ReservationStatusChanged(bytes32 indexed reservationId, string newStatus);
    event ReservationExtended(bytes32 indexed reservationId, uint256 newEndTime, uint256 additionalCost);
    
    // Constructor
    constructor(
        bytes32 _reservationId,
        address _userAddress,
        uint256 _locationId,
        string memory _spotId,
        uint256 _startTime,
        uint256 _duration,
        uint256 _totalCost,
        string memory _paymentMethod
    ) {
        reservationId = _reservationId;
        userAddress = _userAddress;
        locationId = _locationId;
        spotId = _spotId;
        startTime = _startTime;
        duration = _duration;
        endTime = _startTime + (_duration * SECONDS_PER_HOUR);
        totalCost = _totalCost;
        paymentMethod = _paymentMethod;
        createdAt = block.timestamp;
        lastUpdated = block.timestamp;
        
        // Set initial status
        if (block.timestamp >= startTime && block.timestamp < endTime) {
            status = "active";
        } else if (block.timestamp < startTime) {
            status = "upcoming";
        } else {
            status = "completed";
        }
    }
    
    // External functions
    
    /**
     * @dev Update the reservation status based on current time
     */
    function updateStatus() external returns (string memory) {
        if (keccak256(bytes(status)) == keccak256(bytes("cancelled"))) {
            return status;
        }
        
        if (block.timestamp >= endTime) {
            status = "completed";
        } else if (block.timestamp >= startTime) {
            status = "active";
        } else {
            status = "upcoming";
        }
        
        lastUpdated = block.timestamp;
        emit ReservationStatusChanged(reservationId, status);
        
        return status;
    }
    
    /**
     * @dev Cancel the reservation
     */
    function cancel() external {
        require(
            keccak256(bytes(status)) == keccak256(bytes("upcoming")) || 
            keccak256(bytes(status)) == keccak256(bytes("active")),
            "Cannot cancel completed reservation"
        );
        
        status = "cancelled";
        lastUpdated = block.timestamp;
        
        emit ReservationStatusChanged(reservationId, status);
    }
    
    /**
     * @dev Extend the reservation duration
     * @param _additionalHours Additional hours to extend
     * @return uint256 New end time
     */
    function extend(uint256 _additionalHours) external returns (uint256) {
        require(_additionalHours > 0, "Additional hours must be greater than 0");
        require(
            keccak256(bytes(status)) == keccak256(bytes("upcoming")) || 
            keccak256(bytes(status)) == keccak256(bytes("active")),
            "Cannot extend completed or cancelled reservation"
        );
        
        duration += _additionalHours;
        uint256 newEndTime = endTime + (_additionalHours * SECONDS_PER_HOUR);
        endTime = newEndTime;
        lastUpdated = block.timestamp;
        
        // Update status if needed
        if (block.timestamp >= startTime && block.timestamp < endTime) {
            status = "active";
        }
        
        emit ReservationExtended(reservationId, newEndTime, _additionalHours);
        
        return newEndTime;
    }
    
    /**
     * @dev Calculate refund amount for cancellation
     * @return bool Whether the reservation can be cancelled
     * @return uint256 Refund amount
     */
    function calculateRefund() public view returns (bool, uint256) {
        // Cannot cancel completed reservations
        if (keccak256(bytes(status)) == keccak256(bytes("completed"))) {
            return (false, 0);
        }
        
        // Already cancelled
        if (keccak256(bytes(status)) == keccak256(bytes("cancelled"))) {
            return (false, 0);
        }
        
        // If reservation hasn't started yet or is within free cancellation window
        if (block.timestamp < startTime || (block.timestamp - startTime) < FREE_CANCELLATION_WINDOW) {
            return (true, totalCost);
        }
        
        // If reservation is active, partial refund based on remaining time
        if (keccak256(bytes(status)) == keccak256(bytes("active"))) {
            uint256 elapsedHours = (block.timestamp - startTime) / SECONDS_PER_HOUR;
            if (elapsedHours >= duration) {
                return (true, 0); // No refund if full duration used
            }
            
            uint256 remainingHours = duration - elapsedHours;
            uint256 refundAmount = (totalCost * remainingHours) / duration;
            return (true, refundAmount);
        }
        
        return (true, 0);
    }
    
    // View functions
    
    /**
     * @dev Check if the reservation is active
     * @return bool True if active
     */
    function isActive() public view returns (bool) {
        return keccak256(bytes(status)) == keccak256(bytes("active"));
    }
    
    /**
     * @dev Get reservation details
     * @return tuple Reservation details
     */
    function getDetails() public view returns (
        address _userAddress,
        uint256 _locationId,
        string memory _spotId,
        uint256 _startTime,
        uint256 _endTime,
        uint256 _totalCost,
        string memory _status,
        string memory _paymentMethod
    ) {
        return (
            userAddress,
            locationId,
            spotId,
            startTime,
            endTime,
            totalCost,
            status,
            paymentMethod
        );
    }
    
    /**
     * @dev Get user address
     * @return address User address
     */
    function getUserAddress() public view returns (address) {
        return userAddress;
    }
    
    /**
     * @dev Get location ID
     * @return uint256 Location ID
     */
    function getLocationId() public view returns (uint256) {
        return locationId;
    }
    
    /**
     * @dev Get spot ID
     * @return string Spot ID
     */
    function getSpotId() public view returns (string memory) {
        return spotId;
    }
    
    /**
     * @dev Get payment method
     * @return string Payment method
     */
    function getPaymentMethod() public view returns (string memory) {
        return paymentMethod;
    }
}


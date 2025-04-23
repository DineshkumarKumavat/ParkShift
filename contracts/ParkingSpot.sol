// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ParkingSpot
 * @dev Contract representing a single parking spot
 */
contract ParkingSpot {
    // State variables
    string public spotId;
    uint256 public locationId;
    uint256 public hourlyRate;
    string public spotType;
    bool public available;
    
    // Reservation data
    bytes32 public currentReservationId;
    uint256 public reservationStartTime;
    uint256 public reservationEndTime;
    
    // Events
    event SpotReserved(string spotId, uint256 startTime, uint256 endTime, bytes32 reservationId);
    event ReservationCancelled(string spotId, bytes32 reservationId);
    event ReservationExtended(string spotId, uint256 newEndTime, bytes32 reservationId);
    event SpotStatusChanged(string spotId, bool available);
    
    // Constructor
    constructor(string memory _spotId, uint256 _locationId, uint256 _hourlyRate, string memory _spotType) {
        spotId = _spotId;
        locationId = _locationId;
        hourlyRate = _hourlyRate;
        spotType = _spotType;
        available = true;
    }
    
    // External functions
    
    /**
     * @dev Reserve this spot for a specific time period
     * @param _startTime Start time of the reservation
     * @param _endTime End time of the reservation
     * @param _reservationId ID of the reservation
     */
    function reserve(uint256 _startTime, uint256 _endTime, bytes32 _reservationId) external {
        require(available, "Spot is not available");
        require(_startTime < _endTime, "Invalid time period");
        
        available = false;
        currentReservationId = _reservationId;
        reservationStartTime = _startTime;
        reservationEndTime = _endTime;
        
        emit SpotReserved(spotId, _startTime, _endTime, _reservationId);
    }
    
    /**
     * @dev Cancel the current reservation
     */
    function cancelReservation() external {
        require(!available, "Spot is already available");
        require(currentReservationId != bytes32(0), "No active reservation");
        
        bytes32 oldReservationId = currentReservationId;
        
        available = true;
        currentReservationId = bytes32(0);
        reservationStartTime = 0;
        reservationEndTime = 0;
        
        emit ReservationCancelled(spotId, oldReservationId);
    }
    
    /**
     * @dev Extend the current reservation
     * @param _newEndTime New end time for the reservation
     */
    function extendReservation(uint256 _newEndTime) external {
        require(!available, "Spot is already available");
        require(currentReservationId != bytes32(0), "No active reservation");
        require(_newEndTime > reservationEndTime, "New end time must be later than current end time");
        
        reservationEndTime = _newEndTime;
        
        emit ReservationExtended(spotId, _newEndTime, currentReservationId);
    }
    
    /**
     * @dev Set the availability status of the spot
     * @param _available New availability status
     */
    function setAvailable(bool _available) external {
        if (_available && !available) {
            // If making available, clear reservation data
            currentReservationId = bytes32(0);
            reservationStartTime = 0;
            reservationEndTime = 0;
        }
        
        available = _available;
        
        emit SpotStatusChanged(spotId, _available);
    }
    
    /**
     * @dev Update the hourly rate for this spot
     * @param _newHourlyRate New hourly rate
     */
    function updateHourlyRate(uint256 _newHourlyRate) external {
        require(_newHourlyRate > 0, "Hourly rate must be greater than 0");
        hourlyRate = _newHourlyRate;
    }
    
    // View functions
    
    /**
     * @dev Check if the spot is currently available
     * @return bool True if available
     */
    function isAvailable() public view returns (bool) {
        if (!available) {
            return false;
        }
        
        // If there's a reservation but it's in the past, the spot is available
        if (currentReservationId != bytes32(0) && block.timestamp > reservationEndTime) {
            return true;
        }
        
        return available;
    }
    
    /**
     * @dev Check if the spot is available for a specific time period
     * @param _startTime Start time to check
     * @param _endTime End time to check
     * @return bool True if available for the entire period
     */
    function isAvailableForPeriod(uint256 _startTime, uint256 _endTime) public view returns (bool) {
        require(_startTime < _endTime, "Invalid time period");
        
        if (!available) {
            // If there's a current reservation, check if it overlaps with the requested period
            if (currentReservationId != bytes32(0)) {
                // No overlap if:
                // 1. Requested period ends before reservation starts, or
                // 2. Requested period starts after reservation ends
                if (_endTime <= reservationStartTime || _startTime >= reservationEndTime) {
                    return true;
                }
                return false;
            }
            return false;
        }
        
        return true;
    }
    
    /**
     * @dev Get the hourly rate for this spot
     * @return uint256 Hourly rate
     */
    function getHourlyRate() public view returns (uint256) {
        return hourlyRate;
    }
    
    /**
     * @dev Get spot details
     * @return tuple Spot details
     */
    function getDetails() public view returns (
        string memory _spotId,
        string memory _spotType,
        uint256 _hourlyRate,
        bool _available
    ) {
        return (spotId, spotType, hourlyRate, isAvailable());
    }
}


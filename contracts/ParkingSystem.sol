// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title ParkingSystem
 * @dev A comprehensive smart contract for managing a parking reservation system
 * @author v0
 */
contract ParkingSystem {
    // ================ State Variables ================

    address public owner;
    uint256 public parkingSpaceCount;
    uint256 public baseHourlyRate = 0.001 ether; // Default rate: 0.001 ETH per hour
    
    // ================ Structs ================
    
    struct User {
        string fullName;
        string email;
        string phone;
        bool isRegistered;
        uint256 balance;
        uint256[] reservationIds;
    }
    
    struct ParkingSpace {
        uint256 id;
        string location;
        bool isAvailable;
        uint256 hourlyRate;
    }
    
    struct Reservation {
        uint256 id;
        address user;
        uint256 spaceId;
        uint256 startTime;
        uint256 endTime;
        uint256 totalAmount;
        bool isPaid;
        bool isActive;
        bool isCompleted;
        bool isCancelled;
    }
    
    // ================ Mappings ================
    
    mapping(address => User) public users;
    mapping(uint256 => ParkingSpace) public parkingSpaces;
    mapping(uint256 => Reservation) public reservations;
    mapping(address => bool) public admins;
    
    // Counters
    uint256 private reservationCounter;
    
    // ================ Events ================
    
    event UserRegistered(address indexed userAddress, string fullName);
    event ParkingSpaceAdded(uint256 indexed spaceId, string location, uint256 hourlyRate);
    event ParkingSpaceUpdated(uint256 indexed spaceId, string location, uint256 hourlyRate, bool isAvailable);
    event ReservationCreated(uint256 indexed reservationId, address indexed user, uint256 spaceId, uint256 startTime, uint256 endTime);
    event ReservationPaid(uint256 indexed reservationId, address indexed user, uint256 amount);
    event ReservationCancelled(uint256 indexed reservationId, address indexed user);
    event ReservationCompleted(uint256 indexed reservationId, address indexed user);
    event ParkingSessionStarted(uint256 indexed reservationId, address indexed user, uint256 spaceId, uint256 startTime);
    event ParkingSessionEnded(uint256 indexed reservationId, address indexed user, uint256 spaceId, uint256 endTime);
    event FundsDeposited(address indexed user, uint256 amount);
    event FundsWithdrawn(address indexed user, uint256 amount);
    event RateChanged(uint256 newBaseRate);
    
    // ================ Modifiers ================
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only the owner can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(admins[msg.sender] || msg.sender == owner, "Only admins can call this function");
        _;
    }
    
    modifier onlyRegistered() {
        require(users[msg.sender].isRegistered, "User is not registered");
        _;
    }
    
    modifier validParkingSpace(uint256 _spaceId) {
        require(_spaceId > 0 && _spaceId <= parkingSpaceCount, "Invalid parking space ID");
        _;
    }
    
    modifier spaceAvailable(uint256 _spaceId) {
        require(parkingSpaces[_spaceId].isAvailable, "Parking space is not available");
        _;
    }
    
    modifier validReservation(uint256 _reservationId) {
        require(_reservationId > 0 && _reservationId <= reservationCounter, "Invalid reservation ID");
        _;
    }
    
    modifier reservationOwner(uint256 _reservationId) {
        require(reservations[_reservationId].user == msg.sender, "Not the reservation owner");
        _;
    }
    
    // ================ Constructor ================
    
    constructor() {
        owner = msg.sender;
        admins[msg.sender] = true;
    }
    
    // ================ User Management Functions ================
    
    /**
     * @dev Register a new user
     * @param _fullName Full name of the user
     * @param _email Email of the user
     * @param _phone Phone number of the user
     * @return success True if registration was successful
     */
    function registerUser(string memory _fullName, string memory _email, string memory _phone) 
        external 
        returns (bool success) 
    {
        require(!users[msg.sender].isRegistered, "User already registered");
        require(bytes(_fullName).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        users[msg.sender] = User({
            fullName: _fullName,
            email: _email,
            phone: _phone,
            isRegistered: true,
            balance: 0,
            reservationIds: new uint256[](0)
        });
        
        emit UserRegistered(msg.sender, _fullName);
        return true;
    }
    
    /**
     * @dev Update user profile
     * @param _fullName Full name of the user
     * @param _email Email of the user
     * @param _phone Phone number of the user
     * @return success True if update was successful
     */
    function updateUserProfile(string memory _fullName, string memory _email, string memory _phone) 
        external 
        onlyRegistered 
        returns (bool success) 
    {
        require(bytes(_fullName).length > 0, "Name cannot be empty");
        require(bytes(_email).length > 0, "Email cannot be empty");
        
        User storage user = users[msg.sender];
        user.fullName = _fullName;
        user.email = _email;
        user.phone = _phone;
        
        return true;
    }
    
    /**
     * @dev Get user details
     * @param _userAddress Address of the user
     * @return fullName Full name of the user
     * @return email Email of the user
     * @return phone Phone number of the user
     * @return isRegistered Whether the user is registered
     * @return balance Balance of the user
     * @return reservationIds Array of reservation IDs
     */
    function getUserDetails(address _userAddress) 
        external 
        view 
        returns (
            string memory fullName, 
            string memory email, 
            string memory phone, 
            bool isRegistered, 
            uint256 balance, 
            uint256[] memory reservationIds
        ) 
    {
        User storage user = users[_userAddress];
        return (
            user.fullName,
            user.email,
            user.phone,
            user.isRegistered,
            user.balance,
            user.reservationIds
        );
    }
    
    // ================ Parking Space Management Functions ================
    
    /**
     * @dev Add a new parking space
     * @param _location Location of the parking space
     * @param _hourlyRate Hourly rate for the parking space (in wei)
     * @return spaceId ID of the newly added parking space
     */
    function addParkingSpace(string memory _location, uint256 _hourlyRate) 
        external 
        onlyAdmin 
        returns (uint256 spaceId) 
    {
        require(bytes(_location).length > 0, "Location cannot be empty");
        
        parkingSpaceCount++;
        uint256 newSpaceId = parkingSpaceCount;
        
        parkingSpaces[newSpaceId] = ParkingSpace({
            id: newSpaceId,
            location: _location,
            isAvailable: true,
            hourlyRate: _hourlyRate > 0 ? _hourlyRate : baseHourlyRate
        });
        
        emit ParkingSpaceAdded(newSpaceId, _location, parkingSpaces[newSpaceId].hourlyRate);
        return newSpaceId;
    }
    
    /**
     * @dev Update a parking space
     * @param _spaceId ID of the parking space
     * @param _location Location of the parking space
     * @param _hourlyRate Hourly rate for the parking space (in wei)
     * @param _isAvailable Whether the parking space is available
     * @return success True if update was successful
     */
    function updateParkingSpace(
        uint256 _spaceId, 
        string memory _location, 
        uint256 _hourlyRate, 
        bool _isAvailable
    ) 
        external 
        onlyAdmin 
        validParkingSpace(_spaceId) 
        returns (bool success) 
    {
        ParkingSpace storage space = parkingSpaces[_spaceId];
        
        if (bytes(_location).length > 0) {
            space.location = _location;
        }
        
        if (_hourlyRate > 0) {
            space.hourlyRate = _hourlyRate;
        }
        
        space.isAvailable = _isAvailable;
        
        emit ParkingSpaceUpdated(_spaceId, space.location, space.hourlyRate, space.isAvailable);
        return true;
    }
    
    /**
     * @dev Get parking space details
     * @param _spaceId ID of the parking space
     * @return id ID of the parking space
     * @return location Location of the parking space
     * @return isAvailable Whether the parking space is available
     * @return hourlyRate Hourly rate for the parking space (in wei)
     */
    function getParkingSpaceDetails(uint256 _spaceId) 
        external 
        view 
        validParkingSpace(_spaceId) 
        returns (
            uint256 id, 
            string memory location, 
            bool isAvailable, 
            uint256 hourlyRate
        ) 
    {
        ParkingSpace storage space = parkingSpaces[_spaceId];
        return (
            space.id,
            space.location,
            space.isAvailable,
            space.hourlyRate
        );
    }
    
    /**
     * @dev Get all available parking spaces
     * @return availableSpaceIds Array of available parking space IDs
     */
    function getAvailableParkingSpaces() 
        external 
        view 
        returns (uint256[] memory availableSpaceIds) 
    {
        uint256 count = 0;
        
        // Count available spaces
        for (uint256 i = 1; i <= parkingSpaceCount; i++) {
            if (parkingSpaces[i].isAvailable) {
                count++;
            }
        }
        
        // Create array of available space IDs
        uint256[] memory spaceIds = new uint256[](count);
        uint256 index = 0;
        
        for (uint256 i = 1; i <= parkingSpaceCount; i++) {
            if (parkingSpaces[i].isAvailable) {
                spaceIds[index] = i;
                index++;
            }
        }
        
        return spaceIds;
    }
    
    // ================ Reservation Management Functions ================
    
    /**
     * @dev Create a new reservation
     * @param _spaceId ID of the parking space
     * @param _startTime Start time of the reservation (Unix timestamp)
     * @param _endTime End time of the reservation (Unix timestamp)
     * @return reservationId ID of the newly created reservation
     */
    function createReservation(uint256 _spaceId, uint256 _startTime, uint256 _endTime) 
        external 
        onlyRegistered 
        validParkingSpace(_spaceId) 
        spaceAvailable(_spaceId) 
        returns (uint256 reservationId) 
    {
        require(_startTime > block.timestamp, "Start time must be in the future");
        require(_endTime > _startTime, "End time must be after start time");
        
        // Calculate duration in hours (rounded up)
        uint256 durationInSeconds = _endTime - _startTime;
        uint256 durationInHours = (durationInSeconds + 3599) / 3600; // Round up
        
        // Calculate total amount
        uint256 hourlyRate = parkingSpaces[_spaceId].hourlyRate;
        uint256 totalAmount = hourlyRate * durationInHours;
        
        // Create reservation
        reservationCounter++;
        uint256 newReservationId = reservationCounter;
        
        reservations[newReservationId] = Reservation({
            id: newReservationId,
            user: msg.sender,
            spaceId: _spaceId,
            startTime: _startTime,
            endTime: _endTime,
            totalAmount: totalAmount,
            isPaid: false,
            isActive: false,
            isCompleted: false,
            isCancelled: false
        });
        
        // Update parking space availability
        parkingSpaces[_spaceId].isAvailable = false;
        
        // Add reservation to user's list
        users[msg.sender].reservationIds.push(newReservationId);
        
        emit ReservationCreated(newReservationId, msg.sender, _spaceId, _startTime, _endTime);
        return newReservationId;
    }
    
    /**
     * @dev Pay for a reservation
     * @param _reservationId ID of the reservation
     * @return success True if payment was successful
     */
    function payForReservation(uint256 _reservationId) 
        external 
        payable 
        onlyRegistered 
        validReservation(_reservationId) 
        reservationOwner(_reservationId) 
        returns (bool success) 
    {
        Reservation storage reservation = reservations[_reservationId];
        
        require(!reservation.isPaid, "Reservation is already paid");
        require(!reservation.isCancelled, "Reservation is cancelled");
        require(msg.value >= reservation.totalAmount, "Insufficient payment amount");
        
        // Mark reservation as paid
        reservation.isPaid = true;
        
        // Refund excess payment if any
        uint256 excess = msg.value - reservation.totalAmount;
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
        
        emit ReservationPaid(_reservationId, msg.sender, reservation.totalAmount);
        return true;
    }
    
    /**
     * @dev Cancel a reservation
     * @param _reservationId ID of the reservation
     * @return success True if cancellation was successful
     */
    function cancelReservation(uint256 _reservationId) 
        external 
        onlyRegistered 
        validReservation(_reservationId) 
        reservationOwner(_reservationId) 
        returns (bool success) 
    {
        Reservation storage reservation = reservations[_reservationId];
        
        require(!reservation.isActive, "Cannot cancel an active reservation");
        require(!reservation.isCompleted, "Cannot cancel a completed reservation");
        require(!reservation.isCancelled, "Reservation is already cancelled");
        
        // Mark reservation as cancelled
        reservation.isCancelled = true;
        
        // Make parking space available again
        parkingSpaces[reservation.spaceId].isAvailable = true;
        
        // Refund payment if already paid
        if (reservation.isPaid) {
            payable(msg.sender).transfer(reservation.totalAmount);
        }
        
        emit ReservationCancelled(_reservationId, msg.sender);
        return true;
    }
    
    /**
     * @dev Start a parking session
     * @param _reservationId ID of the reservation
     * @return success True if session start was successful
     */
    function startParkingSession(uint256 _reservationId) 
        external 
        onlyRegistered 
        validReservation(_reservationId) 
        reservationOwner(_reservationId) 
        returns (bool success) 
    {
        Reservation storage reservation = reservations[_reservationId];
        
        require(reservation.isPaid, "Reservation is not paid");
        require(!reservation.isActive, "Parking session is already active");
        require(!reservation.isCompleted, "Reservation is already completed");
        require(!reservation.isCancelled, "Reservation is cancelled");
        
        // Mark reservation as active
        reservation.isActive = true;
        reservation.startTime = block.timestamp; // Update start time to current time
        
        emit ParkingSessionStarted(_reservationId, msg.sender, reservation.spaceId, block.timestamp);
        return true;
    }
    
    /**
     * @dev End a parking session
     * @param _reservationId ID of the reservation
     * @return success True if session end was successful
     */
    function endParkingSession(uint256 _reservationId) 
        external 
        onlyRegistered 
        validReservation(_reservationId) 
        reservationOwner(_reservationId) 
        returns (bool success) 
    {
        Reservation storage reservation = reservations[_reservationId];
        
        require(reservation.isActive, "Parking session is not active");
        require(!reservation.isCompleted, "Reservation is already completed");
        
        // Mark reservation as completed
        reservation.isActive = false;
        reservation.isCompleted = true;
        reservation.endTime = block.timestamp; // Update end time to current time
        
        // Make parking space available again
        parkingSpaces[reservation.spaceId].isAvailable = true;
        
        emit ParkingSessionEnded(_reservationId, msg.sender, reservation.spaceId, block.timestamp);
        emit ReservationCompleted(_reservationId, msg.sender);
        return true;
    }
    
    /**
     * @dev Get reservation details
     * @param _reservationId ID of the reservation
     * @return id ID of the reservation
     * @return user Address of the user
     * @return spaceId ID of the parking space
     * @return startTime Start time of the reservation
     * @return endTime End time of the reservation
     * @return totalAmount Total amount for the reservation
     * @return isPaid Whether the reservation is paid
     * @return isActive Whether the reservation is active
     * @return isCompleted Whether the reservation is completed
     * @return isCancelled Whether the reservation is cancelled
     */
    function getReservationDetails(uint256 _reservationId) 
        external 
        view 
        validReservation(_reservationId) 
        returns (
            uint256 id,
            address user,
            uint256 spaceId,
            uint256 startTime,
            uint256 endTime,
            uint256 totalAmount,
            bool isPaid,
            bool isActive,
            bool isCompleted,
            bool isCancelled
        ) 
    {
        Reservation storage reservation = reservations[_reservationId];
        return (
            reservation.id,
            reservation.user,
            reservation.spaceId,
            reservation.startTime,
            reservation.endTime,
            reservation.totalAmount,
            reservation.isPaid,
            reservation.isActive,
            reservation.isCompleted,
            reservation.isCancelled
        );
    }
    
    /**
     * @dev Get user's reservations
     * @param _userAddress Address of the user
     * @return userReservationIds Array of user's reservation IDs
     */
    function getUserReservations(address _userAddress) 
        external 
        view 
        returns (uint256[] memory userReservationIds) 
    {
        return users[_userAddress].reservationIds;
    }
    
    // ================ Payment and Balance Management Functions ================
    
    /**
     * @dev Deposit funds to user's balance
     * @return success True if deposit was successful
     */
    function depositFunds() 
        external 
        payable 
        onlyRegistered 
        returns (bool success) 
    {
        require(msg.value > 0, "Deposit amount must be greater than 0");
        
        users[msg.sender].balance += msg.value;
        
        emit FundsDeposited(msg.sender, msg.value);
        return true;
    }
    
    /**
     * @dev Withdraw funds from user's balance
     * @param _amount Amount to withdraw (in wei)
     * @return success True if withdrawal was successful
     */
    function withdrawFunds(uint256 _amount) 
        external 
        onlyRegistered 
        returns (bool success) 
    {
        require(_amount > 0, "Withdrawal amount must be greater than 0");
        require(users[msg.sender].balance >= _amount, "Insufficient balance");
        
        users[msg.sender].balance -= _amount;
        payable(msg.sender).transfer(_amount);
        
        emit FundsWithdrawn(msg.sender, _amount);
        return true;
    }
    
    /**
     * @dev Pay for a reservation using user's balance
     * @param _reservationId ID of the reservation
     * @return success True if payment was successful
     */
    function payForReservationWithBalance(uint256 _reservationId) 
        external 
        onlyRegistered 
        validReservation(_reservationId) 
        reservationOwner(_reservationId) 
        returns (bool success) 
    {
        Reservation storage reservation = reservations[_reservationId];
        
        require(!reservation.isPaid, "Reservation is already paid");
        require(!reservation.isCancelled, "Reservation is cancelled");
        require(users[msg.sender].balance >= reservation.totalAmount, "Insufficient balance");
        
        // Deduct from user's balance
        users[msg.sender].balance -= reservation.totalAmount;
        
        // Mark reservation as paid
        reservation.isPaid = true;
        
        emit ReservationPaid(_reservationId, msg.sender, reservation.totalAmount);
        return true;
    }
    
    // ================ Admin Functions ================
    
    /**
     * @dev Add an admin
     * @param _adminAddress Address of the admin to add
     * @return success True if admin was added successfully
     */
    function addAdmin(address _adminAddress) 
        external 
        onlyOwner 
        returns (bool success) 
    {
        require(_adminAddress != address(0), "Invalid address");
        require(!admins[_adminAddress], "Already an admin");
        
        admins[_adminAddress] = true;
        return true;
    }
    
    /**
     * @dev Remove an admin
     * @param _adminAddress Address of the admin to remove
     * @return success True if admin was removed successfully
     */
    function removeAdmin(address _adminAddress) 
        external 
        onlyOwner 
        returns (bool success) 
    {
        require(_adminAddress != owner, "Cannot remove owner as admin");
        require(admins[_adminAddress], "Not an admin");
        
        admins[_adminAddress] = false;
        return true;
    }
    
    /**
     * @dev Set base hourly rate
     * @param _newBaseRate New base hourly rate (in wei)
     * @return success True if rate was set successfully
     */
    function setBaseHourlyRate(uint256 _newBaseRate) 
        external 
        onlyAdmin 
        returns (bool success) 
    {
        require(_newBaseRate > 0, "Rate must be greater than 0");
        
        baseHourlyRate = _newBaseRate;
        
        emit RateChanged(_newBaseRate);
        return true;
    }
    
    /**
     * @dev Withdraw contract balance (only owner)
     * @param _amount Amount to withdraw (in wei)
     * @return success True if withdrawal was successful
     */
    function withdrawContractBalance(uint256 _amount) 
        external 
        onlyOwner 
        returns (bool success) 
    {
        require(_amount > 0, "Withdrawal amount must be greater than 0");
        require(_amount <= address(this).balance, "Insufficient contract balance");
        
        payable(owner).transfer(_amount);
        return true;
    }
    
    /**
     * @dev Get contract balance
     * @return balance Contract balance (in wei)
     */
    function getContractBalance() 
        external 
        view 
        onlyAdmin 
        returns (uint256 balance) 
    {
        return address(this).balance;
    }
    
    // ================ Fallback and Receive Functions ================
    
    // Fallback function - called when msg.data is not empty
    fallback() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
    
    // Receive function - called when msg.data is empty
    receive() external payable {
        emit FundsDeposited(msg.sender, msg.value);
    }
}


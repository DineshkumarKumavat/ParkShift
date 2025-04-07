// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

/**
 * @title Payment
 * @dev Contract for handling payments and refunds
 */
contract Payment {
    // State variables
    address public owner;
    address public parkingSystemAddress;
    
    // Payment records
    struct PaymentRecord {
        address user;
        uint256 amount;
        string paymentMethod;
        uint256 timestamp;
        bytes32 reservationId;
    }
    
    mapping(bytes32 => PaymentRecord) public payments;
    bytes32[] public paymentIds;
    
    // Events
    event PaymentReceived(address indexed user, uint256 amount, string paymentMethod, bytes32 paymentId);
    event RefundProcessed(address indexed user, uint256 amount, string paymentMethod, bytes32 paymentId);
    event WithdrawalMade(address indexed to, uint256 amount);
    
    // Modifiers
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyParkingSystem() {
        require(msg.sender == parkingSystemAddress, "Only parking system can call this function");
        _;
    }
    
    // Constructor
    constructor() {
        owner = msg.sender;
    }
    
    // External functions
    
    /**
     * @dev Set the parking system address
     * @param _parkingSystemAddress Address of the parking system contract
     */
    function setParkingSystemAddress(address _parkingSystemAddress) external onlyOwner {
        require(_parkingSystemAddress != address(0), "Invalid address");
        parkingSystemAddress = _parkingSystemAddress;
    }
    
    /**
     * @dev Process a crypto payment
     * @param _user User making the payment
     * @param _amount Amount to be paid
     */
    function processCryptoPayment(address _user, uint256 _amount) external payable onlyParkingSystem {
        require(msg.value >= _amount, "Insufficient payment");
        
        bytes32 paymentId = keccak256(abi.encodePacked(_user, _amount, "crypto", block.timestamp));
        
        PaymentRecord memory newPayment = PaymentRecord({
            user: _user,
            amount: _amount,
            paymentMethod: "crypto",
            timestamp: block.timestamp,
            reservationId: bytes32(0) // Will be updated by the parking system
        });
        
        payments[paymentId] = newPayment;
        paymentIds.push(paymentId);
        
        emit PaymentReceived(_user, _amount, "crypto", paymentId);
        
        // Refund excess payment
        if (msg.value > _amount) {
            payable(_user).transfer(msg.value - _amount);
        }
    }
    
    /**
     * @dev Record a non-crypto payment (processed off-chain)
     * @param _user User making the payment
     * @param _amount Amount paid
     * @param _paymentMethod Payment method used
     */
    function recordPayment(address _user, uint256 _amount, string memory _paymentMethod) external onlyParkingSystem {
        bytes32 paymentId = keccak256(abi.encodePacked(_user, _amount, _paymentMethod, block.timestamp));
        
        PaymentRecord memory newPayment = PaymentRecord({
            user: _user,
            amount: _amount,
            paymentMethod: _paymentMethod,
            timestamp: block.timestamp,
            reservationId: bytes32(0) // Will be updated by the parking system
        });
        
        payments[paymentId] = newPayment;
        paymentIds.push(paymentId);
        
        emit PaymentReceived(_user, _amount, _paymentMethod, paymentId);
    }
    
    /**
     * @dev Process a refund
     * @param _user User to refund
     * @param _amount Amount to refund
     * @param _paymentMethod Original payment method
     */
    function processRefund(address _user, uint256 _amount, string memory _paymentMethod) external onlyParkingSystem {
        if (keccak256(bytes(_paymentMethod)) == keccak256(bytes("crypto"))) {
            require(address(this).balance >= _amount, "Insufficient contract balance for refund");
            payable(_user).transfer(_amount);
        }
        
        bytes32 refundId = keccak256(abi.encodePacked(_user, _amount, _paymentMethod, "refund", block.timestamp));
        
        emit RefundProcessed(_user, _amount, _paymentMethod, refundId);
    }
    
    /**
     * @dev Link a payment to a reservation
     * @param _paymentId Payment ID
     * @param _reservationId Reservation ID
     */
    function linkPaymentToReservation(bytes32 _paymentId, bytes32 _reservationId) external onlyParkingSystem {
        require(payments[_paymentId].user != address(0), "Payment does not exist");
        
        payments[_paymentId].reservationId = _reservationId;
    }
    
    /**
     * @dev Withdraw funds from the contract
     * @param _to Address to send funds to
     * @param _amount Amount to withdraw
     */
    function withdraw(address payable _to, uint256 _amount) external onlyOwner {
        require(_to != address(0), "Invalid address");
        require(_amount > 0 && _amount <= address(this).balance, "Invalid amount");
        
        _to.transfer(_amount);
        
        emit WithdrawalMade(_to, _amount);
    }
    
    /**
     * @dev Get contract balance
     * @return uint256 Contract balance
     */
    function getBalance() external view returns (uint256) {
        return address(this).balance;
    }
    
    /**
     * @dev Get payment details
     * @param _paymentId Payment ID
     * @return tuple Payment details
     */
    function getPaymentDetails(bytes32 _paymentId) external view returns (
        address user,
        uint256 amount,
        string memory paymentMethod,
        uint256 timestamp,
        bytes32 reservationId
    ) {
        require(payments[_paymentId].user != address(0), "Payment does not exist");
        
        PaymentRecord storage payment = payments[_paymentId];
        return (
            payment.user,
            payment.amount,
            payment.paymentMethod,
            payment.timestamp,
            payment.reservationId
        );
    }
    
    /**
     * @dev Get all payment IDs
     * @return bytes32[] Array of payment IDs
     */
    function getAllPaymentIds() external view returns (bytes32[] memory) {
        return paymentIds;
    }
    
    // Fallback and receive functions to accept ETH
    receive() external payable {}
    fallback() external payable {}
}


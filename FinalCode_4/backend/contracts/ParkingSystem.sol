// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

contract ParkingSystem {
    address public admin;
    uint public ratePerHour = 0.01 ether;
    uint public lotCount;

    struct ParkingLot {
        uint id;
        uint totalSpots;
        uint[] availableSpots;
    }

    struct Booking {
        address user;
        uint lotId;
        uint spotId;
        uint startTime;
        uint duration;
        uint amountPaid;
        uint reservationTime;
        uint reminderBefore;
    }

    mapping(uint => ParkingLot) public parkingLots;
    mapping(uint => mapping(uint => Booking)) public bookings;
    mapping(address => Booking[]) public userHistory;

    event SpotBooked(
        address indexed user,
        uint lotId,
        uint spotId,
        uint startTime,
        uint duration,
        uint amountPaid,
        uint reservationTime,
        uint reminderBefore
    );

    event SpotReleased(uint lotId, uint spotId);

    constructor() {
        admin = msg.sender;

        for (uint i = 1; i <= 6; i++) {
            lotCount++;
            uint[] memory spotIds = new uint[](5);
            for (uint j = 0; j < 5; j++) {
                spotIds[j] = j + 1;
            }
            parkingLots[lotCount] = ParkingLot(lotCount, 5, spotIds);
        }
    }

    function getAvailableSpotsByLot(uint lotId) public view returns (uint[] memory) {
        return parkingLots[lotId].availableSpots;
    }

    function getLotDetails(uint lotId) public view returns (uint lotID, uint total, uint available) {
        ParkingLot memory lot = parkingLots[lotId];
        return (lot.id, lot.totalSpots, lot.availableSpots.length);
    }

    function bookSpot(
        uint lotId,
        uint spotId,
        uint durationHours,
        address payable recipient,
        uint reservationTime,
        uint reminderBefore
    ) external payable {
        require(durationHours > 0, "Duration must be > 0");
        require(lotId > 0 && lotId <= lotCount, "Invalid lot");

        uint cost = durationHours * ratePerHour;
        require(msg.value >= cost, "Insufficient ETH");

        ParkingLot storage lot = parkingLots[lotId];
        bool spotFound = false;

        for (uint i = 0; i < lot.availableSpots.length; i++) {
            if (lot.availableSpots[i] == spotId) {
                spotFound = true;
                lot.availableSpots[i] = lot.availableSpots[lot.availableSpots.length - 1];
                lot.availableSpots.pop();
                break;
            }
        }

        require(spotFound, "Spot not available in this lot");

        bookings[lotId][spotId] = Booking(
            msg.sender,
            lotId,
            spotId,
            block.timestamp,
            durationHours * 1 hours,
            msg.value,
            reservationTime,
            reminderBefore
        );

        userHistory[msg.sender].push(bookings[lotId][spotId]);

        (bool sent, ) = recipient.call{value: msg.value}("");
        require(sent, "Failed to send ETH to recipient");

        emit SpotBooked(
            msg.sender,
            lotId,
            spotId,
            block.timestamp,
            durationHours * 1 hours,
            msg.value,
            reservationTime,
            reminderBefore
        );
    }

    function releaseSpot(uint lotId, uint spotId) external {
        Booking memory b = bookings[lotId][spotId];
        require(b.user == msg.sender || msg.sender == admin, "Unauthorized");
        require(b.startTime != 0, "Not booked");

        delete bookings[lotId][spotId];
        parkingLots[lotId].availableSpots.push(spotId);

        emit SpotReleased(lotId, spotId);
    }

    function getUserHistory(address user) external view returns (Booking[] memory) {
        return userHistory[user];
    }

    function getBookingDetails(uint lotId, uint spotId) external view returns (Booking memory) {
        return bookings[lotId][spotId];
    }

    function updateRate(uint newRate) external {
        require(msg.sender == admin, "Only admin");
        ratePerHour = newRate;
    }

    function withdraw() external {
        require(msg.sender == admin, "Only admin");
        payable(admin).transfer(address(this).balance);
    }
}

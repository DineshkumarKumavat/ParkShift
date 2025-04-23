/* global BigInt */
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import ParkingSystem from "../abis/ParkingSystem.json";
import { useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Form,
  Button,
  Alert,
  Spinner,
} from "react-bootstrap";
import axios from "axios";

const Payment = () => {
  const [web3, setWeb3] = useState(null);
  const [account, setAccount] = useState("");
  const [contract, setContract] = useState(null);
  const [ethPrice, setEthPrice] = useState(null);
  const [recipient, setRecipient] = useState("");
  const [duration, setDuration] = useState(1);
  const [reservationTime, setReservationTime] = useState("");
  const [reminderTime, setReminderTime] = useState(60);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const navigate = useNavigate();

  const spotInfo = JSON.parse(localStorage.getItem("selectedSpot"));

  useEffect(() => {
    const init = async () => {
      try {
        const loginMode = localStorage.getItem("loginMode");
        const selectedAccount = localStorage.getItem("activeAccount");

        const web3Instance =
          loginMode === "ganache"
            ? new Web3("http://127.0.0.1:7545")
            : new Web3(window.ethereum);

        setWeb3(web3Instance);
        setAccount(selectedAccount);

        const networkId = await web3Instance.eth.net.getId();
        const deployedNetwork = ParkingSystem.networks[networkId];

        if (!deployedNetwork) {
          setError("Smart contract not deployed to this network.");
          return;
        }

        const contractInstance = new web3Instance.eth.Contract(
          ParkingSystem.abi,
          deployedNetwork.address
        );
        setContract(contractInstance);

        const response = await axios.get(
          "https://api.coinbase.com/v2/exchange-rates?currency=ETH"
        );
        const usdRate = parseFloat(response.data.data.rates.USD);
        setEthPrice(usdRate);
      } catch (err) {
        console.error("🔧 Initialization error:", err);
        setError("Failed to load payment setup.");
      } finally {
        setLoading(false);
      }
    };

    init();
  }, []);

  const handlePay = async () => {
    setError("");
    setProcessing(true);

    try {
      if (!spotInfo || !spotInfo.spotId || !duration || !account) {
        setError("⚠️ Spot information missing. Please reselect a spot.");
        setProcessing(false);
        return;
      }

      if (!reservationTime) {
        setError("Please select a reservation start time.");
        setProcessing(false);
        return;
      }

      const ratePerHour = 0.01;
      const ethAmount = (ratePerHour * duration).toFixed(6);
      const weiAmount = web3.utils.toWei(ethAmount, "ether");
      const timestamp = Math.floor(new Date(reservationTime).getTime() / 1000);

      const receipt = await contract.methods
        .bookSpot(
          spotInfo.lotId,
          spotInfo.spotId,
          duration,
          recipient,
          timestamp,
          reminderTime
        )
        .send({
          from: account,
          value: weiAmount,
          gas: 3000000,
        });

      // ✅ Use same predefined lots as ParkingLots.js
      const predefinedLots = [
        {
          id: 1,
          address: "4620 Gordon Rd, Regina, SK",
          lat: 50.4142,
          lng: -104.6343,
        },
        {
          id: 2,
          address: "2401 Victoria Ave E, Regina, SK",
          lat: 50.4481,
          lng: -104.5411,
        },
        {
          id: 3,
          address: "3806 Albert St, Regina, SK",
          lat: 50.4101,
          lng: -104.6183,
        },
        {
          id: 4,
          address: "3737 Wascana Pkwy, Regina, SK",
          lat: 50.4169,
          lng: -104.5884,
        },
        {
          id: 5,
          address: "2010 Albert St, Regina, SK",
          lat: 50.4503,
          lng: -104.6172,
        },
        {
          id: 6,
          address: "1701 Dewdney Ave, Regina, SK",
          lat: 50.4568,
          lng: -104.6211,
        },
      ];

      let lots = [];
      try {
        lots = JSON.parse(localStorage.getItem("parkingLots")) || [];
        if (!Array.isArray(lots) || lots.length !== 6) throw new Error();
      } catch {
        lots = predefinedLots;
        localStorage.setItem("parkingLots", JSON.stringify(predefinedLots));
      }

      const matchingLot = lots.find((l) => Number(l.id) === Number(spotInfo.lotId));
      const lotAddress = matchingLot?.address || "Unavailable";
      const lotLat = matchingLot?.lat ?? null;
      const lotLng = matchingLot?.lng ?? null;

      const tx = {
        txHash: receipt.transactionHash,
        from: account,
        to: recipient,
        spotId: spotInfo.spotId,
        lotId: spotInfo.lotId,
        duration,
        ethPaid: ethAmount,
        usdPaid: ethPrice ? (ethAmount * ethPrice).toFixed(2) : "N/A",
        network: localStorage.getItem("loginMode"),
        reservationTime,
        reminderTime,
        timestamp: new Date().toLocaleString(),
        lotAddress,
        lat: lotLat,
        lng: lotLng,
        reminderScheduled: false,
      };

      const history = JSON.parse(localStorage.getItem("txHistory")) || [];
      history.push(tx);
      localStorage.setItem("txHistory", JSON.stringify(history));

      navigate("/receipt");
    } catch (err) {
      console.error("❌ Payment failed:", err);
      setError("Payment failed. Please try again.");
    }

    setProcessing(false);
  };

  const totalCostETH = (0.01 * duration).toFixed(6);
  const totalCostUSD = ethPrice ? (totalCostETH * ethPrice).toFixed(2) : "Loading...";

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow">
        <h3 className="mb-4">💳 Reserve Parking Spot</h3>

        {error && <Alert variant="danger">{error}</Alert>}
        {loading ? (
          <Spinner animation="border" />
        ) : (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Parking Lot ID</Form.Label>
              <Form.Control value={spotInfo?.lotId || ""} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Spot ID</Form.Label>
              <Form.Control value={spotInfo?.spotId || ""} disabled />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reservation Start Time</Form.Label>
              <Form.Control
                type="datetime-local"
                value={reservationTime}
                onChange={(e) => setReservationTime(e.target.value)}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Reminder Time (Minutes before start)</Form.Label>
              <Form.Control
                type="number"
                value={reminderTime}
                onChange={(e) => setReminderTime(Number(e.target.value))}
                min={5}
                max={1440}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Duration (in Hours)</Form.Label>
              <Form.Control
                type="number"
                value={duration}
                min={1}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Total Cost</Form.Label>
              <Form.Control
                value={`${totalCostETH} ETH (~$${totalCostUSD} USD)`}
                disabled
              />
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Recipient Address</Form.Label>
              <Form.Control
                type="text"
                placeholder="Enter address to send ETH"
                value={recipient}
                onChange={(e) => setRecipient(e.target.value)}
              />
            </Form.Group>

            <Button variant="primary" onClick={handlePay} disabled={processing}>
              {processing ? "Processing..." : "Confirm & Pay"}
            </Button>
          </>
        )}
      </Card>
    </Container>
  );
};

export default Payment;


import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Row, Col } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const Receipt = () => {
  const navigate = useNavigate();
  const history = JSON.parse(localStorage.getItem("txHistory")) || [];
  const tx = history[history.length - 1]; // latest transaction

  const isMetaMask = tx?.network === "metamask";
  const explorerLink = isMetaMask
    ? `https://sepolia.etherscan.io/tx/${tx.txHash}`
    : "#";

  return (
    <Container className="mt-5">
      <Card className="p-4 shadow">
        <h3 className="mb-4">🧾 Booking Receipt</h3>

        {!tx ? (
          <p>No recent transaction found.</p>
        ) : (
          <Row>
            <Col md={6}>
              <p><strong>From:</strong> {tx.from}</p>
              <p><strong>To:</strong> {tx.to}</p>
              <p><strong>Lot ID:</strong> {tx.lotId}</p>
              <p><strong>📍 Address:</strong> {tx.lotAddress || "Unavailable"}</p>
              <p><strong>Spot ID:</strong> {tx.spotId}</p>
              <p><strong>Duration:</strong> {tx.duration} hours</p>
              <p><strong>ETH Paid:</strong> {tx.ethPaid} ETH</p>
              <p><strong>USD Equivalent:</strong> ${tx.usdPaid}</p>
              <p><strong>Reminder:</strong> {tx.reminderTime} mins before</p>
              <p><strong>Network:</strong> {tx.network === "metamask" ? "MetaMask (Sepolia)" : "Ganache"}</p>
              <p><strong>Booking Time:</strong> {tx.timestamp}</p>
              <p><strong>Reservation Starts:</strong> {new Date(tx.reservationTime).toLocaleString()}</p>
              <p><strong>Transaction Hash:</strong> {isMetaMask ? (
                <a href={explorerLink} target="_blank" rel="noopener noreferrer">{tx.txHash}</a>
              ) : (
                <span>{tx.txHash}</span>
              )}</p>

              <div className="text-center mt-3">
                <Button onClick={() => navigate("/history")} variant="dark" className="me-2">
                  View Full History
                </Button>
                <Button onClick={() => navigate("/lots")} variant="primary">
                  Book Another Spot
                </Button>
              </div>
            </Col>

            <Col md={6}>
              {tx.lat != null && tx.lng != null ? (
                <MapContainer
                  center={[tx.lat, tx.lng]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={[tx.lat, tx.lng]}>
                    <Popup>
                      Lot #{tx.lotId} <br />
                      {tx.lotAddress}
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <p className="text-muted">Map not available for this reservation.</p>
              )}
            </Col>
          </Row>
        )}
      </Card>
    </Container>
  );
};

export default Receipt;

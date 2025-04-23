
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, Container, Button, Alert, Row, Col } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const ReservationDetails = () => {
  const { index } = useParams();
  const [reservation, setReservation] = useState(null);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const history = JSON.parse(localStorage.getItem("txHistory")) || [];
      const actualIndex = history.length - parseInt(index) - 1;
      const record = history[actualIndex];

      if (!record) {
        setError("Reservation not found.");
      } else {
        setReservation(record);
      }
    } catch (err) {
      console.error("❌ Failed to load reservation:", err);
      setError("Error fetching reservation details.");
    }
  }, [index]);

  return (
    <Container className="mt-4">
      <Card className="p-4 shadow">
        <h3 className="mb-3">📄 Reservation Details</h3>

        {error ? (
          <Alert variant="danger">{error}</Alert>
        ) : reservation ? (
          <Row>
            <Col md={6}>
              <p><strong>📍 Parking Lot ID:</strong> {reservation.lotId}</p>
              <p><strong>📬 Lot Address:</strong> {reservation.lotAddress || "Unavailable"}</p>
              <p><strong>🚗 Spot ID:</strong> {reservation.spotId}</p>
              <p><strong>⌛ Duration:</strong> {reservation.duration} hours</p>
              <p><strong>📅 Booking Date:</strong> {reservation.timestamp}</p>
              <p><strong>🕒 Reservation Starts:</strong> {new Date(reservation.reservationTime).toLocaleString()}</p>
              <p><strong>⏰ Reminder:</strong> {reservation.reminderTime} minutes before</p>
              <p><strong>💰 ETH Paid:</strong> {reservation.ethPaid} ETH</p>
              <p><strong>💵 USD Paid:</strong> ${reservation.usdPaid}</p>
              <p><strong>🌐 Network:</strong> {reservation.network}</p>
              <p><strong>🔗 Tx Hash:</strong> <code>{reservation.txHash}</code></p>
              <p><strong>👤 From:</strong> {reservation.from}</p>
              <p><strong>📥 To:</strong> {reservation.to}</p>

              <Button
                variant="outline-success"
                className="mb-3"
                onClick={() => {
                  setTimeout(() => {
                    new Notification("🔔 Manual Test", {
                      body: `Triggered manually at ${new Date().toLocaleTimeString()}`,
                    });
                  }, 10000);
                }}
              >
                🔔 Trigger Test Notification (10s)
              </Button>

              <br />
              <Button variant="secondary" onClick={() => navigate("/history")}>
                🔙 Back to History
              </Button>
            </Col>

            <Col md={6}>
              {typeof reservation.lat === "number" && typeof reservation.lng === "number" ? (
                <MapContainer
                  center={[reservation.lat, reservation.lng]}
                  zoom={15}
                  scrollWheelZoom={false}
                  style={{ height: "400px", width: "100%" }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution="&copy; OpenStreetMap contributors"
                  />
                  <Marker position={[reservation.lat, reservation.lng]}>
                    <Popup>
                      <strong>Lot #{reservation.lotId}</strong>
                      <br />
                      {reservation.lotAddress}
                    </Popup>
                  </Marker>
                </MapContainer>
              ) : (
                <Alert variant="info">Map loading or location unavailable.</Alert>
              )}
            </Col>
          </Row>
        ) : (
          <p>Loading reservation...</p>
        )}
      </Card>
    </Container>
  );
};

export default ReservationDetails;


import React from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, ListGroup, Row, Col } from "react-bootstrap";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const TransactionHistory = () => {
  const navigate = useNavigate();
  const history = JSON.parse(localStorage.getItem("txHistory")) || [];

  return (
    <Container className="mt-4">
      <h3 className="mb-4">📜 Transaction History</h3>
      {history.length === 0 ? (
        <p>No reservations yet.</p>
      ) : (
        <ListGroup>
          {history
            .slice()
            .reverse()
            .map((tx, index) => (
              <ListGroup.Item key={index} className="mb-4">
                <Card className="p-3">
                  <Row>
                    <Col md={6}>
                      <p><strong>🪪 Lot ID:</strong> {tx.lotId}</p>
                      <p><strong>📍 Address:</strong> {tx.lotAddress || "Unavailable"}</p>
                      <p><strong>🚗 Spot ID:</strong> {tx.spotId}</p>
                      <p><strong>⌛ Duration:</strong> {tx.duration} hours</p>
                      <p><strong>💰 ETH:</strong> {tx.ethPaid}</p>
                      <p><strong>🕒 Reservation:</strong> {new Date(tx.reservationTime).toLocaleString()}</p>
                      <Button
                        variant="outline-primary"
                        size="sm"
                        onClick={() => navigate(`/reservation/${index}`)}
                      >
                        View Details
                      </Button>
                    </Col>

                    <Col md={6}>
                      {tx.lat != null && tx.lng != null ? (
                        <MapContainer
                          center={[tx.lat, tx.lng]}
                          zoom={14}
                          scrollWheelZoom={false}
                          style={{ height: "250px", width: "100%" }}
                        >
                          <TileLayer
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                            attribution="&copy; OpenStreetMap contributors"
                          />
                          <Marker position={[tx.lat, tx.lng]}>
                            <Popup>
                              {tx.lotAddress || "Parking Lot"}
                            </Popup>
                          </Marker>
                        </MapContainer>
                      ) : (
                        <p>🗺️ Map not available</p>
                      )}
                    </Col>
                  </Row>
                </Card>
              </ListGroup.Item>
            ))}
        </ListGroup>
      )}
    </Container>
  );
};

export default TransactionHistory;

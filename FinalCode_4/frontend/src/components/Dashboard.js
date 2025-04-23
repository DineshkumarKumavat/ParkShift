
import React, { useEffect, useState } from "react";
import { Container, Row, Col, Card, Badge, Button } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FaParking, FaClock, FaMapMarkedAlt } from "react-icons/fa";

const mockSpots = [
  { id: 1, location: "Lot A - Spot 12", available: true },
  { id: 2, location: "Lot B - Spot 03", available: false },
  { id: 3, location: "Lot C - Spot 07", available: true },
  { id: 4, location: "Lot D - Spot 18", available: true },
];

const Dashboard = () => {
  const [spots, setSpots] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setSpots(mockSpots); // simulate fetch
  }, []);

  const handleReserve = (spot) => {
    localStorage.setItem("selectedSpot", JSON.stringify(spot));
    navigate("/payment");
  };

  return (
    <Container className="py-5">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">📍 Available Parking Spots</h2>
        <Button variant="outline-primary" onClick={() => navigate("/history")}>
          View History
        </Button>
      </div>

      <Row>
        {spots.map((spot) => (
          <Col md={6} lg={4} className="mb-4" key={spot.id}>
            <Card className="shadow-sm">
              <Card.Body>
                <div className="d-flex align-items-center mb-2">
                  <FaParking className="text-primary me-2" size={20} />
                  <Card.Title className="mb-0">{spot.location}</Card.Title>
                </div>
                <Card.Text>
                  <FaClock className="me-2" />
                  Duration: 1-3 hrs (extendable)
                </Card.Text>
                <Card.Text>
                  <FaMapMarkedAlt className="me-2" />
                  Zone: {spot.location.split(" ")[1]}
                </Card.Text>
                <Badge bg={spot.available ? "success" : "danger"} className="mb-2">
                  {spot.available ? "Available" : "Occupied"}
                </Badge>
                <div className="d-grid mt-3">
                  <Button
                    variant="primary"
                    disabled={!spot.available}
                    onClick={() => handleReserve(spot)}
                  >
                    Reserve Spot
                  </Button>
                </div>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default Dashboard;

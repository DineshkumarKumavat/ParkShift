import React, { useEffect, useState, useCallback } from "react";
import Web3 from "web3";
import ParkingSystem from "../abis/ParkingSystem.json";
import { useParams, useNavigate } from "react-router-dom";
import {
  Container,
  Card,
  Button,
  Spinner,
  Alert,
  Row,
  Col,
  ListGroup,
  Badge,
} from "react-bootstrap";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import { motion } from "framer-motion";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

const predefinedLots = [
  {
    id: 1,
    name: "Lot #1 - Harbour Landing",
    address: "4620 Gordon Rd, Regina, SK",
    lat: 50.4142,
    lng: -104.6343,
  },
  {
    id: 2,
    name: "Lot #2 - Victoria Ave East",
    address: "2401 Victoria Ave E, Regina, SK",
    lat: 50.4481,
    lng: -104.5411,
  },
  {
    id: 3,
    name: "Lot #3 - South Albert St",
    address: "3806 Albert St, Regina, SK",
    lat: 50.4101,
    lng: -104.6183,
  },
  {
    id: 4,
    name: "Lot #4 - University of Regina",
    address: "3737 Wascana Pkwy, Regina, SK",
    lat: 50.4169,
    lng: -104.5884,
  },
  {
    id: 5,
    name: "Lot #5 - Downtown",
    address: "2010 Albert St, Regina, SK",
    lat: 50.4503,
    lng: -104.6172,
  },
  {
    id: 6,
    name: "Lot #6 - Dewdney Ave",
    address: "1701 Dewdney Ave, Regina, SK",
    lat: 50.4568,
    lng: -104.6211,
  },
];

const SpotSelection = () => {
  const { lotId } = useParams();
  const navigate = useNavigate();
  const [web3, setWeb3] = useState(null);
  const [contract, setContract] = useState(null);
  const [spots, setSpots] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchAvailableSpots = useCallback(async () => {
    try {
      const loginMode = localStorage.getItem("loginMode");
      const provider =
        loginMode === "ganache"
          ? new Web3("http://127.0.0.1:7545")
          : new Web3(window.ethereum);

      setWeb3(provider);

      const networkId = await provider.eth.net.getId();
      const deployedNetwork = ParkingSystem.networks[networkId];
      const instance = new provider.eth.Contract(
        ParkingSystem.abi,
        deployedNetwork.address
      );
      setContract(instance);

      const available = await instance.methods.getAvailableSpotsByLot(lotId).call();
      const availableSet = new Set(available.map(Number));

      const allSpots = Array.from({ length: 5 }, (_, i) => ({
        spotId: i + 1,
        available: availableSet.has(i + 1),
      }));

      setSpots(allSpots);
    } catch (err) {
      console.error("❌", err);
      setError("Could not load spot data.");
    } finally {
      setLoading(false);
    }
  }, [lotId]);

  useEffect(() => {
    fetchAvailableSpots();
  }, [fetchAvailableSpots]);

  const handleSelect = (spotId) => {
    localStorage.setItem("selectedSpot", JSON.stringify({ lotId, spotId }));
    navigate("/payment");
  };

  const lot = predefinedLots.find((l) => Number(l.id) === Number(lotId));

  return (
    <Container className="mt-4">
      <h3 className="mb-4">🅿️ {lot?.name} - Select a Spot</h3>
      {error && <Alert variant="danger">{error}</Alert>}
      {loading ? (
        <Spinner animation="border" />
      ) : (
        <Row>
          <Col md={7}>
            <MapContainer
              center={[lot.lat, lot.lng]}
              zoom={15}
              scrollWheelZoom={false}
              style={{ height: "500px", width: "100%" }}
            >
              <TileLayer
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                attribution="&copy; OpenStreetMap"
              />
              <Marker position={[lot.lat, lot.lng]}>
                <Popup>
                  <strong>{lot.name}</strong><br />
                  📍 {lot.address}
                </Popup>
              </Marker>
            </MapContainer>
          </Col>

          <Col md={5}>
            <ListGroup>
              {spots.map(({ spotId, available }) => (
                <motion.div
                  key={spotId}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: spotId * 0.1 }}
                >
                  <ListGroup.Item className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Spot #{spotId}</strong><br />
                      {available ? (
                        <Badge bg="success" className="me-2">Available</Badge>
                      ) : (
                        <Badge bg="secondary" className="me-2">Reserved</Badge>
                      )}
                      <span>💲0.01 ETH · ⏱ 1 hour</span>
                    </div>
                    <Button
                      variant={available ? "success" : "secondary"}
                      size="sm"
                      onClick={() => available && handleSelect(spotId)}
                      disabled={!available}
                    >
                      Reserve
                    </Button>
                  </ListGroup.Item>
                </motion.div>
              ))}
            </ListGroup>
          </Col>
        </Row>
      )}
    </Container>
  );
};

export default SpotSelection;

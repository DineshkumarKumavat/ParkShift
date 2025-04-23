import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import Web3 from "web3";
import ParkingSystem from "../abis/ParkingSystem.json";
import {
  Container,
  Row,
  Col,
  ListGroup,
  Spinner,
  Alert,
  Button,
} from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import "leaflet/dist/leaflet.css";

// 🔧 Fix Leaflet marker icon paths
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: require("leaflet/dist/images/marker-icon-2x.png"),
  iconUrl: require("leaflet/dist/images/marker-icon.png"),
  shadowUrl: require("leaflet/dist/images/marker-shadow.png"),
});

// ✅ Accurate real-world lot data
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

const ParkingLots = () => {
  const [lots, setLots] = useState([]);
  const [availableSpots, setAvailableSpots] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchData = async () => {
      try {
        const loginMode = localStorage.getItem("loginMode");
        const web3 = loginMode === "ganache"
          ? new Web3("http://127.0.0.1:7545")
          : new Web3(window.ethereum);

        const networkId = await web3.eth.net.getId();
        const deployedNetwork = ParkingSystem.networks[networkId];

        if (!deployedNetwork) throw new Error("Smart contract not deployed.");

        const contract = new web3.eth.Contract(
          ParkingSystem.abi,
          deployedNetwork.address
        );

        const spotCounts = {};
        for (const lot of predefinedLots) {
          const spots = await contract.methods
            .getAvailableSpotsByLot(lot.id)
            .call();
          spotCounts[lot.id] = spots.length;
        }

        setLots(predefinedLots);
        localStorage.setItem("parkingLots", JSON.stringify(predefinedLots));
        setAvailableSpots(spotCounts);
      } catch (err) {
        console.error("🚨 Failed to load lots:", err);
        setError("Failed to load parking lots.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSelectLot = (lot) => {
    localStorage.setItem("selectedLotId", lot.id);
    localStorage.setItem("selectedLotAddress", lot.address);
    navigate(`/spots/${lot.id}`);
  };

  return (
    <Container className="mt-4">
      <h3 className="mb-4">🅿️ Available Parking Lots</h3>
      {error && <Alert variant="danger">{error}</Alert>}

      <Row>
        <Col md={7}>
          <MapContainer
            center={[50.445, -104.618]}
            zoom={13}
            scrollWheelZoom={true}
            style={{ height: "500px", width: "100%" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              attribution="&copy; OpenStreetMap contributors"
            />
            {lots.map((lot) => (
              <Marker key={lot.id} position={{ lat: lot.lat, lng: lot.lng }}>
                <Popup>
                  <strong>{lot.name}</strong><br />
                  📍 {lot.address}<br />
                  🚗 Spots: {availableSpots[lot.id] ?? "Loading..."}<br />
                  <Button
                    variant="outline-primary"
                    size="sm"
                    className="mt-2"
                    onClick={() => handleSelectLot(lot)}
                  >
                    View Spots
                  </Button>
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </Col>

        <Col md={5}>
          {loading ? (
            <Spinner animation="border" />
          ) : (
            <ListGroup>
              {lots.map((lot) => (
                <ListGroup.Item key={lot.id}>
                  <h5>{lot.name}</h5>
                  <p>🪪 ID: {lot.id}</p>
                  <p>📍 {lot.address}</p>
                  <p>🚗 Available Spots: {availableSpots[lot.id]}</p>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleSelectLot(lot)}
                  >
                    View Spots
                  </Button>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </Col>
      </Row>
    </Container>
  );
};

export default ParkingLots;

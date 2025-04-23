
import React, { useState, useEffect } from "react";
import { Container, Card, Table, Button, Modal, Form } from "react-bootstrap";
import { FaTrash, FaPlusCircle, FaEdit } from "react-icons/fa";

const AdminPanel = () => {
  const [spots, setSpots] = useState([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newSpot, setNewSpot] = useState({ location: "", available: true });

  useEffect(() => {
    const saved = JSON.parse(localStorage.getItem("adminSpots")) || [
      { id: 1, location: "Lot A - 12", available: true },
      { id: 2, location: "Lot B - 03", available: false }
    ];
    setSpots(saved);
  }, []);

  const saveSpots = (updated) => {
    setSpots(updated);
    localStorage.setItem("adminSpots", JSON.stringify(updated));
  };

  const handleDelete = (id) => {
    const filtered = spots.filter((s) => s.id !== id);
    saveSpots(filtered);
  };

  const handleAdd = () => {
    const newEntry = {
      ...newSpot,
      id: Date.now(),
      available: newSpot.available === "true" || newSpot.available === true
    };
    const updated = [...spots, newEntry];
    saveSpots(updated);
    setShowAddModal(false);
    setNewSpot({ location: "", available: true });
  };

  return (
    <Container className="py-5">
      <Card className="p-4 shadow-sm">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <h3>⚙️ Admin Spot Management</h3>
          <Button variant="success" onClick={() => setShowAddModal(true)}>
            <FaPlusCircle className="me-2" />
            Add Spot
          </Button>
        </div>

        <Table striped bordered hover responsive>
          <thead>
            <tr>
              <th>ID</th>
              <th>Location</th>
              <th>Status</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {spots.map((spot) => (
              <tr key={spot.id}>
                <td>{spot.id}</td>
                <td>{spot.location}</td>
                <td>
                  <span className={`badge ${spot.available ? "bg-success" : "bg-danger"}`}>
                    {spot.available ? "Available" : "Occupied"}
                  </span>
                </td>
                <td>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => handleDelete(spot.id)}
                  >
                    <FaTrash />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* Add Modal */}
      <Modal show={showAddModal} onHide={() => setShowAddModal(false)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Add Parking Spot</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Location</Form.Label>
            <Form.Control
              type="text"
              placeholder="e.g. Lot D - 15"
              value={newSpot.location}
              onChange={(e) =>
                setNewSpot({ ...newSpot, location: e.target.value })
              }
            />
          </Form.Group>
          <Form.Group className="mb-3">
            <Form.Label>Status</Form.Label>
            <Form.Select
              value={newSpot.available}
              onChange={(e) =>
                setNewSpot({ ...newSpot, available: e.target.value })
              }
            >
              <option value={true}>Available</option>
              <option value={false}>Occupied</option>
            </Form.Select>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleAdd}>
            Add Spot
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default AdminPanel;

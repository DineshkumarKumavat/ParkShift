// src/components/Navbar.js
import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { Container, Nav, Navbar } from "react-bootstrap";

const NavBarComponent = () => {
  const navigate = useNavigate();
  const account = localStorage.getItem("activeAccount");

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <Navbar bg="dark" variant="dark" expand="md" className="mb-4">
      <Container>
        <Navbar.Brand href="#">SmartPark</Navbar.Brand>
        <Navbar.Toggle aria-controls="main-navbar-nav" />
        <Navbar.Collapse id="main-navbar-nav">
          <Nav className="me-auto">
            <NavLink to="/lots" className="nav-link">Book Spot</NavLink>
            <NavLink to="/history" className="nav-link">Transaction History</NavLink>
          </Nav>
          <Nav className="ms-auto">
            <Navbar.Text className="me-3">
              <small><strong>Account:</strong> {account?.slice(0, 6)}...{account?.slice(-4)}</small>
            </Navbar.Text>
            <Nav.Link onClick={logout} className="btn btn-sm btn-outline-warning">Logout</Nav.Link>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
};

export default NavBarComponent;

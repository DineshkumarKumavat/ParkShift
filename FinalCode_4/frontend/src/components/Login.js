// src/components/Login.js
import React, { useEffect, useState } from "react";
import Web3 from "web3";
import { useNavigate } from "react-router-dom";
import { Container, Card, Form, Button, Alert } from "react-bootstrap";

const Login = ({ onLogin }) => {
  const [mode, setMode] = useState("ganache");
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ✅ Keep passwordMap as is (no lowercasing)
  const passwordMap = {
    "0xc06CDed50b809B684a5A2C8918C9E36541DFC865": "ps",
    "0xC78b38c8Cbe39F4fbb3104EC9D82164600E5d4a0": "ps",
    "0xdA36670e4610586b366Aea3eB88FD053bA02869b": "ps",
    "0x715cFc4C666312Cb550E9d9Ef0c6A7e90f1d1983": "ps",
    "0xAedc7D8eBad3b2044352Bc88744f76D9bFF486EF": "ps",
    "0xc1A1861AA40F9E36Fe4D3D300e150019B42De4F7": "ps",
    "0x599907CeDD4fDF1bc093fedb2b86a61fEA6aa849": "ps",
    "0x44AF176625A5E5E11FA7D36EAFb67b45a080B51f": "ps",
    "0x19bc79359e094F6018e4834508873373E4Ea7129": "ps",
    "0x9f9A191b21621c7D6D601C61636D3E051226a71D": "ps"
  };

  useEffect(() => {
    const fetchGanacheAccounts = async () => {
      if (mode === "ganache") {
        try {
          const web3 = new Web3("http://127.0.0.1:7545");
          const accs = await web3.eth.getAccounts();
          setAccounts(accs);
        } catch (err) {
          console.error(err);
          setError("Unable to connect to Ganache.");
        }
      }
    };
    fetchGanacheAccounts();
  }, [mode]);

  const handleGanacheLogin = () => {
    setError("");

    if (!selectedAccount) {
      return setError("Please select an account.");
    }

    const expectedPassword = passwordMap[selectedAccount];
    console.log("Selected Account:", selectedAccount);
    console.log("Password Entered:", password);
    console.log("Expected Password:", expectedPassword);

    if (!expectedPassword || password.trim() !== expectedPassword.trim()) {
      return setError("Invalid password.");
    }

    localStorage.setItem("activeAccount", selectedAccount);
    localStorage.setItem("loginMode", "ganache");

    if (onLogin) onLogin(selectedAccount);
    navigate("/lots");
  };

  const handleMetaMaskLogin = async () => {
    setError("");

    if (!window.ethereum) {
      return setError("MetaMask is not installed.");
    }

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: "0xaa36a7" }] // Sepolia chain
      });

      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
      const selected = accounts[0];

      localStorage.setItem("activeAccount", selected);
      localStorage.setItem("loginMode", "metamask");

      if (onLogin) onLogin(selected);
      navigate("/lots");
    } catch (err) {
      console.error(err);
      setError("MetaMask login failed or user rejected the network switch.");
    }
  };

  return (
    <Container className="mt-5">
      <Card className="p-4 shadow">
        <h3 className="mb-4">Login</h3>

        {error && <Alert variant="danger">{error}</Alert>}

        <Form.Group className="mb-3">
          <Form.Label>Choose Login Method</Form.Label>
          <Form.Select value={mode} onChange={(e) => setMode(e.target.value)}>
            <option value="ganache">Ganache</option>
            <option value="metamask">MetaMask</option>
          </Form.Select>
        </Form.Group>

        {mode === "ganache" && (
          <>
            <Form.Group className="mb-3">
              <Form.Label>Ganache Account</Form.Label>
              <Form.Select value={selectedAccount} onChange={(e) => setSelectedAccount(e.target.value)}>
                <option value="">-- Select Account --</option>
                {accounts.map((acc, idx) => (
                  <option key={idx} value={acc}>
                    {acc}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </Form.Group>

            <Button onClick={handleGanacheLogin} variant="primary">Login with Ganache</Button>
          </>
        )}

        {mode === "metamask" && (
          <Button onClick={handleMetaMaskLogin} variant="warning">
            Connect MetaMask Wallet
          </Button>
        )}
      </Card>
    </Container>
  );
};

export default Login;

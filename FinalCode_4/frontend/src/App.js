// src/App.js
import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

import Login from "./components/Login";
import ParkingLots from "./components/ParkingLots";
import SpotSelection from "./components/SpotSelection";
import Payment from "./components/Payment";
import Receipt from "./components/Receipt";
import TransactionHistory from "./components/TransactionHistory";
import ReservationDetails from "./components/ReservationDetails";
import Navbar from "./components/Navbar";

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem("activeAccount"));

  useEffect(() => {
    const account = localStorage.getItem("activeAccount");
    setIsLoggedIn(!!account);
  }, []);

  const handleLogin = (account) => {
    localStorage.setItem("activeAccount", account);
    setIsLoggedIn(true);
  };

  // 🔔 Global Reminder Scheduler
  useEffect(() => {
    const scheduleReminders = () => {
      let history = JSON.parse(localStorage.getItem("txHistory")) || [];
      const now = Date.now();

      let updated = false;

      const updatedHistory = history.map((reservation) => {
        const reservationTime = new Date(reservation.reservationTime).getTime();
        const reminderMs = reservation.reminderTime * 60 * 1000;
        const triggerAt = reservationTime - reminderMs;
        const delay = triggerAt - now;

        // Only schedule if not already done and still upcoming
        if (reservation.reminderScheduled || delay <= 0 || Notification.permission !== "granted") {
          return reservation;
        }

        setTimeout(() => {
          new Notification("⏰ Parking Reminder", {
            body: `Your reservation (Lot ${reservation.lotId}, Spot ${reservation.spotId}) starts at ${new Date(reservationTime).toLocaleTimeString()}.`,
          });
        }, delay);

        updated = true;
        return { ...reservation, reminderScheduled: true };
      });

      if (updated) {
        localStorage.setItem("txHistory", JSON.stringify(updatedHistory));
      }
    };

    if (Notification.permission === "granted") {
      scheduleReminders();
    } else if (Notification.permission === "default") {
      Notification.requestPermission().then((perm) => {
        if (perm === "granted") {
          scheduleReminders();
        }
      });
    }
  }, []);

  return (
    <Router>
      {isLoggedIn && <Navbar />}
      <Routes>
        <Route path="/" element={<Login onLogin={handleLogin} />} />
        <Route path="/lots" element={isLoggedIn ? <ParkingLots /> : <Navigate to="/" />} />
        <Route path="/spots/:lotId" element={isLoggedIn ? <SpotSelection /> : <Navigate to="/" />} />
        <Route path="/payment" element={isLoggedIn ? <Payment /> : <Navigate to="/" />} />
        <Route path="/receipt" element={isLoggedIn ? <Receipt /> : <Navigate to="/" />} />
        <Route path="/history" element={isLoggedIn ? <TransactionHistory /> : <Navigate to="/" />} />
        <Route path="/reservation/:index" element={isLoggedIn ? <ReservationDetails /> : <Navigate to="/" />} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
};

export default App;

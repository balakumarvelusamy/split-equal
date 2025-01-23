// src/App1.js
import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Header from "./components3/Header";
import BottomNav from "./components3/BottomNav";
import ScanQR from "./pages3/ScanQR";
import CreateQR from "./pages3/CreateQR";
import Profile from "./pages3/Profile";
import History from "./pages3/History";
// import TinyURL from "./pages3/TinyURLGenerator";

const App1 = () => {
  return (
    <div className="centered-container">
      <Header title="QR Scanner" />
      <Routes>
        <Route path="scanqr" element={<ScanQR />} />
        <Route path="createqr" element={<CreateQR />} />
        <Route path="profile" element={<Profile />} />
        <Route path="history" element={<History />} />
        {/* <Route path="smallurl" element={<TinyURL />} /> */}
      </Routes>
      <BottomNav />
    </div>
  );
};

export default App1;

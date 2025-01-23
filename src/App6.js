// src/App1.js
import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Header from "./components6/Header";
import BottomNav from "./components6/BottomNav";
import SIP from "./pages6/SIP";
import EMI from "./pages6/EMI";
import Settings from "./pages6/Settings";

const App1 = () => {
  return (
    <div className="centered-container">
      <Header title="Financial Calculator" />
      <Routes>
        <Route path="sip" element={<SIP />} />
        <Route path="emi" element={<EMI />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default App1;

// src/App1.js
import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Header from "./components5/Header";
import BottomNav from "./components5/BottomNav";
import Home from "./pages5/Home";
import BMI from "./pages5/BMI";
import Settings from "./pages5/Settings";

const App1 = () => {
  return (
    <div className="centered-container">
      <Header title="Weight & BMI Tracker" />
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="BMI" element={<BMI />} />
        <Route path="settings" element={<Settings />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default App1;

// src/App1.js
import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Header from "./components2/Header";
import BottomNav from "./components2/BottomNav";
import Home from "./pages2/Home";
import Profile from "./pages2/Profile";
import ExpenseHistory from "./pages2/ExpenseHistory";
import FriendDetail from "./pages2/FriendDetail";
import Support from "./pages2/Support";

const App1 = () => {
  return (
    <div className="centered-container">
      <Header title="Split Equally" />
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="friendslists" element={<ExpenseHistory />} />
        <Route path="history" element={<ExpenseHistory />} />
        <Route path="friend" element={<FriendDetail />} />
        <Route path="support" element={<Support />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default App1;

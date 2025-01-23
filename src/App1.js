// src/App1.js
import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Header from "./components1/Header";
import BottomNav from "./components1/BottomNav";
import Home from "./pages1/Home";
import Profile from "./pages1/Profile";
import History from "./pages1/History";
import SHistory from "./pages1/History";
import Setting from "./pages1/Setting";
import SharedExpense from "./pages1/SharedExpense";
import "./App.css";

const isLoggedIn = () => {
  return !!localStorage.getItem("loggedInUser");
};
const isGuestUser = () => {
  return !!localStorage.getItem("guestUser");
};
const App1 = () => {
  return (
    <div className="centered-container">
      <Header title="Expense Tracker" />
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="settings" element={<Setting />} />
        <Route path="history" element={<History />} />
        <Route path="sharedhistory" element={<SHistory />} />
        <Route path="sharedexpense" element={<SharedExpense />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default App1;

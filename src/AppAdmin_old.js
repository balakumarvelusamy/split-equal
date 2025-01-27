// src/App1.js
import React, { useEffect, useState } from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Header from "./adminComponents/Header";
import BottomNav from "./adminComponents/BottomNav";
import Dashboard from "./adminPages/Dashboard";
import Shared from "./adminPages/Shared";
import ContactUs from "./adminPages/ContactUs";
import Profile from "./adminPages/Profile";

const App1 = () => {
  const [email, setEmail] = useState("");
  useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (sessionUser) {
      setEmail(sessionUser.email);
    }
  }, []);
  return (
    <div className="centered-container">
      <Header title="Admin" />
      <Routes>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="shared" element={<Shared />} />
        <Route path="contactus" element={<ContactUs />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default App1;

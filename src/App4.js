// src/App1.js
import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Header from "./components4/Header";
import BottomNav from "./components4/BottomNav";
import Home from "./pages4/Home";
import Shared from "./pages4/Shared";
import Setting from "./pages4/Setting";
import Profile from "./pages4/Profile";

const App1 = () => {
  return (
    <div className="centered-container">
      <Header title="My To Do" />
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="shared" element={<Shared />} />
        <Route path="setting" element={<Setting />} />
        <Route path="profile" element={<Profile />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default App1;

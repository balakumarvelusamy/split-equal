// src/App1.js
import React from "react";
import { Route, Routes, Navigate, useLocation } from "react-router-dom";
import Header from "./components7/Header";
import BottomNav from "./components7/BottomNav";
import Home from "./pages7-recipie-ai/Home";
import History from "./pages7-recipie-ai/History";
import CalHistory from "./pages7-recipie-ai/CalHistory";
import Blog from "./pages7-recipie-ai/Blog";
import CalorieCheck from "./pages7-recipie-ai/CalorieCheck";
import Profile from "./pages7-recipie-ai/Profile";

const App1 = () => {
  return (
    <div className="centered-container">
      <Header title="Recipe AI" />
      <Routes>
        <Route path="home" element={<Home />} />
        <Route path="profile" element={<Profile />} />
        <Route path="blog" element={<Blog />} />
        <Route path="caloriecheck" element={<CalorieCheck />} />
        <Route path="history" element={<History />} />
        <Route path="calhistory" element={<CalHistory />} />
      </Routes>
      <BottomNav />
    </div>
  );
};

export default App1;

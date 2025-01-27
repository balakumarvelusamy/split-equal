// Admin/Manage.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";
import Header from "./Manage/Header";
import Footer from "./Manage/Footer";
import BottomNav from "./Manage/BottomNav";
import Contact from "./Manage/Contact";
import AppLists from "./Manage/AppLists";
import Profile from "./Manage/Profile";
import config from "./config.json";
const Manage = () => {
  const location = useLocation();
  const title = location.pathname.includes("profile") ? "Profile" : location.pathname.includes("contact") ? "Contact us" : config.apptitle;

  return (
    <>
      <Header title={title} />
      <main className="container">
        <Routes>
          <Route path="contact" element={<Contact />} />
          <Route path="applists" element={<AppLists />} />
          <Route path="profile" element={<Profile />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
};

export default Manage;

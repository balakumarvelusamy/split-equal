// Admin/Manage.js
import React from "react";
import { BrowserRouter as Router, Route, Routes, useLocation } from "react-router-dom";

import Header from "./Public/Header";
import Footer from "./Public/Footer";
import BottomNav from "./Public/BottomNav";
import PrivacyPolicy from "./Public/PrivacyPolicy";
import Contact from "./Public/Contact";
import config from "./config.json";

const Manage = () => {
  const location = useLocation();
  const title = location.pathname.includes("privacypolicy") ? "Privacy Policy" : location.pathname.includes("contact") ? "Contact us" : config.apptitle;

  return (
    <>
      <Header title={title} />
      <main className="container">
        <Routes>
          <Route path="privacypolicy" element={<PrivacyPolicy />} />
          <Route path="contact" element={<Contact />} />
        </Routes>
      </main>
      <BottomNav />
    </>
  );
};

export default Manage;

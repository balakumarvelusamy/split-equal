// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bottom-nav-recipe bg-myapp-recipe-ai">
    <NavLink to="/contact" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-headset"></i>
      </span>
      <div>Support</div>
    </NavLink>
    <NavLink to="/privacypolicy" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-shield-check"></i>
      </span>
      <div>PrivacyPolicy</div>
    </NavLink>
  </nav>
);

export default BottomNav;

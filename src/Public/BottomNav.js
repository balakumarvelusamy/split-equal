// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bg-myapp">
    {/* <NavLink to="/manage/applists" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-home"></i>
      </span>
      <div>Apps</div>
    </NavLink> */}
    <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-home"></i>
      </span>
      <div>Home</div>
    </NavLink>
    <NavLink to="/public/contact" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-headset"></i>
      </span>
      <div>Support</div>
    </NavLink>
    <NavLink to="/public/privacypolicy" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-shield-check"></i>
      </span>
      <div>PrivacyPolicy</div>
    </NavLink>
  </nav>
);

export default BottomNav;

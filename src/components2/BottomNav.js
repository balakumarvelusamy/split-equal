// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bg-myapp">
    <NavLink to="/app2/home" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-users"></i>
      </span>
      <div>Friends</div>
    </NavLink>
    <NavLink to="/app2/history" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-list"></i>
      </span>
      <div>History</div>
    </NavLink>{" "}
    <NavLink to="/app2/profile" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-settings"></i>
      </span>
      <div>Manage</div>
    </NavLink>
    <NavLink to="/app2/support" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-headset"></i>
      </span>
      <div>Support</div>
    </NavLink>
  </nav>
);

export default BottomNav;

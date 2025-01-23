// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bg-myapp">
    <NavLink to="/app5/home" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i class="fi fi-rr-scale"></i>
      </span>
      <div>Weight Tracker</div>
    </NavLink>{" "}
    <NavLink to="/app5/BMI" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i class="fi fi-rr-running"></i>
      </span>

      <div>BMI</div>
    </NavLink>
    <NavLink to="/app5/settings" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i class="fi fi-rr-settings"></i>
      </span>

      <div>Settings</div>
    </NavLink>
  </nav>
);

export default BottomNav;

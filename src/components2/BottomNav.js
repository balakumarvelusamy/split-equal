// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bg-myapp">
    <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-user"></i>
      </span>
      <div>Friends</div>
    </NavLink>
    <NavLink to="/scan" className={({ isActive }) => (isActive ? "active d-none" : "d-nonewe wi")}>
      <span>
        <i class="fas fa-camera"></i>
      </span>
      <div>Scan</div>
    </NavLink>
    <NavLink to="/groups" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-users"></i>
      </span>
      <div>Groups</div>
    </NavLink>
    <NavLink to="/history" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-list"></i>
      </span>
      <div>History</div>
    </NavLink>{" "}
    <NavLink to="/profile" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-settings"></i>
      </span>
      <div>Manage</div>
    </NavLink>
    <NavLink to="/support" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-lock"></i>
      </span>
      <div>Profile</div>
    </NavLink>
  </nav>
);

export default BottomNav;

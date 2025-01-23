// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bg-myapp">
    {/* <NavLink to="/app3/scanqr" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-qrcode"></i>
      </span>
      <div>QR Scanner</div>
    </NavLink> */}
    <NavLink to="/app3/createqr" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-qrcode"></i>
      </span>
      <div>Create QR</div>
    </NavLink>{" "}
    <NavLink to="/app3/history" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-calendar"></i>
      </span>
      <div>History</div>
    </NavLink>
    {/* <NavLink to="/app3/profile" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-user"></i>
      </span>
      <div>Profile</div>
    </NavLink> */}
  </nav>
);

export default BottomNav;

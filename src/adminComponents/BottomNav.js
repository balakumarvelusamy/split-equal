// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bg-myapp">
    <NavLink to="/admin/dashboard" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-home"></i>
      </span>
      <div>Home</div>
    </NavLink>{" "}
    <NavLink to="/admin/contactus" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-users"></i>
      </span>
      <div>Support Case</div>
    </NavLink>
    <NavLink to="/admin/shared" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-lock"></i>
      </span>
      <div>Approvals</div>
    </NavLink>
  </nav>
);

export default BottomNav;

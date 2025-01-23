// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bg-myapp">
    <NavLink to="/app4/home" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-list"></i>
      </span>
      <div>My List</div>
    </NavLink>{" "}
    {/* <NavLink to="/app4/shared" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-users"></i>
      </span>
      <div>Shared List</div>
    </NavLink> */}
    <NavLink to="/app4/setting" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-settings"></i>
      </span>
      <div>Settings</div>
    </NavLink>
    {/* <NavLink to="/app4/profile" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-user"></i>
      </span>
      <div>Profile</div>
    </NavLink> */}
  </nav>
);

export default BottomNav;

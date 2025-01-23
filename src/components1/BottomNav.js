// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bg-myapp">
    <NavLink to="/app1/home" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-user"></i>
      </span>
      <div>Personal</div>
    </NavLink>
    <NavLink to="/app1/history" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-list"></i>
      </span>
      <div>P.History</div>
    </NavLink>{" "}
    <NavLink to="/app1/sharedexpense" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-users"></i>
      </span>
      <div>Shared</div>
    </NavLink>
    <NavLink to="/app1/sharedhistory" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-list"></i>
      </span>
      <div>S.History</div>
    </NavLink>{" "}
    <NavLink to="/app1/settings" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-settings"></i>
      </span>
      <div>Settings</div>
    </NavLink>
    {/* <NavLink to="/app1/profile" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-user"></i>
      </span>
      <div>Profile</div>
    </NavLink> */}
  </nav>
);

export default BottomNav;

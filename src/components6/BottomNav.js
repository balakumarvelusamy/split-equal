// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bg-myapp">
    <NavLink to="/app6/sip" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i class="fi fi-rr-calculator"></i>
      </span>
      <div>SIP Calculator</div>
    </NavLink>{" "}
    <NavLink to="/app6/emi" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i class="fi fi-rr-bank"></i>
      </span>

      <div>Loan/EMI Calculator</div>
    </NavLink>
    {/* <NavLink to="/app6/settings" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i class="fi fi-rr-settings"></i>
      </span>

      <div>Loan</div>
    </NavLink> */}
  </nav>
);

export default BottomNav;

// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";

const BottomNav = () => (
  <nav className="bottom-nav bottom-nav-recipe bg-myapp-recipe-ai">
    <NavLink to="/app7/home" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i class="fas fa-utensils"></i>
      </span>
      <div>Recipe</div>
    </NavLink>
    <NavLink to="/app7/history" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-list"></i>
      </span>
      <div>History</div>
    </NavLink>
    <NavLink to="/app7/caloriecheck" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i class="fas fa-pizza-slice"></i>
      </span>
      <div>Calorie Check</div>
    </NavLink>
    <NavLink to="/app7/Calhistory" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i class="fas fa-chart-line"></i>
      </span>
      <div>Uploads</div>
    </NavLink>{" "}
    {/* <NavLink to="/app7/blog" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-globe"></i>
      </span>
      <div>Blog</div>
    </NavLink> */}
    <NavLink to="/app7/profile" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-user"></i>
      </span>
      <div>Profile</div>
    </NavLink>
  </nav>
);

export default BottomNav;

// src/components/BottomNav.js
import React from "react";
import { NavLink } from "react-router-dom";
import config from "../config.json";

const BottomNav = () => (
  <>
    <nav className="bottom-nav bottom-nav bg-myapp-recipe-ai">
      <NavLink to="/" className={({ isActive }) => (isActive ? "active" : "")}>
        <span>
          <i className="fi fi-rr-home"></i>
        </span>
        <div>All Apps</div>
      </NavLink>
      <NavLink to="/manage/profile" className={({ isActive }) => (isActive ? "active" : "")}>
        <span>
          <i className="fi fi-rr-user"></i>
        </span>
        <div>Profile</div>
      </NavLink>
      <NavLink to="/manage/contact" className={({ isActive }) => (isActive ? "active" : "")}>
        <span>
          <i className="fi fi-rr-headset"></i>
        </span>
        <div>Support</div>
      </NavLink>

      {/* <NavLink to="/public/privacypolicy" className={({ isActive }) => (isActive ? "active" : "")}>
      <span>
        <i className="fi fi-rr-shield-check"></i>
      </span>
      <div>PrivacyPolicy</div>
    </NavLink> */}
    </nav>
  </>
);

export default BottomNav;

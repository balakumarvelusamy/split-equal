// src/components1/Header.js
import React from "react";
import { Link } from "react-router-dom";
import home from "../images/home.png";
import logo from "../images/splitequal.png";
const Header = ({ title }) =>
  !window.location.pathname.includes("/group/") ? (
    <header className="header bg-myapp">
      <h1 className="titlename bg2-myapp mb-0 px-3 p-3  w-75">{title}</h1>
      {process.env.REACT_APP_ENV === "QA" && <small className="px-1">NonProd</small>}
      <div className="home-link px-3">
        <a className="navbar-brand text-white" href="#">
          <img src={logo} alt="Logo" className="" width="30" />
        </a>
      </div>
    </header>
  ) : (
    // header for group details page
    <header className="header bg-myapp zindexback">
      <h1 className="mb-0 px-3 p-3  w-75"></h1>

      <div className="home-link px-3"></div>
    </header>
  );

export default Header;

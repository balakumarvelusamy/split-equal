// src/components1/Header.js
import React from "react";
import { Link } from "react-router-dom";
import home from "../images/home.png";
const Header = ({ title }) => (
  <header className="header bg-myapp">
    <h1 className="titlename bg-success mb-0 px-3 p-3  w-75">{title}</h1>
    {process.env.REACT_APP_ENV === "QA" && <small className="px-1">NonProd</small>}
    <Link to="/" className="home-link px-3">
      <a className="navbar-brand text-white" href="/">
        <img src={home} alt="Logo" className="" width="30" />
      </a>
    </Link>
  </header>
);

export default Header;

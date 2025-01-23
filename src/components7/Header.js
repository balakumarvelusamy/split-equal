// src/components1/Header.js
import React from "react";
import { Link } from "react-router-dom";
import home from "../images/home.png";
import config from "../config.json";
const Header = ({ title }) => (
  <header className="header bg-myapp-recipe-ai">
    <h1 className="titlename-recipe-ai mb-0 px-3 p-3  w-75">{title}</h1>
    {process.env.REACT_APP_ENV === "QA" && <small className="px-2">NonProd</small>}
    <Link to={config.localhost === "localhost" ? "/app7/home" : "/"} className="home-link px-3 d-none">
      <a className="navbar-brand text-white" href="#">
        <img src={home} alt="Logo" className="" width="30" />
      </a>
    </Link>
  </header>
);

export default Header;

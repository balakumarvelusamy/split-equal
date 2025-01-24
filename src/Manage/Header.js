// src/components1/Header.js
import React from "react";
import { Link } from "react-router-dom";
import logo from "../images/recipeailogo.jpg";
const Header = ({ title }) => (
  <header className="header bg-myapp-recipe-ai ">
    <div className="d-flex justify-content-between align-items-center">
      <div className="flex-grow-1">
        <h1 className="titlename-recipe-ai mb-0 text-nowrap w-100 px-3 p-3 ">{title}</h1>{" "}
      </div>
      <div> {process.env.REACT_APP_ENV === "QA" && <small className="px-2">NP</small>}</div>

      <div className="px-2">
        <img src={logo} alt="Logo" className="rounded" width="40" />
      </div>
    </div>
  </header>
);

export default Header;

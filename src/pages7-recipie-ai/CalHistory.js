import React, { useState, useEffect } from "react";
import { getData_Any2Column } from "../service/APIService";
import CalorieHistoryComponent from "./CalorieHistoryComponent";
import secureLocalStorage from "react-secure-storage";
const RecipeHistory = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve the logged-in user's email from localStorage
  const loggedInUserEmail = JSON.parse(secureLocalStorage.getItem("loggedInUser"))?.email || "guest";
  return (
    <div className="container">
      <CalorieHistoryComponent showLatest={false} />
    </div>
  );
};

export default RecipeHistory;

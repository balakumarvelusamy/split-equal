import React, { useState, useEffect } from "react";
import { getItemsbyType } from "../service/APIService";
import secureLocalStorage from "react-secure-storage";
const RecipeHistory = () => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Retrieve the logged-in user's email from localStorage
  const loggedInUserEmail = JSON.parse(secureLocalStorage.getItem("loggedInUser"))?.email || "guest";

  useEffect(() => {
    const fetchRecipeHistory = async () => {
      try {
        const data = await getItemsbyType("recipe-ai");
        setRecipes(data); // Set the fetched recipes
        setError(null);
      } catch (err) {
        setError("Failed to fetch recipe history. Please try again.");
        console.error("Error fetching recipe history:", err);
      } finally {
        setLoading(false);
      }
    };
    if (loggedInUserEmail !== "guest") {
      fetchRecipeHistory();
    } else {
      setLoading(false);
    }
  }, [loggedInUserEmail]);

  return (
    <div className="container">
      <h6 align="center">AI Recipe from the World</h6>
      {loading ? (
        <p>Loading...</p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : recipes.length === 0 ? (
        <p>No recipes found in your history.</p>
      ) : (
        <div className="recipe-history-list">
          {recipes.map((recipe) => (
            <div key={recipe.id} className="recipe-card border p-1 rounded mt-1">
              <div className="d-flex justify-content-between align-items-center">
                <div> {recipe.image && <img src={recipe.image} alt={recipe.title} className="rounded" style={{ width: "80px", height: "80px", objectFit: "cover" }} />}</div>
                <div className="px-2">
                  <h6 className="mb-0 text-success">{recipe.title && recipe.title.replace(/"/g, "").trim()}</h6>
                  <small>
                    <span>
                      <strong>Cuisine:</strong> {recipe.cuisine}
                    </span>{" "}
                    <span>
                      <strong>Ingredients:</strong> {recipe.ingredients}
                    </span>{" "}
                    <span className="badge text-dark text-muted px-0">{recipe.date}</span>{" "}
                  </small>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default RecipeHistory;

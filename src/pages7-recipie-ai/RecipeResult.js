import React, { useState, useEffect } from "react";
import { getData_Any2Column, formatRecipe } from "../service/APIService";
const RecipeResult = ({ recipe }) => {
  const [formattedRecipe, setFormattedRecipe] = useState(null);

  useEffect(() => {
    if (recipe) {
      const recipeDetails = recipe.candidates?.[0]?.content.parts?.[0]?.text || "No recipe found.";
      setFormattedRecipe(formatRecipe(recipeDetails));
    }
  }, [recipe]);

  return (
    <div className="mt-2 p-2">
      <div>{formattedRecipe}</div>
    </div>
  );
};

export default RecipeResult;

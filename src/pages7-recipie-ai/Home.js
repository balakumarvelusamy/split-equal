import React, { useState, useEffect } from "react";
import RecipeInputForm from "./RecipeInputForm";
import RecipeResult from "./RecipeResult";
import ImageResult from "./ImageResult";
import Loading from "./Loading";
import RecipeHistoryComponent from "./RecipeHistoryComponent";
import { getData, fetchRecipe, generateImage_usingBedrock, addData } from "../service/APIService";
import { v4 as uuid } from "uuid";
import recipeai from "../images/recipeailogo.jpg";
import secureLocalStorage from "react-secure-storage";
import { useNavigate } from "react-router-dom";
const Home = () => {
  const [recipe, setRecipe] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [image, setImage] = useState(null);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const navigate = useNavigate();
  const loggedInUserEmail = secureLocalStorage.getItem("loggedInUserEmail");
  useEffect(() => {
    const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));

    setLoggedInUser(sessionUser);
  }, [loading]);

  const handleFetchRecipe = async (ingredients, cuisine, RecepiePrompt) => {
    setLoading(true);
    setError("");
    try {
      console.log("RecepiePrompt", RecepiePrompt);
      const result = await fetchRecipe(ingredients, cuisine);
      setRecipe(result);
      const recipeText = result.candidates?.[0]?.content?.parts?.[0]?.text || "No recipe found.";
      const nameMatch = recipeText.match(/~(.*?)~/);

      if (nameMatch) {
        const recipeName = nameMatch[1]; // Extracted recipe name
        console.log("Extracted Recipe Name:", recipeName);
        // Call handleFetchImage with the recipe name
        const generatedImage = await handleFetchImage(recipeName);
        console.log("generatedImage", generatedImage);
        await saveRecipeToDB(recipeName, ingredients, cuisine, recipeText, generatedImage);
        setError("");
      } else {
        console.warn("No recipe name found within ~");
      }
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };
  const handleFetchImage = async (recipeName) => {
    try {
      const generatedImage = await generateImage_usingBedrock(recipeName);
      console.log("generatedImage handleFetchImage", generatedImage);
      setImage(generatedImage);
      setError("");
      return generatedImage;
    } catch (error) {
      setError(error.message);
      return null;
    }
  };
  const saveRecipeToDB = async (recipeName, ingredients, cuisine, recipeText, generatedImage) => {
    console.log("saveRecipeToDB ", generatedImage);
    const email = loggedInUser?.email || "guest";
    const addRecipe = {
      id: uuid(), // Unique ID for the recipe
      title: recipeName,
      ingredients,
      cuisine,
      recipeText,
      image: generatedImage ? generatedImage : null, // Base64
      type: "recipe-ai",
      email,
      date: new Date().toISOString().replace("T", " ").split(".")[0], // Current timestamp
    };

    try {
      await addData(addRecipe); // Save to database using addData API
      console.log("Recipe saved successfully:", addRecipe);
    } catch (error) {
      console.error("Error saving recipe to DB:", error);
      setError("");
    }
  };
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out from all apps?")) {
      secureLocalStorage.removeItem("loggedInUser");
      secureLocalStorage.removeItem("guestUser");
      secureLocalStorage.setItem("isLoggedOut", true);
      navigate("/");
    }
  };
  return (
    <div className="container">
      {loggedInUserEmail === "guest" && (
        <div className="d-flex justify-content-between text-small">
          <div className="text-dark">
            <small>Welcome, {(loggedInUser && loggedInUser.name) || "Guest"}!</small>
          </div>
          <div className="mb-0">
            <a className="btn btn-sm w-auto text-danger px-2 mb-0 text-decoration-none " href="/" onClick={handleLogout}>
              <small> Logout </small>
              <span>
                <i className="fas fa-sign-out-alt"></i>
              </span>
            </a>
          </div>
        </div>
      )}
      <div className="">
        <div align="center">
          <span className="">
            <small>Dont know what to Cook?</small>
          </span>
          <p className="fw-bold myapp-color-primary">Let's Curate your Recipe with your Cooking Assistant</p>
        </div>
      </div>
      <div className="p-1 rounded bg-light">
        <RecipeInputForm onFetchRecipe={handleFetchRecipe} />
      </div>
      {error && <p style={{ color: "red" }}>{error}</p>}
      {loading ? (
        <div align="center" className="p-3">
          <Loading />
          <p>
            AI Chef Is Cooking Recipe For You.{" "}
            <span className="px-1">
              <i className="fas fa-spinner fa-spin text-success"></i>
            </span>
          </p>
        </div>
      ) : (
        <>
          <ImageResult image={image} />
          <RecipeResult recipe={recipe} />
          <RecipeHistoryComponent showLatest={true} />
        </>
      )}
    </div>
  );
};

export default Home;

import React, { useState, useEffect } from "react";
import { getData_Any2Column, formatRecipe, deleteData } from "../service/APIService";
import img3 from "../images/frying-pan.gif";
import logo from "../images/pot.gif";
import { Modal, Button } from "react-bootstrap";
import close from "../images/delete.png";
import NutritionComponent from "./NutritionComponent";
const CalorieHistoryComponent = ({ showLatest = false }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [visibleRecipes, setVisibleRecipes] = useState(10); // Number of records to display initially
  const [searchQuery, setSearchQuery] = useState("");
  // Retrieve the logged-in user's email from localStorage
  const loggedInUserEmail = JSON.parse(localStorage.getItem("loggedInUser"))?.email || "guest";

  useEffect(() => {
    const fetchRecipeHistory = async () => {
      try {
        const data = await getData_Any2Column("email", loggedInUserEmail, "type", "recipe-ai-food-calorie");
        console.log("calorie history", data);
        // If `showLatest` is true, limit to the latest 6 recipes
        const sortedRecipes = data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setRecipes(showLatest ? sortedRecipes.slice(0, 6) : sortedRecipes);

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
  }, [loggedInUserEmail, showLatest]);
  const handleShowModal = (recipe) => {
    setSelectedRecipe(recipe);
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedRecipe(null);
  };
  const handleLoadMore = () => {
    setVisibleRecipes((prev) => prev + 10); // Show 10 more records
  };

  const handleDeleteRecipe = async (recipeId) => {
    const confirmDelete = window.confirm("Are you sure you want to delete this recipe?");
    if (!confirmDelete) return;

    try {
      await deleteData(recipeId); // Call the delete API
      setRecipes((prevRecipes) => prevRecipes.filter((recipe) => recipe.id !== recipeId)); // Remove from UI
    } catch (err) {
      console.error("Error deleting recipe:", err);
      setError("Failed to delete the recipe. Please try again.");
    }
  };
  const filteredRecipes = recipes.filter((recipe) => recipe.title.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div>
      <h6 align="left">{showLatest ? "Recent Calorie Check" : "Calorie History"}</h6>
      {showLatest ? (
        ""
      ) : (
        <div className="mb-3">
          <input type="text" className="form-control" placeholder="Search by title..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>
      )}
      {loading ? (
        <p align="center">
          <img src={img3} height={100} />
        </p>
      ) : error ? (
        <p style={{ color: "red" }}>{error}</p>
      ) : recipes.length === 0 ? (
        <p>No recipes found.</p>
      ) : (
        <div className="recipe-history-list">
          {filteredRecipes.slice(0, visibleRecipes).map((recipe) => (
            <div key={recipe.id} className="recipe-card border p-1 rounded mt-1">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex justify-content-start align-items-center">
                  <div>{recipe.image ? <img src={recipe.image} alt={recipe.title} className="rounded" style={{ width: "80px", height: "80px", objectFit: "cover" }} /> : <img src={logo} alt={recipe.title} className="rounded" style={{ width: "80px", height: "80px", objectFit: "cover" }} />}</div>
                  <div className="px-2">
                    <h6 className="mb-0 text-success" style={{ cursor: "pointer" }} onClick={() => handleShowModal(recipe)}>
                      {recipe.title && recipe.title.replace(/"/g, "").trim()}
                    </h6>{" "}
                    <small className="d-none">
                      <p className="badge text-dark text-muted px-0 mb-0">{recipe.date}</p>
                    </small>
                    <small>
                      <span>
                        <div className="mt-2" style={{ maxWidth: "100%", maxHeight: "70px", overflow: "hidden" }}>
                          <div>
                            <span className="badge bg-warning text-dark mx-1">
                              {" "}
                              <i class="fas fa-fire px-1"></i> {recipe.calories}
                            </span>
                            <span className="badge bg-secondary mx-1">
                              <i class="fas fa-seedling px-1"></i>
                              {recipe.carbs}
                            </span>
                          </div>
                          <div className="d-flex justify-content-between">
                            <div>
                              <span className="badge bg-success mx-1">
                                <i class="fas fa-drumstick-bite"></i> {recipe.protein}
                              </span>
                              <span className="badge bg-danger mx-1">
                                <i class="fas fa-cheese px-1"></i> {recipe.fat}
                              </span>
                            </div>
                          </div>
                          <small className="">
                            <p className="badge text-dark text-muted px-0 mb-0">{recipe.date}</p>
                          </small>
                        </div>
                      </span>
                    </small>
                  </div>{" "}
                </div>
                <div className="">
                  {showLatest ? (
                    ""
                  ) : (
                    <button className="btn btn-light text-danger btn-sm " onClick={() => handleDeleteRecipe(recipe.id)}>
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
          {visibleRecipes < filteredRecipes.length && (
            <div align="center" className="mt-3">
              <button className="btn btn-warning p-1" onClick={handleLoadMore}>
                Load More
              </button>
            </div>
          )}
        </div>
      )}

      {selectedRecipe && (
        <Modal show={showModal} onHide={handleCloseModal} centered>
          <div className="modal-header">
            <h5 className="text-success mb-0">{selectedRecipe.title && selectedRecipe.title.replace(/"/g, "").trim()}</h5>
            <a onClick={(e) => setShowModal(false)}>
              <img src={close} alt="Logo" className="" width="30" />
            </a>
          </div>
          <Modal.Body>
            <div>
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  {selectedRecipe.image && (
                    <div align="center">
                      <img src={selectedRecipe.image} alt={selectedRecipe.title} className="rounded mt-2" style={{ maxWidth: "100%", maxHeight: "200px" }} />
                    </div>
                  )}
                </div>
                <div className="p-1 w-100">
                  <NutritionComponent nutritionInfo={selectedRecipe} />
                </div>
              </div>
              <p className="mt-2">
                <strong>Details:</strong> {formatRecipe(selectedRecipe.recipeText)}
              </p>
            </div>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </div>
  );
};

export default CalorieHistoryComponent;

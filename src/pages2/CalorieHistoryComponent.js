import React, { useState, useEffect } from "react";
import { getData_Any2Column, formatRecipe, deleteData } from "../service/APIService";
import img3 from "../images/frying-pan.gif";
import logo from "../images/pot.gif";
import { Modal, Button } from "react-bootstrap";
import close from "../images/delete.png";
import BillItems from "./BillItems";
import secureLocalStorage from "react-secure-storage";
const CalorieHistoryComponent = ({ showLatest = false }) => {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState(null);
  const [visibleRecipes, setVisibleRecipes] = useState(10); // Number of records to display initially
  const [searchQuery, setSearchQuery] = useState("");
  // Retrieve the logged-in user's email from localStorage
  const loggedInUserEmail = JSON.parse(secureLocalStorage.getItem("loggedInUser"))?.email || "guest";

  useEffect(() => {
    const fetchRecipeHistory = async () => {
      try {
        const data = await getData_Any2Column("email", loggedInUserEmail, "type", "splitequal-bill");
        console.log("splitequal-bill", data);
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
          <div className="row">
            {recipes.map((bill, index) => (
              <div key={bill.id || index} className="mb-4 border rounded p-2">
                {/* Header - Shop Name & Date */}
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <h5 className="mb-1">
                      🛍️ <strong>{bill?.items?.shop_name || "Unknown Shop"}</strong>
                    </h5>
                    <p className="mb-0 text-muted">📅 {bill?.date ? new Date(bill.date).toLocaleString() : "No Date"}</p>
                  </div>

                  {/* Optional: Show receipt image if available */}
                  {bill.image && <img src={bill.image} alt="Receipt" className="rounded" style={{ width: "80px", height: "80px", objectFit: "cover" }} />}
                </div>

                {/* Items Table */}
                <BillItems items={bill.items} />

                {/* Optional Delete or Actions */}
                {!showLatest && (
                  <div align="right" className="mt-2">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteRecipe(bill.id)}>
                      <i className="fi fi-rr-trash"></i> Delete
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
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
                  <BillItems nutritionInfo={selectedRecipe} />
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

export default BillItems;

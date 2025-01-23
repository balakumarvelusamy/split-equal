import React, { useState, useEffect } from "react";
import bin from "../images/bin.png";
import uuid from "react-uuid";
import { getExpenseCategory, addExpenseCategory } from "../service/APIService";

const Setting = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newCategory, setNewCategory] = useState(""); // For new category input

  // Fetch categories from the server
  useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const guestUser = JSON.parse(localStorage.getItem("guestUser"));
    const loggedInUserEmail = localStorage.getItem("loggedInUserEmail");
    if (sessionUser && loggedInUserEmail !== "guest") {
      setIsLoggedIn(true);
      setEmail(sessionUser.email);
      setName(sessionUser.name);
    } else {
      setIsLoggedIn(true);
      setEmail(guestUser.email);
      setName(guestUser.name);
    }
    const fetchCategories = async () => {
      setLoading(true);
      try {
        const response = await getExpenseCategory(sessionUser.email);
        setCategories(response.filter((item) => item.type === "expense-category"));
      } catch (err) {
        setError("Failed to fetch categories.");
      }
      setLoading(false);
    };
    if (email !== "guest") {
      fetchCategories();
    }
  }, []);

  const deleteCategory = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this category?");
    if (!isConfirmed) return;
    setLoading(true);
    try {
      await fetch(`${process.env.REACT_APP_SERVICE_URL}/removeitem/${id}`, { method: "DELETE" });
      setCategories(categories.filter((category) => category.id !== id));
      setError("");
    } catch (err) {
      setError("Failed to delete category.");
    }
    setLoading(false);
  };

  const handleAddCategory = async () => {
    if (!newCategory.trim()) {
      alert("Please enter a category name.");
      return;
    }
    // Check if the category already exists (case-insensitive)
    const categoryExists = categories.some((category) => category.category.toLowerCase() === newCategory.trim().toLowerCase());

    if (categoryExists) {
      alert("Category already exists.");
      return;
    }
    const newCategoryPayload = {
      id: uuid(), // Assuming `uuid` is imported and used for unique ID generation
      email,
      date: new Date().toISOString(),
      category: newCategory.toUpperCase(),
      type: "expense-category",
    };

    setLoading(true);
    try {
      await addExpenseCategory(newCategoryPayload);
      setCategories([...categories, newCategoryPayload]); // Add new category to state
      setNewCategory(""); // Clear input field
      setError("");
    } catch (err) {
      setError("Failed to add category.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <div className="mt-2">
          <h6 className="text-right">Manage Categories</h6>
          {email == "guest" ? (
            "Log in Manage/ Add new Categories"
          ) : (
            <>
              {/* New Category Input */}
              <div className="mb-3">
                <input type="text" placeholder="Enter new Custom Category" className="form-control" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} />
                <button className="btn btn-warning" onClick={handleAddCategory} disabled={loading}>
                  Add Custom Category
                </button>
              </div>

              {/* Category List */}
              {loading ? (
                "Please wait.."
              ) : (
                <>
                  {categories.length === 0
                    ? "No Categories Found."
                    : categories.map((category, index) => (
                        <div key={index} className="d-flex align-items-center justify-content-between py-2 border-bottom">
                          <div className="flex-grow-1 me-2">
                            <small>
                              <b>{category.category}</b>
                            </small>
                          </div>
                          <div>
                            <img onClick={() => deleteCategory(category.id)} src={bin} width="20" alt="Delete" />
                          </div>
                        </div>
                      ))}
                </>
              )}
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Setting;

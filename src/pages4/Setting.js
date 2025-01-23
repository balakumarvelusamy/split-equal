import React, { useState, useEffect } from "react";
import uuid from "react-uuid";
import { addData, deleteData, getData } from "../service/APIService";

const ToDoSettings = () => {
  const [categories, setCategories] = useState([]);
  const [newCategory, setNewCategory] = useState("");
  const [email, setEmail] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Logged-in state
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const guestUser = JSON.parse(localStorage.getItem("guestUser"));
    if (sessionUser) {
      setIsLoggedIn(true);
      setEmail(sessionUser.email);
      setName(sessionUser.name);
      loadCategoriesFromServer(sessionUser.email);
    } else {
      setIsLoggedIn(false);
      setEmail(guestUser?.email || "guest");
      setName(guestUser.name);
      loadCategoriesFromLocalStorage();
    }
  }, []);

  const loadCategoriesFromLocalStorage = () => {
    const savedCategories = JSON.parse(localStorage.getItem("todoCategories")) || [];
    setCategories(savedCategories);
  };

  const loadCategoriesFromServer = async (email) => {
    setLoading(true);
    try {
      const response = await getData(email, "todocategory"); // Fetch data from the server
      const categoriesWithIds = response.map((item) => ({
        id: item.id, // Ensure the ID is included
        name: item.name, // Ensure the name is included
      }));
      setCategories(categoriesWithIds || []); // Update state with categories as objects
    } catch (error) {
      setLoading(false);
      console.error("Failed to load categories from server:", error);
    }
    setLoading(false);
  };

  const addCategory = async () => {
    if (newCategory.trim() === "") return alert("Category name cannot be empty!");
    const categoryToAdd = newCategory.trim().toUpperCase();

    // Check for duplicate category names
    if (categories.some((category) => category.name === categoryToAdd)) {
      return alert("Category already exists!");
    }

    const newCategoryObject = {
      id: uuid(),
      name: categoryToAdd,
      type: "todocategory", // This is optional if needed
    };

    if (isLoggedIn) {
      setLoading(true);
      try {
        await addData({ ...newCategoryObject, email }); // Add category to the server
        loadCategoriesFromServer(email); // Refresh categories from the server
      } catch (error) {
        setLoading(false);
        console.error("Failed to add category to server:", error);
      }
    } else {
      const updatedCategories = [...categories, newCategoryObject];
      setCategories(updatedCategories); // Update the local state
      localStorage.setItem("todoCategories", JSON.stringify(updatedCategories)); // Save to local storage
    }
    setLoading(false);
    setNewCategory(""); // Clear input
  };

  const deleteCategory = async (categoryId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this item?");
    if (!isConfirmed) return;

    if (isLoggedIn) {
      try {
        await deleteData(categoryId); // Assuming `deleteData` accepts `id` directly for server deletion
        loadCategoriesFromServer(email); // Refresh categories
      } catch (error) {
        console.error("Failed to delete category from server:", error);
      }
    } else {
      const updatedCategories = categories.filter((category) => category.id !== categoryId); // Filter by `id`
      setCategories(updatedCategories);
      localStorage.setItem("todoCategories", JSON.stringify(updatedCategories));
    }
  };
  return (
    <div className="container">
      <div className="d-flex justify-content-between text-small">
        <div className="text-dark">
          <small>
            Personal{" "}
            <span className="text-danger">
              <i className="fi fi-rr-user"></i>
            </span>
          </small>
        </div>
        <div className="mb-0">
          <small>Welcome, {name}!</small>
        </div>
      </div>
      <h4>Manage ToDo Categories</h4>
      <input type="text" placeholder="Add new category" value={newCategory} onChange={(e) => setNewCategory(e.target.value)} className="form-control mb-2" />
      <button className="btn btn-warning mb-3" disabled={loading} onClick={addCategory}>
        Add Category
      </button>
      {loading ? (
        <p className="p-2 border rounded mt-2">
          <span className="px-1">
            <i className="fas fa-spinner fa-spin"></i>
          </span>
          Loading Category... Please Wait.
        </p>
      ) : (
        <ul className="list-group">
          {categories.map((category) => (
            <li key={category.id} className="list-group-item d-flex justify-content-between align-items-center">
              {category.name}
              <button className="btn btn-sm btn-danger" onClick={() => deleteCategory(category.id)}>
                <span className="pb-0">
                  <i className="fi fi-rr-trash pb-0"></i>
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default ToDoSettings;

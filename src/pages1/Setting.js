import React, { useState, useEffect } from "react";
import bin from "../images/bin.png";
import uuid from "react-uuid";
import { getExpenseCategory, addExpenseCategory, UpdateUser, fetchUsers } from "../service/APIService";

const Setting = ({ loggedInUserEmail }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [shareWithEmail, setShareWithEmail] = useState("");
  const [success, setSuccess] = useState("");
  const [loggedinUserExpense, setLoggedinUserExpense] = useState([]);
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
    if (sessionUser && loggedInUserEmail && loggedInUserEmail !== "guest") {
      fetchCategories();
      getUsers(sessionUser.email);
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
  const handleShare = async () => {
    setError("");
    setSuccess("");
    if (!shareWithEmail) {
      setError("Please provide an email.");
      return;
    }

    try {
      // Check if the user exists
      const loggedinuser = await fetchUsers(email); // logged in user
      const shareduser = await fetchUsers(shareWithEmail); // Fetch all user that you are sharing
      //const userToShareWith = users.find((user) => user.email === shareWithEmail);

      if (!shareduser) {
        setError("The user does not exist. " + shareWithEmail);
        return;
      }

      // Prevent duplicate sharing
      const currentUser = email;
      console.log("currentUser", loggedinuser.sharedWith);

      if (currentUser?.includes(shareWithEmail)) {
        setError("You cannot share with your self");
        return;
      }
      if (loggedinuser?.sharedWith?.includes(shareWithEmail)) {
        setError("This user is already shared with other user.");
        return;
      }
      if (shareduser?.sharedWith?.includes(shareWithEmail)) {
        setError("This user is already shared with other user.");
        return;
      }

      // Update logged-in user's sharedWith list
      const updatedloggedinUser = {
        ...loggedinuser,
        sharedWith: shareWithEmail + "," + email,
      };
      const updatedSharedUser = {
        ...shareduser,
        sharedWith: shareWithEmail + "," + email,
      };
      console.log("updatedloggedinUser", updatedloggedinUser);
      console.log("updatedSharedUser", updatedSharedUser);
      await UpdateUser(updatedloggedinUser);
      await UpdateUser(updatedSharedUser);
      setSuccess(`You have successfully shared expenses with ${shareWithEmail}.`);
    } catch (err) {
      setError("Failed to share. Please try again.");
    }
  };
  const getUsers = async (email) => {
    setLoading(true);
    let response;
    try {
      console.log("user email", email);
      response = await fetchUsers(email);
      console.log("user", response);
      setLoggedinUserExpense(response.sharedWith);
      console.log("logged in user", response.sharedWith);
    } catch (err) {
      // setError("Failed to fetch user.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <div align="right">
          <p className="mb-0">
            <small>Welcome, {name}!</small>
          </p>
        </div>
        <div className="mt-2">
          {email == "guest" ? (
            <ul>
              <li>Log in to Share Expense with one Family member.</li>
              <li>Add new Expense Categories</li>
            </ul>
          ) : (
            <>
              {" "}
              <h6 className="text-right">Share Expense</h6>
              <small>Recommend to share with registed family member. You and your family member can track the daily expense.</small>
              <input type="email" placeholder="Enter email to share with" value={shareWithEmail} onChange={(e) => setShareWithEmail(e.target.value)} className="form-control my-2" />
              <button onClick={handleShare} disabled={loggedinUserExpense ? true : false} className="btn btn-warning">
                Share Expenses
              </button>
              {error && <p className="text-danger">{error}</p>}
              {success && <p className="text-success">{success}</p>}
              <div>
                <small> Shared with (Family member recommend) : {loggedinUserExpense || (loggedinUserExpense && loggedinUserExpense.length === 0) ? loggedinUserExpense : "None"}</small>
              </div>
              {/* New Category Input */}
              <div className="mb-3 mt-3">
                <h6 className="text-right">Manage Categories</h6>
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

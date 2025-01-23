import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import uuid from "react-uuid";
import { fetchUsers, addData, UpdateData, getData, deleteData } from "../service/APIService";

const ToDoApp = () => {
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState(["Default"]);
  const [newTodo, setNewTodo] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("Default");
  const [showModal, setShowModal] = useState(false);
  const [deleteEnabled, setDeleteEnabled] = useState(false);
  const [editEnabled, setEditEnabled] = useState(false);
  const [isImportant, setIsImportant] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Logged-in state
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [editingTodo, setEditingTodo] = useState(null);
  const [archiveEnabled, setArchiveEnabled] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState({});
  const [activeCategory, setActiveCategory] = useState(null);
  useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const guestUser = JSON.parse(localStorage.getItem("guestUser"));
    if (sessionUser) {
      setIsLoggedIn(true);
      setEmail(sessionUser.email);
      setName(sessionUser.name);
      loadTodosFromServer(sessionUser.email);
      loadCategoriesFromServer(sessionUser.email);
    } else {
      setIsLoggedIn(false);
      setName(guestUser.name);
      setEmail(guestUser?.email || "guest");
      loadTodosFromLocalStorage();
      loadCategoriesFromLocalStorage();
    }
  }, []);

  const loadTodosFromLocalStorage = () => {
    const savedTodos = JSON.parse(localStorage.getItem("todos")) || [];
    setTodos(savedTodos);
    initializeCollapsedCategories(savedTodos);
  };

  const loadCategoriesFromLocalStorage = () => {
    const savedCategories = JSON.parse(localStorage.getItem("todoCategories")) || ["Default"];
    setCategories(savedCategories);
  };
  const toggleDeleteButtons = () => {
    setDeleteEnabled(!deleteEnabled);
    setEditEnabled(false);
    setArchiveEnabled(false);
  };
  const toggleEditButtons = () => {
    setEditEnabled(!editEnabled);
    setDeleteEnabled(false);
    setArchiveEnabled(false);
  };
  const toggleArchiveButtons = () => {
    setArchiveEnabled(!archiveEnabled);
    setDeleteEnabled(false);
    setEditEnabled(false);
  };
  const loadTodosFromServer = async (email) => {
    setLoading(true);
    try {
      const response = await getData(email, "todo");
      setTodos(response || []);
      initializeCollapsedCategories(response || []);
    } catch (error) {
      setLoading(false);
      console.error("Failed to load todos from server:", error);
    }
    setLoading(false);
  };

  const loadCategoriesFromServer = async (email) => {
    try {
      const response = await getData(email, "todocategory");
      setCategories(response.map((item) => item) || ["Default"]);
    } catch (error) {
      console.error("Failed to load categories from server:", error);
    }
  };
  const initializeCollapsedCategories = (todos) => {
    const groupedCategories = todos.reduce((acc, todo) => {
      acc[todo.category] = true; // Initialize all categories as collapsed (true)
      return acc;
    }, {});
    setCollapsedCategories(groupedCategories);
  };

  // const toggleCategory = (category) => {
  //   setCollapsedCategories((prev) => ({
  //     ...prev,
  //     [category]: !prev[category], // Toggle the collapsed state
  //   }));
  // };
  const toggleCategory = (category) => {
    console.log(category);
    setActiveCategory((prev) => (prev === category ? null : category));

    // If already open, close it; otherwise, open it
  };

  const addTodo = async () => {
    if (newTodo.trim() === "") return alert("ToDo text/ Category cannot be empty!");

    const newTodoItem = {
      id: uuid(),
      text: newTodo.trim(),
      category: selectedCategory,
      completed: false,
      createddate: new Date().toISOString(),
      important: isImportant,
      todotype: "personal",
    };

    if (isLoggedIn) {
      setLoading(true);
      try {
        await addData({ ...newTodoItem, type: "todo", email });
        loadTodosFromServer(email); // Refresh todos
      } catch (error) {
        setLoading(false);
        console.error("Failed to add todo to server:", error);
      }
    } else {
      try {
        const updatedTodos = [...todos, newTodoItem];
        setTodos(updatedTodos); // Update state
        localStorage.setItem("todos", JSON.stringify(updatedTodos)); // Save to local storage
      } catch (error) {
        console.error("Failed to save ToDo for guest user:", error);
        alert("Something went wrong while saving the ToDo.");
      }
    }

    setNewTodo(""); // Reset input
    setIsImportant(false); // Reset importance flag
    setShowModal(false); // Close modal
    setLoading(false);
  };

  const toggleComplete = async (id) => {
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, completed: !todo.completed } : todo));
    setTodos(updatedTodos);

    if (isLoggedIn) {
      try {
        const todoToUpdate = updatedTodos.find((todo) => todo.id === id);
        await UpdateData({ ...todoToUpdate, email });
      } catch (error) {
        console.error("Failed to update todo status on server:", error);
      }
    } else {
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
    }
  };
  const toggleImportant = async (id) => {
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, important: !todo.important } : todo));
    setTodos(updatedTodos);

    if (isLoggedIn) {
      try {
        const todoToUpdate = updatedTodos.find((todo) => todo.id === id);
        await UpdateData({ ...todoToUpdate, email });
      } catch (error) {
        console.error("Failed to update todo status on server:", error);
      }
    } else {
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
    }
  };

  const deleteTodo = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this item?");
    if (!isConfirmed) return;

    if (isLoggedIn) {
      try {
        await deleteData(id);
        loadTodosFromServer(email); // Refresh todos
      } catch (error) {
        console.error("Failed to delete todo from server:", error);
      }
    } else {
      const updatedTodos = todos.filter((todo) => todo.id !== id);
      setTodos(updatedTodos);
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
    }
  };
  const updateTodo = async () => {
    if (!editingTodo.text.trim()) return alert("ToDo text cannot be empty!");

    if (isLoggedIn) {
      setLoading(true);
      try {
        console.log({ ...editingTodo, email });

        await UpdateData({ ...editingTodo, email });
        loadTodosFromServer(email); // Refresh todos
      } catch (error) {
        setLoading(false);
        console.error("Failed to update todo on server:", error);
      }
    } else {
      const updatedTodos = todos.map((todo) => (todo.id === editingTodo.id ? editingTodo : todo));
      setTodos(updatedTodos);
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
    }
    //setEditEnabled(false);
    setEditingTodo(null); // Reset editing state
    setLoading(false);
  };
  const archiveTodo = async (id) => {
    const updatedTodos = todos.map((todo) => (todo.id === id ? { ...todo, category: "Archive" } : todo));
    setTodos(updatedTodos);

    if (isLoggedIn) {
      try {
        const todoToArchive = updatedTodos.find((todo) => todo.id === id);
        await UpdateData({ ...todoToArchive, email });
      } catch (error) {
        console.error("Failed to archive todo on server:", error);
      }
    } else {
      localStorage.setItem("todos", JSON.stringify(updatedTodos));
    }
  };
  function formatDateToDDMMM(dateString) {
    const date = new Date(dateString);

    const day = date.getDate().toString().padStart(2, "0"); // Ensures 2-digit day
    const month = date.toLocaleString("en-US", { month: "short" }); // Gets short month name

    return `${day}-${month}`; // Combine day and month
  }
  const sortedCategories = (categories) => {
    // Ensure "Archive" is always at the bottom
    return Object.keys(categories).sort((a, b) => {
      if (a === "Archive") return 1; // Move "Archive" to the end
      if (b === "Archive") return -1;
      return a.localeCompare(b); // Alphabetical order for other categories
    });
  };
  return (
    <div className="container">
      <div className="d-flex justify-content-between text-small">
        <div className="text-dark mb-2">
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
      {loading ? (
        <p className="p-2 border rounded mt-2">
          <span className="px-1">
            <i className="fas fa-spinner fa-spin text-success"></i>
          </span>
          Loading... Please Wait.
        </p>
      ) : todos.length === 0 ? (
        <p className="p-2 border rounded mt-2">
          No To Do List found. Please Click{" "}
          <span>
            <i className="fi fi-rr-add mb-0"></i>
          </span>{" "}
          to add your first ToDo task
        </p>
      ) : (
        sortedCategories(
          todos.reduce((groups, todo) => {
            const category = todo.category;
            if (!groups[category]) groups[category] = [];
            groups[category].push(todo);
            return groups;
          }, {})
        ).map((category) => {
          const categoryTodos = todos.filter((todo) => todo.category === category);
          const completedCount = categoryTodos.filter((todo) => todo.completed).length;
          const pendingCount = categoryTodos.length - completedCount;

          return (
            <div key={category} className="mb-1">
              <h6 className="text-dark mb-1  py-2 border rounded bg-light p-2 d-flex justify-content-between align-items-center" style={{ cursor: "pointer" }} onClick={() => toggleCategory(category)}>
                <span className="px-1">
                  <span className="ml-2 mb-0 align-items-center">{activeCategory === category ? <b>{category.toUpperCase()}</b> : category.toUpperCase()}</span>{" "}
                  <span className="badge text-secondary bg-light border">
                    Pending - {pendingCount}, Completed - {completedCount}{" "}
                  </span>
                </span>
                <span className="fs-2 text">{activeCategory === category ? "-" : "+"}</span>
              </h6>
              <ul
                id={category}
                className="list-group"
                style={{
                  maxHeight: activeCategory === category ? "500px" : "0px",
                  overflow: "scroll",
                  transition: "max-height 0.5s ease-in-out",
                }}
                // style={{ display: collapsedCategories[category] ? "none" : "block" }}
              >
                {categoryTodos
                  .sort((a, b) => a.completed - b.completed || b.important - a.important) // Sort by importance, then by completion
                  .map((todo) => (
                    <li key={todo.id} className={`p-0 px-1 list-group-item d-flex justify-content-between align-items-center ${todo.completed ? "list-group-item-success" : "list-group-item-warning"}`}>
                      <div>
                        <a className="btn btn-sm text-danger p-0 px-1 rounded-circle" onClick={() => toggleImportant(todo.id)}>
                          {todo.important ? <i className="fas fa-star"></i> : <i className="far fa-star"></i>}
                        </a>
                      </div>
                      <small align="left" className="d-flex w-100">
                        <span className={todo.completed ? "text-decoration-line-through" : ""}>
                          {todo.text} <small className="text-dark">{formatDateToDDMMM(todo.createddate)}</small>
                        </span>
                      </small>
                      <div className="p-1 ml-auto d-flex">
                        {deleteEnabled && (
                          <button className="btn btn-sm btn-danger rounded-circle" onClick={() => deleteTodo(todo.id)}>
                            <i className="fi fi-rr-trash"></i>
                          </button>
                        )}
                        {!deleteEnabled && (
                          <>
                            <button className={`btn btn-sm rounded-circle ${todo.completed ? "btn-success" : "btn-warning"}`} onClick={() => toggleComplete(todo.id)}>
                              {todo.completed ? <i className="fas fa-check"></i> : <i className="fas fa-spinner"></i>}
                            </button>
                            {editEnabled && (
                              <button className="btn btn-sm btn-secondary rounded-circle ms-2 pb-0" onClick={() => setEditingTodo(todo)}>
                                <i className="fi fi-rr-edit mb-0"></i>
                              </button>
                            )}
                            {archiveEnabled && (
                              <button className="btn btn-sm btn-secondary rounded-circle ms-2 pb-0" onClick={() => archiveTodo(todo.id)}>
                                <i className="fi fi-rr-archive"></i>
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </li>
                  ))}
              </ul>
            </div>
          );
        })
      )}
      <button
        className="btn btn-warning rounded-circle shadow pb-0"
        style={{
          position: "fixed",
          bottom: "80px",
          width: "50px",
          height: "50px",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "25px",
          zIndex: 1000,
        }}
        onClick={() => setShowModal(true)}
      >
        <span>
          <i className="fi fi-rr-add mb-0"></i>
        </span>
      </button>{" "}
      {activeCategory !== null && (
        <>
          {todos.length !== 0 && (
            <div className="d-flex justify-content-end align-items-center pb-0">
              <button
                className="btn btn-danger rounded-circle shadow pb-0"
                style={{
                  position: "fixed",
                  bottom: "75px",
                  right: "20px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "20px",
                  zIndex: 1000,
                }}
                onClick={toggleDeleteButtons}
              >
                <small>
                  {deleteEnabled ? (
                    <span>
                      <i className="fi fi-rr-cross"></i>
                    </span>
                  ) : (
                    <span>
                      <i className="fi fi-rr-trash"></i>
                    </span>
                  )}
                </small>
              </button>
              <button
                className="btn btn-secondary rounded-circle  pb-0 mr-3"
                style={{
                  position: "fixed",
                  bottom: "75px",
                  right: "70px",
                  width: "40px",
                  height: "40px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  fontSize: "20px",
                  zIndex: 1000,
                }}
                onClick={toggleEditButtons}
              >
                <small>
                  {editEnabled ? (
                    <span>
                      <i className="fi fi-rr-cross"></i>
                    </span>
                  ) : (
                    <span>
                      <i className="fi fi-rr-edit"></i>
                    </span>
                  )}
                </small>
              </button>
              <small style={{ position: "fixed", bottom: "115px", right: "79px" }}>Edit</small>
              {activeCategory?.toUpperCase() !== "ARCHIVE" && (
                <>
                  {" "}
                  <button className="btn btn-secondary rounded-circle shadow pb-0 mr-3" style={{ position: "fixed", bottom: "75px", right: "120px", width: "40px", height: "40px" }} onClick={toggleArchiveButtons}>
                    {archiveEnabled ? <i className="fi fi-rr-cross"></i> : <i className="fi fi-rr-archive"></i>}
                  </button>
                  <small style={{ position: "fixed", bottom: "115px", right: "115px" }}>Archive</small>
                </>
              )}
            </div>
          )}
        </>
      )}
      <Modal show={showModal} onHide={() => setShowModal(false)} top>
        <Modal.Header closeButton>
          <Modal.Title>Add ToDo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group mb-3">
            <div className="d-flex justify-content-between">
              <label htmlFor="todoText">ToDo Text</label>
              <small className="text-muted">{100 - newTodo.length} characters remaining</small>
            </div>
            <input type="text" id="todoText" placeholder="Enter ToDo text" value={newTodo} maxLength={100} onChange={(e) => setNewTodo(e.target.value)} className="form-control" />
          </div>
          <div className="form-group mb-3">
            <div className="d-flex justify-content-between">
              <label htmlFor="todoCategory">Category</label>{" "}
              <a href="/app4/setting" className="my-link">
                Add
              </a>
            </div>

            <select id="todoCategory" className="form-select" required value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
              <option value="Default">Default</option>
              {categories.map((category, index) => (
                <option key={category.name} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <div className="form-check">
              <input type="checkbox" id="importantFlag" className="form-check-input border-dark" onChange={(e) => setIsImportant(e.target.checked)} />
              <label htmlFor="importantFlag" className="form-check-label">
                Mark as Important
              </label>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" disabled={loading} onClick={addTodo}>
            {loading ? "Please wait..." : "Add ToDo"}
          </Button>
        </Modal.Footer>
      </Modal>
      <Modal show={!!editingTodo} onHide={() => setEditingTodo(null)}>
        <Modal.Header closeButton>
          <Modal.Title>Edit ToDo</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group mb-3">
            <label htmlFor="editTodoText">ToDo Text</label>
            <input type="text" id="editTodoText" value={editingTodo?.text || ""} onChange={(e) => setEditingTodo((prev) => ({ ...prev, text: e.target.value }))} className="form-control" />
          </div>
          <div className="form-group mb-3">
            <label htmlFor="editTodoCategory">Category</label>
            <select id="editTodoCategory" className="form-select" value={editingTodo?.category || ""} onChange={(e) => setEditingTodo((prev) => ({ ...prev, category: e.target.value }))}>
              <option>Default</option>
              {categories.map((category) => (
                <option key={category.id} value={category.name}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setEditingTodo(null)}>
            Cancel
          </Button>
          <Button variant="warning" disabled={loading} onClick={updateTodo}>
            {loading ? "Please wait..." : "Save Changes"}
          </Button>
        </Modal.Footer>
      </Modal>
      <div className="bottomspace"></div>
    </div>
  );
};

export default ToDoApp;

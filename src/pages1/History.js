import React, { useEffect, useState } from "react";
import { Modal } from "react-bootstrap";
import bin from "../images/bin.png";
import { getExpenseHistory, UpdateData, getSharedExpense, getPersonalExpense, fetchUsers, getCurrency } from "../service/APIService";
import { useLocation } from "react-router-dom";

const History = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [deleteEnabled, setDeleteEnabled] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [email, setEmail] = useState(JSON.parse(localStorage.getItem("loggedInUser")));
  const [name, setName] = useState("");
  const [loggedInUserEmail, setLoggedInUserEmail] = useState(localStorage.getItem("loggedInUserEmail"));
  const [visibleExpenses, setVisibleExpenses] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [editExpense, setEditExpense] = useState(null); // State to track the expense being edited
  const [editForm, setEditForm] = useState({}); // Form values for editing
  const location = useLocation();
  const isSharedHistory = location.pathname.includes("sharedhistory") ? true : false;
  const [country, setCountry] = useState("");
  // Fetch expenses from the server
  useEffect(() => {
    const fetchExpenses = async () => {
      const sessionUser = await JSON.parse(localStorage.getItem("loggedInUser"));
      const guestUser = await JSON.parse(localStorage.getItem("guestUser"));
      if (sessionUser) {
        setIsLoggedIn(true);
        setEmail(sessionUser.email);
        setName(sessionUser.name);
        setCountry(sessionUser.country || "");
      } else {
        setIsLoggedIn(true);
        setEmail(guestUser.email);
        setName(guestUser.name);
        setCountry(guestUser.country || "");
      }
      if (loggedInUserEmail !== "guest") {
        setLoading(true);
        try {
          var response;
          if (isSharedHistory) {
            const userresponse = await fetchUsers(sessionUser.email);
            console.log("userresponse", userresponse);
            response = await getSharedExpense(userresponse.sharedWith);
          } else {
            response = await getPersonalExpense(sessionUser.email);
          }
          setExpenses(response);
        } catch (err) {
          setError("Failed to fetch expenses.");
        } finally {
          setLoading(false);
        }
      } else {
        setIsLoggedIn(false);
        loadGuestExpenses();
      }
    };
    fetchExpenses();
    console.log(loggedInUserEmail);
    console.log(loggedInUserEmail);
  }, [isSharedHistory, loggedInUserEmail]);

  const loadGuestExpenses = () => {
    const guestExpenses = JSON.parse(localStorage.getItem("guestExpenses")) || [];
    setExpenses(guestExpenses);
  };

  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "short" };
    const date = new Date(dateString);
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("en-US", options);
  };

  const toggleDeleteButtons = () => {
    setDeleteEnabled(!deleteEnabled);
  };

  const deleteExpense = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this expense?");
    if (!isConfirmed) return;
    setLoading(true);
    try {
      if (loggedInUserEmail !== "guest") {
        await fetch(`${process.env.REACT_APP_SERVICE_URL}/removeitem/${id}`, { method: "DELETE" });
      } else {
        let guestExpenses = JSON.parse(localStorage.getItem("guestExpenses")) || [];
        guestExpenses = guestExpenses.filter((expense) => expense.id !== id);
        localStorage.setItem("guestExpenses", JSON.stringify(guestExpenses));
        loadGuestExpenses();
      }
      setExpenses(expenses.filter((expense) => expense.id !== id));
      setError("");
      setDeleteEnabled(false);
    } catch (err) {
      setError("Failed to delete expense.");
      setDeleteEnabled(false);
    } finally {
      setLoading(false);
    }
  };

  const handleEditClick = (expense) => {
    console.log(expense);
    setEditExpense(expense);
    setEditForm({ ...expense });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm({ ...editForm, [name]: value });
  };

  const handleEditSave = async () => {
    if (!editForm.amount || !editForm.description) {
      alert("All fields are required.");
      return;
    }

    setLoading(true);
    try {
      console.log("handleEditSave", editForm);
      editForm.amount = parseFloat(editForm.amount);
      await UpdateData(editForm); // Call the service to update the expense
      setExpenses((prevExpenses) => prevExpenses.map((expense) => (expense.id === editForm.id ? editForm : expense)));
      setEditExpense(null); // Close the modal
      setError("");
    } catch (err) {
      setError("Failed to update expense.");
    } finally {
      setLoading(false);
    }
  };

  const loadMoreExpenses = () => {
    setVisibleExpenses((prevVisible) => prevVisible + 15);
  };

  const filteredExpenses = expenses
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .filter((expense) => {
      return expense.description.toLowerCase().includes(searchTerm.toLowerCase()) || expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    });

  return (
    <>
      {loggedInUserEmail === "guest" && isSharedHistory ? (
        <div className="container">Please log in to view Shared History</div>
      ) : (
        <div className="container">
          <div className="d-flex justify-content-between text-small">
            <div className="text-dark">
              <small>
                {isSharedHistory ? (
                  <>
                    Shared History{" "}
                    <span className="text-danger">
                      <i className="fi fi-rr-users"></i>
                    </span>
                  </>
                ) : (
                  <>
                    Personal History{" "}
                    <span className="text-danger">
                      <i className="fi fi-rr-user"></i>
                    </span>
                  </>
                )}{" "}
              </small>
            </div>
            <div className="mb-0">
              <small>Welcome, {name}!</small>
            </div>
          </div>
          <div className="mt-2">
            {expenses.length !== 0 && (
              <>
                <input type="text" placeholder="Search expenses..." className="form-control mb-3" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

                <div className="d-flex justify-content-end align-items-center mb-1">
                  <button className="btn btn-danger p-1 w-auto" onClick={toggleDeleteButtons}>
                    <small>
                      {!deleteEnabled ? (
                        <>Delete</>
                      ) : (
                        <>
                          Delete <i className="fi fi-rr-cross"></i>
                        </>
                      )}
                    </small>
                  </button>
                </div>
              </>
            )}

            {loading ? (
              <p className="p-2 border rounded">
                <span className="px-1">
                  <i className="fas fa-spinner fa-spin text-success"></i>
                </span>
                Loading data... Please wait.
              </p>
            ) : (
              <>
                {expenses.length === 0
                  ? "No Expense History Found."
                  : filteredExpenses.slice(0, visibleExpenses).map((expense, index) => (
                      <div key={index} className="d-flex flex-wrap align-items-center justify-content-between expense-row py-2 border-bottom">
                        <div className="flex-grow-1 me-2">
                          <small>
                            <b>{formatDate(expense.date)}</b>
                          </small>{" "}
                          <small>
                            {expense.description.length > 12 ? expense.description.substring(0, 12) + "..." : expense.description} - {expense.category.substring(0, 6)}
                          </small>
                        </div>
                        <div className="me-1">
                          <small>
                            <span>
                              {expense.expensetype === "shared" ? (
                                <span className="text-danger">
                                  <i className="fi fi-rr-users"></i>
                                </span>
                              ) : (
                                <span className="text-success">
                                  <i className="fi fi-rr-user"></i>
                                </span>
                              )}
                            </span>{" "}
                            <strong>
                              {getCurrency(country)}
                              {expense.amount.toFixed(2)}
                            </strong>
                          </small>
                        </div>
                        {loggedInUserEmail !== "guest" && (
                          <a className="mx-2 text-decoration-none text-success mb-0 pb-0" onClick={() => handleEditClick(expense)}>
                            <i className="fi fi-rr-edit mb-0 pb-0"></i>
                          </a>
                        )}
                        <div>
                          {/* <img onClick={() => deleteExpense(expense.id)} src={bin} width="20" className={!deleteEnabled || loading ? "d-none" : ""} style={{ cursor: deleteEnabled ? "pointer" : "not-allowed" }} /> */}
                          {deleteEnabled && (
                            <a className="mx-2 text-decoration-none text-danger mb-0 pb-0" onClick={() => deleteExpense(expense.id)}>
                              <i className="fi fi-rr-trash mb-0 pb-0"></i>
                            </a>
                          )}
                        </div>
                      </div>
                    ))}
                {expenses.length !== 0 && visibleExpenses <= filteredExpenses.length && (
                  <div className="text-center mt-3">
                    <button className="btn btn-warning btn-sm w-auto mb-4" onClick={loadMoreExpenses} disabled={visibleExpenses >= filteredExpenses.length}>
                      Load More
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}
      <Modal show={!!editExpense} onHide={() => setEditExpense(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Edit Expense</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label>Date</label>
            <input type="date" name="date" required value={editForm.date} onChange={handleEditChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Description</label>
            <input type="text" name="description" required value={editForm.description} onChange={handleEditChange} className="form-control" />
          </div>
          <div className="form-group">
            <label>Amount</label>
            <input type="number" name="amount" required value={editForm.amount} onChange={handleEditChange} min="0" inputMode="decimal" className="form-control" />
          </div>

          {editForm.sharedWith && (
            <div className="form-group d-none ">
              <label>Expense Type</label>
              <div>
                <button type="button" className={`btn btn-sm ${editForm.expensetype === "shared" ? "btn-warning" : "btn-outline-secondary"} me-2`} onClick={() => setEditForm({ ...editForm, expensetype: "shared" })}>
                  Shared
                </button>
                <button type="button" className={`btn btn-sm ${editForm.expensetype === "personal" ? "btn-warning" : "btn-outline-secondary"}`} onClick={() => setEditForm({ ...editForm, expensetype: "personal" })}>
                  Personal
                </button>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <button className="btn btn-secondary" onClick={() => setEditExpense(null)}>
            Cancel
          </button>
          <button className="btn btn-warning" onClick={handleEditSave}>
            Save
          </button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default History;

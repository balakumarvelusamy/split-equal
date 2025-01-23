import React, { useState, useEffect, useMemo } from "react";
import uuid from "react-uuid";
import { Col, Image, Row, Modal, Button } from "react-bootstrap";
import bin from "../images/bin.png";
import subaa from "../images/subaa.png";
import home from "../images/home.png";
import close from "../images/delete.png";
import BarChart from "./BarChart";
import { getSharedExpense, getDataFromServer, fetchUsers, onAddFriendService, onUpdateFriendService, getExpenseCategory, getCurrency } from "../service/APIService";
const SharedExpense = () => {
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formDate, setFormDate] = useState("");
  const [currentMonthExpense, setCurrentMonthExpense] = useState(0);
  const [deleteEnabled, setDeleteEnabled] = useState(false);
  const [showMonthlyReport, setShowMonthlyReport] = useState(false); // Toggle monthly report view
  const [showGroupByCategory, setShowGroupByCategory] = useState(false); // Toggle group by category view
  const [showExpensesModal, setShowExpensesModal] = useState(false); // Modal visibility state

  //chart
  const [monthlyChartData, setMonthlyChartData] = useState(null);
  const [categoryChartData, setCategoryChartData] = useState(null);
  const [showMonthlyChartModal, setShowMonthlyChartModal] = useState(false);
  const [showCategoryChartModal, setShowCategoryChartModal] = useState(false);
  ///pagination
  const [currentPage, setCurrentPage] = useState(1); // Current page state
  const expensesPerPage = 12; // Number of expenses to display per page
  const pageNumbersToShow = 4;
  const indexOfLastExpense = currentPage * expensesPerPage;
  const indexOfFirstExpense = indexOfLastExpense - expensesPerPage;
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Login state
  const [loggedInUserEmail, setLoggedInUserEmail] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState(""); // For registration
  const sortedExpenses = expenses?.sort((a, b) => new Date(b.date) - new Date(a.date));
  const currentExpenses = sortedExpenses.slice(indexOfFirstExpense, indexOfLastExpense);
  const totalPages = Math.ceil(expenses.length / expensesPerPage);
  const paginate = (pageNumber) => setCurrentPage(pageNumber);
  const startPage = Math.max(1, currentPage - Math.floor(pageNumbersToShow / 2));
  const endPage = Math.min(totalPages, startPage + pageNumbersToShow - 1);
  const [fetchedCategories, setFetchedCategories] = useState([]);
  const [loggedinUserExpense, setLoggedinUserExpense] = useState([]);
  let currentMonthExpense1;
  const [selectedMonth, setSelectedMonth] = useState("current");
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [country, setCountry] = useState("");
  ///pagination
  const formatDate = (dateString) => {
    const options = { day: "2-digit", month: "short" }; // Format as "dd-MMM"
    const date = new Date(dateString);
    // Add one day to correct for time zone issues
    date.setDate(date.getDate() + 1);
    return date.toLocaleDateString("en-US", options);
  };
  // Get today's date formatted as YYYY-MM-DD
  const getTodayDate = () => {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0"); // Months are 0-based
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const todaydate = getTodayDate();
  // Predefined categories
  const predefinedCategories = ["Groceries", "Subscription", "Rent", "Fuel", "Food", "Gift", "Travel", "Saving", "Shopping", "Entertainment", "Healthcare", "Other"];
  const [form, setForm] = useState({
    description: "",
    amount: "",
    category: predefinedCategories[0],
    date: getTodayDate(),
  });

  // Fetch categories and expenses on mount
  useEffect(() => {
    try {
      const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const loggedInUserEmail = localStorage.getItem("loggedInUserEmail");
      const guestUser = JSON.parse(localStorage.getItem("guestUser"));
      if (sessionUser) {
        setIsLoggedIn(true);
        setEmail(sessionUser.email);
        setLoggedInUserEmail(sessionUser.email); // if user logged in
        setName(sessionUser.name);
        setCountry(sessionUser.country || "");
      } else if (guestUser) {
        setIsLoggedIn(false);
        setLoggedInUserEmail(loggedInUserEmail); // if user is guest
        setEmail(guestUser.email);
        setName(guestUser.name);
        setCountry(guestUser.country || "");
      } else {
        console.warn("No valid user session found. Redirecting to login.");
        window.location.reload();
      }
      if (loggedInUserEmail !== "guest") {
        fetchCategories(sessionUser?.email);
        getUsers(sessionUser?.email);
      } else {
        setIsLoggedIn(false);
        loadGuestExpenses(); // Fetch from local storage for guest users
      }
    } catch (err) {
      setError("Failed to load Expense. Please Retry.");
    }
  }, []);
  // Filter expenses based on selected month
  useEffect(() => {
    const filterExpensesByMonth = () => {
      if (selectedMonth === "all") {
        setFilteredExpenses(expenses); // Show all expenses
        return;
      }

      const today = new Date();
      const currentYear = today.getFullYear();
      const currentMonth = today.getMonth() + 1;

      const [filterYear, filterMonth] = selectedMonth === "current" ? [currentYear, currentMonth] : selectedMonth.split("-").map(Number);

      const filtered = expenses.filter((expense) => {
        const [expenseYear, expenseMonth, expenseDay] = expense.date.split("-").map(Number);

        // Ensure only matching month and year are included
        return expenseYear === filterYear && expenseMonth === filterMonth;
      });

      setFilteredExpenses(filtered);
    };

    filterExpensesByMonth();
  }, [selectedMonth, expenses]);

  // Update grouped expenses to use filtered expenses
  const groupedExpenses = filteredExpenses.reduce((groups, expense) => {
    const category = expense.category;
    if (!groups[category]) {
      groups[category] = [];
    }
    groups[category].push(expense);
    return groups;
  }, {});
  // Fetch categories from the server and set to state
  const fetchCategories = async (email) => {
    setLoading(true);
    try {
      const response = await getExpenseCategory(email);
      setFetchedCategories(response.filter((item) => item.type === "expense-category").map((item) => item.category)); // Map to category names only
    } catch (err) {
      setError("Failed to fetch categories.");
    } finally {
      setLoading(false);
    }
  };
  const getUsers = async (email) => {
    setLoading(true);
    let response;
    try {
      response = await fetchUsers(email);
      console.log("user", response);

      if (response.sharedWith && response.sharedWith.length > 0) {
        setLoggedinUserExpense(response?.sharedWith || []);
        await fetchExpenses(response.sharedWith);
      } else {
        console.warn("No shared expenses found for this user.");
        setLoggedinUserExpense([]);
        setExpenses([]); // Ensure state is cleared
      }
    } catch (err) {
      console.error("Failed to fetch user or shared expenses:", err);
      setError("Failed to fetch user.");
    } finally {
      setLoading(false);
    }
  };

  const fetchExpenses = async (email) => {
    if (loggedInUserEmail !== "guest") {
      setLoading(true);
      try {
        const response = await getSharedExpense(email);
        calculateChartData(response);
        setExpenses(response || []);
        setError("");
      } catch (error) {
        console.error("Error fetching shared expenses:", error);
        setError("Failed to fetch shared expenses.");
      } finally {
        setLoading(false);
      }
    }
  };
  const loadGuestExpenses = () => {
    const guestExpenses = JSON.parse(localStorage.getItem("guestExpenses")) || [];
    setExpenses(guestExpenses);
  };

  // Handling form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    if (name === "amount" && value < 0) {
      setForm({ ...form, [name]: 0 });
    } else {
      setForm({ ...form, [name]: value });
    }
    //console.log(form);
  };

  // Save new expense to the server
  const saveExpense = async (newExpense) => {
    if (loggedInUserEmail !== "guest") {
      setLoading(true);
      try {
        await fetch(process.env.REACT_APP_SERVICE_URL + "/items", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(newExpense),
        });
        // Convert to Number if needed
        await fetchExpenses(loggedinUserExpense);
        setCurrentMonthExpense(
          expenses
            .filter((expense) => {
              const [year, month, day] = expense.date.split("-");
              const expenseDate = new Date(year, month - 1, day);
              const currentDate = new Date();
              return expenseDate.getMonth() === currentDate.getMonth() && expenseDate.getFullYear() === currentDate.getFullYear();
            })
            .reduce((total, expense) => total + Number(expense.amount), 0)
        );

        setError("");
        alert("Saved Successfully");
      } catch (err) {
        console.log("Error saving expense: ", err);
        setError("Failed to save expense.");
      } finally {
        setLoading(false);
      }
    } else {
      // Save data locally for guest users
      let guestExpenses = JSON.parse(localStorage.getItem("guestExpenses")) || [];
      guestExpenses.push(newExpense);
      localStorage.setItem("guestExpenses", JSON.stringify(guestExpenses));
      loadGuestExpenses();
    }
  };

  // Handling form submission
  const handleFormSubmit = (e) => {
    e.preventDefault();
    const newExpense = {
      id: uuid(),
      type: "expense",
      description: form.description,
      amount: parseFloat(form.amount),
      category: form.category.toUpperCase(),
      date: form.date,
      email: email,
      expensetype: "shared",
      sharedWith: loggedinUserExpense ? loggedinUserExpense : "",
    };
    console.log("newExpense", newExpense);
    saveExpense(newExpense);
    setForm({ description: "", amount: "", category: predefinedCategories[0], date: getTodayDate() });
  };

  // Calculate monthly totals for the report
  const calculateMonthlyReport = () => {
    const monthlyTotals = {};
    expenses.forEach((expense) => {
      const [year, month] = expense.date.split("-"); // Extract year and month from date
      const yearMonth = `${year}-${month}`; // Use the extracted values directly to avoid timezone issues

      if (!monthlyTotals[yearMonth]) {
        monthlyTotals[yearMonth] = 0;
      }

      monthlyTotals[yearMonth] += Number(expense.amount);
    });
    return monthlyTotals;
  };

  // Updated formatDate function for the report display
  const formatMonthYear = (yearMonth) => {
    const [year, month] = yearMonth.split("-");
    const date = new Date(Date.UTC(year, month));
    return date.toLocaleString("en-US", { month: "short", year: "numeric" });
  };

  // Group expenses by category
  const groupByCategory = () => {
    const groupedExpenses = {};
    expenses.forEach((expense) => {
      const category = expense.category;
      if (!groupedExpenses[category]) {
        groupedExpenses[category] = [];
      }
      groupedExpenses[category].push(expense);
    });
    return groupedExpenses;
  };

  const monthlyReport = calculateMonthlyReport();
  const totalExpense = expenses.reduce((total, expense) => total + expense.amount, 0);
  //console.log("Expenses:", expenses);
  currentMonthExpense1 = expenses
    .filter((expense) => {
      const [year, month, day] = expense.date.split("-"); // Assuming "YYYY-MM-DD" format
      const expenseDate = new Date(year, month - 1, day); // Months are zero-indexed
      const currentDate = new Date();
      //console.log("Expense Date:", expense.date, "Parsed Date:", expenseDate); // Log parsed dates
      return expenseDate.getMonth() === currentDate.getMonth() && expenseDate.getFullYear() === currentDate.getFullYear();
    })
    .reduce((total, expense) => total + Number(expense.amount), 0); // Convert to Number if needed
  const groupedExpenses_old = groupByCategory(); // Get the grouped expenses
  const combinedCategories = [...new Set([...predefinedCategories, ...fetchedCategories])]; // Avoid duplicates

  // Function to generate month options
  const generateMonthOptions = () => {
    const options = [];
    const today = new Date();
    for (let i = 0; i < 12; i++) {
      const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
      const month = date.toLocaleString("en-US", { month: "long" });
      const year = date.getFullYear();
      options.push({ value: `${year}-${date.getMonth() + 1}`, label: `${month} ${year}` });
    }
    return options;
  };

  const monthOptions = [{ value: "current", label: "Current Month" }, { value: "all", label: "View All" }, ...generateMonthOptions()];

  // Data for Bar Chart
  const calculateChartData = (response) => {
    console.log("Response for chart calculation:", response);

    // Ensure response is valid
    if (!response || response.length === 0) {
      console.warn("No expenses available for chart calculation.");
      setMonthlyChartData(null);
      setCategoryChartData(null);
      return;
    }

    // Recalculate `monthlyReport`
    const monthlyReport = response.reduce((report, expense) => {
      const [year, month] = expense.date.split("-").map(Number);
      const yearMonth = `${year}-${month}`;
      if (!report[yearMonth]) {
        report[yearMonth] = 0;
      }
      report[yearMonth] += Number(expense.amount);
      return report;
    }, {});

    console.log("Recalculated monthlyReport:", monthlyReport);

    // Prepare Monthly Data
    const monthlyData = {
      labels: Object.keys(monthlyReport).map((month) => formatMonthYear(month)),
      values: Object.values(monthlyReport),
    };

    // Current Month Filtering
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const currentMonthExpenses = response.filter((expense) => {
      const [year, month] = expense.date.split("-").map(Number);
      return year === currentYear && month === currentMonth;
    });

    console.log("Current Month Expenses:", currentMonthExpenses);

    // Group by Category
    const groupedCategoryData = currentMonthExpenses.reduce((groups, expense) => {
      if (!groups[expense.category]) {
        groups[expense.category] = 0;
      }
      groups[expense.category] += Number(expense.amount);
      return groups;
    }, {});
    const sortedCategoryData = Object.entries(groupedCategoryData).sort((a, b) => a[1] - b[1]);

    const categoryData = {
      labels: sortedCategoryData.map(([category]) => category), // Extract sorted categories
      values: sortedCategoryData.map(([, value]) => value), // Extract sorted values
    };

    console.log("Calculated monthlyData:", monthlyData);
    console.log("Calculated categoryData:", categoryData);

    // Update Chart Data States
    setMonthlyChartData(monthlyData);
    setCategoryChartData(categoryData);
  };

  if (error) {
    return (
      <div className="container" align="center">
        <p>{error} </p> <p>Session Timeout.</p>
        <br />
        <a href="/app1/sharedexpense" className="text-decoration-none text-dark p-1 px-3 rounded border bg-warning">
          Reload App
        </a>
      </div>
    );
  }
  try {
    return (
      <div>
        {loggedinUserExpense && loggedinUserExpense.length !== 0 && email !== "guest" ? (
          <div className="container">
            <div className="d-flex justify-content-between text-small">
              <div className="text-dark">
                <small>
                  Shared{" "}
                  <span className="text-danger">
                    <i className="fi fi-rr-users"></i>
                  </span>
                </small>
              </div>
              <div className="mb-0">
                <small>Welcome, {name}!</small>
              </div>
            </div>
            <div className=" mt-2 mb-3">
              <h6 className="text-center mb-0 border  rounded p-3 bg-light">
                Current Month's Expense:{" "}
                <span className="text-success">
                  {" "}
                  {getCurrency(country)}
                  {currentMonthExpense1.toFixed(2)}
                </span>
              </h6>
            </div>
            {/* Expense Form */}

            <form onSubmit={handleFormSubmit} className="grid1">
              <input type="text" name="description" placeholder="Expense Description" className="form-control" value={form.description} onChange={handleInputChange} required />
              <input type="number" name="amount" placeholder="Amount" step="any" className="form-control" value={form.amount} onChange={handleInputChange} min="0" inputMode="decimal" required />
              {/* Category Dropdown */}
              <select name="category" className="form-control select-arrow" value={form.category} onChange={handleInputChange} required>
                {combinedCategories.map((category, index) => (
                  <option key={index} value={category}>
                    {category.toUpperCase()}
                  </option>
                ))}
              </select>
              <input type="date" name="date" className="form-control" defaultValue={todaydate} onChange={handleInputChange} required />

              <button type="submit" className="btn btn-lg bg-success text-white form-control" disabled={loading}>
                <h6 className="mb-0 ">
                  Add Shared Expense{" "}
                  <span>
                    <i className="fi fi-rr-users"></i>
                  </span>
                </h6>
              </button>
            </form>
            <div className="center">{error && <p style={{ color: "red" }}>{error}</p>}</div>
            {/* Total Expenses */}
            <div className="px-2">
              <h6 className="text-center mb-0 mt-2 border rounded p-3 bg-light mb-1">
                <span>
                  <i className="fi fi-rr-users"></i>
                </span>{" "}
                Total Expense:{" "}
                <span className="text-success font-weight-bold">
                  {getCurrency(country)}
                  {totalExpense.toFixed(2)}
                </span>
              </h6>
            </div>

            <div className="d-flex justify-content-between align-items-center mb-2 mt-2">
              {/* Monthly Report Link */}
              <button className="btn btn-success text-white me-2 p-1 px-2 m-1" onClick={() => setShowMonthlyReport(!showMonthlyReport)}>
                {showMonthlyReport ? "Monthly Report" : "Monthly Report"}
              </button>
              {/* Group by Category Link */}
              <button className="btn btn-success text-white p-1 m-1 px-2" onClick={() => setShowGroupByCategory(!showGroupByCategory)}>
                {showGroupByCategory ? "Category Report" : "Category Report"}
              </button>
            </div>
            {/* chart */}
            {loggedInUserEmail !== "guest" && (
              <div className="text-center d-flex justify-content-between align-items-center">
                <button className="btn  btn-md btn-secondary m-2" onClick={() => setShowMonthlyChartModal(true)} disabled={!monthlyChartData || monthlyChartData.values.length === 0}>
                  Monthly Chart
                </button>
                <button className="btn  btn-md btn-secondary m-2" onClick={() => setShowCategoryChartModal(true)} disabled={!categoryChartData || categoryChartData.values.length === 0}>
                  Category Chart
                </button>
              </div>
            )}
            {/* Displaying monthlyChartData for Debugging */}

            {/* Monthly Chart Modal */}
            <Modal show={showMonthlyChartModal} onHide={() => setShowMonthlyChartModal(false)} centered>
              <Modal.Header closeButton>
                <b className="mb-0">Monthly Expenses</b>
              </Modal.Header>
              <Modal.Body>{monthlyChartData && <BarChart data={monthlyChartData} title="Monthly Expenses" />}</Modal.Body>
              <Modal.Footer>
                <button className="btn btn-secondary" onClick={() => setShowMonthlyChartModal(false)}>
                  Close
                </button>
              </Modal.Footer>
            </Modal>

            {/* Category Chart Modal */}
            <Modal show={showCategoryChartModal} onHide={() => setShowCategoryChartModal(false)} centered>
              <Modal.Header closeButton>
                <b className="mb-0">Category Expenses Chart(Current Month)</b>
              </Modal.Header>
              <Modal.Body>{categoryChartData && <BarChart data={categoryChartData} title="Category Expenses (Current Month)" />}</Modal.Body>
              <Modal.Footer>
                <button className="btn btn-secondary" onClick={() => setShowCategoryChartModal(false)}>
                  Close
                </button>
              </Modal.Footer>
            </Modal>
            {/* Monthly Report Grid */}
            <Modal show={showMonthlyReport} onHide={() => setShowMonthlyReport(false)} centered>
              <Modal.Header>
                <h5 className="modal-title">Monthly Report</h5>
                <a onClick={() => setShowMonthlyReport(false)}>
                  <img src={close} alt="Logo" className="" width="30" />
                </a>
              </Modal.Header>
              <Modal.Body>
                <div>
                  {showMonthlyReport && (
                    <div className="mt-3">
                      <table className="table table-striped">
                        <thead>
                          <tr>
                            <th>Month</th>
                            <th>Total Expense</th>
                          </tr>
                        </thead>
                        <tbody>
                          {Object.keys(monthlyReport).map((month, index) => (
                            <tr key={index}>
                              <td>{formatMonthYear(month)}</td>
                              <td>
                                {getCurrency(country)}
                                {monthlyReport[month].toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}{" "}
                </div>
              </Modal.Body>
            </Modal>
            <Modal show={showGroupByCategory} onHide={() => setShowGroupByCategory(false)} centered>
              <Modal.Header>
                <h5 className="modal-title">Category Report</h5>
                <select className="form-control m-0 w-auto rounded p-1" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)}>
                  {monthOptions.map((option, index) => (
                    <option key={index} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
                <a onClick={() => setShowGroupByCategory(false)}>
                  <img src={close} alt="Logo" className="" width="30" />
                </a>
              </Modal.Header>
              <Modal.Body>
                <div>
                  {showGroupByCategory && (
                    <div className="mt-1">
                      {Object.keys(groupedExpenses).length > 0 ? (
                        Object.keys(groupedExpenses).map((category, index) => {
                          const groupTotal = groupedExpenses[category].reduce((total, expense) => total + expense.amount, 0);
                          return (
                            <div key={index}>
                              <h6 className="categorytitle mb-0 d-flex justify-content-between fw-bold">
                                {category}{" "}
                                <span className="text-success ">
                                  {getCurrency(country)}
                                  {groupTotal.toFixed(2)}
                                </span>
                              </h6>
                              <table className="table table-striped">
                                <thead>
                                  <tr>
                                    <th>Date</th>
                                    <th>Description</th>
                                    <th>Amount</th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {groupedExpenses[category].map((expense, i) => (
                                    <tr key={i}>
                                      <td>{formatDate(expense.date)}</td>
                                      <td>{expense.description.length > 12 ? expense.description.substring(0, 12) + ".." : expense.description}</td>
                                      <td>
                                        {getCurrency(country)}
                                        {expense.amount.toFixed(2)}
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          );
                        })
                      ) : (
                        <p>No expenses found for the selected month.</p>
                      )}
                    </div>
                  )}
                </div>
              </Modal.Body>
            </Modal>
          </div>
        ) : (
          <div className="container d-flex align-items-center">
            <p>Sharing is not enabled. Please login and go to settings to share the expense with the one Family member.</p>
          </div>
        )}
      </div>
    );
  } catch (error) {
    console.error("Rendering error:", error);
    return (
      <div className="container" align="center">
        <p>Error displaying shared expenses.</p>
        <p>Session Timeout.</p>
        <br />
        <a href="/" className="text-decoration-none text-dark p-1 px-3 rounded border bg-warning">
          Reload App
        </a>
      </div>
    );
  }
};

export default SharedExpense;

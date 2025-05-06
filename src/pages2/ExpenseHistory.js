import React, { useState, useEffect } from "react";
import { getData, UpdateData, addData, getData_Any2Column } from "../service/APIService";
import { v4 as uuid } from "uuid";
import { useParams } from "react-router-dom";
import { useLocation } from "react-router-dom";
import { Modal, Button } from "react-bootstrap";
import { FaArrowLeft, FaSync } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import ExpenseComponent from "./ExpenseComponent";
import secureLocalStorage from "react-secure-storage";
const ExpenseList = () => {
  const navigate = useNavigate();
  const [expenses, setExpenses] = useState([]);
  const [displayedExpenses, setDisplayedExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(10);
  const [refreshBalance_, setrefreshBalance_] = useState(0);
  const loggedInUserEmail = secureLocalStorage.getItem("loggedInUserEmail");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const { friendemail } = useParams();
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = new URLSearchParams(useLocation().search);

  useEffect(() => {
    const friendemail = query.get("friendemail");
    console.log("friendemail", friendemail);
    const fetchExpenses = async () => {
      const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
      setLoggedInUser(sessionUser);
      setLoading(true);
      try {
        console.log("email", loggedInUserEmail);
        const data1 = await getData_Any2Column("friendemail", loggedInUserEmail, "type", "splitequal-expense");
        const data2 = await getData_Any2Column("email", loggedInUserEmail, "type", "splitequal-expense");
        console.log("data1bala", data1);
        console.log("data2bala", data2);
        const mergedData = data1.concat(data2);
        const sortedData = mergedData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sortedData);
        setDisplayedExpenses(sortedData.slice(0, visibleCount));
      } catch (error) {
        console.error("Error fetching expenses:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [loggedInUserEmail, refreshBalance_]);

  useEffect(() => {
    const filteredExpenses = expenses.filter((expense) => expense && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));
    setDisplayedExpenses(filteredExpenses.slice(0, visibleCount));
  }, [searchTerm, visibleCount, expenses]);

  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-middle mb-1">
        {/* Back Button */}
        <span onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
          <FaArrowLeft className="me-1 text-success" /> Back
        </span>

        {/* Welcome Text */}
        <p className="mb-0">
          <small>Welcome, {loggedInUser?.name || "Guest"}!</small>
        </p>
      </div>
      <h5 className="mb-3">Expense List {"Showing " + displayedExpenses.length + " of " + expenses.length}</h5>

      {/* Search Bar */}
      <div className="input-group mb-3">
        <input type="text" className="form-control" placeholder="Search expenses by description..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
      </div>

      {/* Expense List */}
      {loading ? (
        <p className="p-2 border rounded">
          <span className="px-1">
            <i className="fas fa-spinner fa-spin text-success"></i>
          </span>
          Loading... Please wait...
        </p>
      ) : displayedExpenses.length === 0 ? (
        <p>No expenses found.</p>
      ) : (
        <ul className="list-group mb-3">
          <ExpenseComponent displayedExpenses={displayedExpenses} refreshBalance_={refreshBalance_} />
        </ul>
      )}

      {/* Load More Button */}
      {!loading && displayedExpenses.length < expenses.length && (
        <div className="text-center">
          <button className="btn btn-warning" onClick={handleLoadMore}>
            Load More
          </button>
        </div>
      )}
      <div align="center" style={refreshBtn} className="position-fixed bottom-0">
        <Button className="rounded-circle d-flex align-items-center justify-content-center shadow bg-myapp" onClick={(e) => setrefreshBalance_(refreshBalance_ + 1)} style={{ width: "40px", height: "40px", border: "1px solid white", backgroundColor: "var(--bs-primary)" }} disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <FaSync size={20} />}
        </Button>
      </div>
    </div>
  );
};
const refreshBtn = {
  zIndex: 2000,
  left: "90%",
  transform: "translateX(-50%)",
  marginBottom: "75px",
};
export default ExpenseList;

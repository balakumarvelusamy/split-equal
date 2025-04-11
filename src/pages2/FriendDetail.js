import React, { useState, useEffect } from "react";
import { getData, addData, UpdateData, getItemsbyid, getData_Any2Column } from "../service/APIService";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import AddExpense from "./AddExpense";
import SettleUp from "./SettleUp";
import { FaArrowLeft } from "react-icons/fa";
import { Modal, Button } from "react-bootstrap";
import { v4 as uuid } from "uuid";
import close from "../images/delete.png";
import ExpenseComponent from "./ExpenseComponent";
import { FaSync } from "react-icons/fa";

const FriendDetail = () => {
  const { friendemail } = useParams();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [visibleCount, setVisibleCount] = useState(8);
  const [displayedExpenses, setDisplayedExpenses] = useState([]);
  const [refreshBalance_, setrefreshBalance_] = useState(0);
  const [friend, setFriend] = useState({});
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [settleAmount, setSettleAmount] = useState(0);
  const [id, setId] = useState("");
  const loggedInUserEmail = localStorage.getItem("loggedInUserEmail");
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [settleUpAmounts, setSettleUpAmounts] = useState("");
  const useQuery = () => {
    return new URLSearchParams(useLocation().search);
  };
  const query = new URLSearchParams(useLocation().search);
  const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
  useEffect(() => {
    setLoading(true);
    setLoggedInUser(sessionUser);
    const friendemail = query.get("friendemail");
    const id = query.get("id");
    setId(id);
    console.log("FriendDetail", friendemail);
    const fetchFriendDetails = async () => {
      const friendbyid = await getItemsbyid(id);
      console.log("getItemsbyId id", id);
      console.log("getItemsbyId friendbyid", friendbyid);
      const selectedFriend = friendbyid.find((f) => f.friendemail === friendemail);
      setFriend(selectedFriend);
      const data1 = await getData_Any2Column("friendemail", friendemail, "type", "splitequal-expense");
      const data2 = await getData_Any2Column("email", friendemail, "type", "splitequal-expense");
      const mergedData = data1.concat(data2);
      //const expensesData = await getData(loggedInUserEmail, "splitequal-expense");
      const friendExpenses = mergedData.filter((e) => (e.friendemail === loggedInUserEmail || e.email === loggedInUserEmail) && e.currency === selectedFriend.currency);
      const sortedData = friendExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
      setExpenses(sortedData);
      setLoading(false);
    };

    fetchFriendDetails();
  }, [friendemail, loggedInUserEmail, refreshBalance_]);
  useEffect(() => {
    const filteredExpenses = expenses.filter((expense) => expense && expense.description.toLowerCase().includes(searchTerm.toLowerCase()));
    setDisplayedExpenses(filteredExpenses.slice(0, visibleCount));
  }, [searchTerm, visibleCount, expenses]);
  const incrementRefreshBalance = () => {
    setrefreshBalance_((prev) => prev + 1);
  };
  const handleLoadMore = () => {
    setVisibleCount((prevCount) => prevCount + 10);
  };
  const addExpense = async (expense) => {
    setShowAddExpense(false);
    setrefreshBalance_(refreshBalance_ + 1);
    return;
  };

  const refreshBalance = async () => {
    const friendbyid = await getItemsbyid(id);
    setFriend(friendbyid);
    setrefreshBalance_(refreshBalance_ + 1);
    console.log("friends in friends detials", friend);
  };

  const handleSettleUp = async () => {
    setLoading(true);
    await refreshBalance();
    setShowSettleUp(true);
    setLoading(false);
  };

  return (
    <>
      <div className="container">
        {loading && 1 == 2 ? (
          <p className="p-2 border rounded">
            <span className="px-1">
              <i className="fas fa-spinner fa-spin text-success"></i>
            </span>
            Loading... Please wait...
          </p>
        ) : (
          <>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <span
                onClick={() =>
                  navigate(-1, {
                    state: { refresh: refreshBalance_ + 1 }, // Pass a refresh flag
                  })
                }
                style={{ cursor: "pointer" }}
              >
                <FaArrowLeft className="me-1 text-success" /> Back
              </span>
              <span>
                <p className="mb-0">
                  <small>Welcome, {loggedInUser?.name || "Guest"}!</small>
                </p>
              </span>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3 border p-2 rounded" style={friend.balance < 0 ? cardStyleRed : cardStyleGreen}>
              <div>
                {loading ? (
                  <span className="px-1">
                    <i className="fas fa-spinner fa-spin text-success"></i>
                  </span>
                ) : (
                  <>
                    <h4 className="mb-0">{friend.friendname}</h4>
                    <small>{friend.friendemail}</small>
                  </>
                )}
              </div>
              <div>
                <h4 className="mb-0" align="right">
                  {friend.balance == 0 ? (
                    <>
                      <b className="text-dark">{friend.currency + " " + 0}</b>
                      <span></span>
                    </>
                  ) : loading ? (
                    <span className="px-1">
                      <i className="fas fa-spinner fa-spin text-success"></i>
                    </span>
                  ) : (
                    friend && (
                      <span className={friend.balance < 0 ? "text-danger" : "text-success"}>
                        <b>
                          {0 ||
                            friend.currency +
                              " " +
                              Math.abs(friend.balance)
                                .toFixed(2)
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </b>
                      </span>
                    )
                  )}
                </h4>
                <small align="right">
                  {friend.balance === 0 ? (
                    <>
                      <span> (No Balance - {friend.currencyName})</span>
                    </>
                  ) : (
                    <span className={friend.balance < 0 ? "text-danger" : "text-success"}>
                      <span>{friend.balance < 0 ? " You Pay" : " You Receive"}</span>
                      <span>({friend.currencyName})</span>
                    </span>
                  )}
                </small>
              </div>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-4 d-none">
              <h4>
                Balance:
                <span className={friend.balance < 0 ? "text-danger" : "text-success"}>
                  {friend.currency} {Math.abs(friend.balance).toFixed(2)}
                </span>
              </h4>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <Button onClick={() => setShowAddExpense(true)} variant="warning" className="me-2">
                Add Expense
              </Button>
              <Button onClick={(e) => (handleSettleUp(), setSettleUpAmounts(friend.balance))} disabled={friend.balance === 0 ? true : false} variant="success">
                Settle Up
              </Button>
            </div>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <label className="fw-bold">Expenses {displayedExpenses.length + "/" + expenses.length}</label>
              <input type="text" className="form-control w-75" placeholder="Search expenses" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>

            <ul className="list-group">
              {loading ? (
                <p className="p-2 border rounded">
                  <span className="px-1">
                    <i className="fas fa-spinner fa-spin text-success"></i>
                  </span>
                  Loading... Please wait...
                </p>
              ) : displayedExpenses.length === 0 ? (
                <p className="p-2 border rounded">No expenses found</p>
              ) : (
                <>
                  <ExpenseComponent displayedExpenses={displayedExpenses} refreshBalance_={incrementRefreshBalance} />
                </>
              )}
            </ul>
            {!loading && displayedExpenses.length < expenses.length && (
              <div className="text-center mt-1">
                <button className="btn btn-warning p-1" onClick={handleLoadMore}>
                  Load More
                </button>
              </div>
            )}

            {/* Add Expense Modal */}
            <Modal show={showAddExpense} onHide={(e) => setShowAddExpense(false)} backdrop="static">
              <div className="modal-header">
                <p className="mb-0 text-dark">
                  Add Expense for <b>{friend.friendname}</b>
                </p>
                <a onClick={(e) => setShowAddExpense(false)}>
                  <img src={close} alt="Logo" className="" width="30" />
                </a>
              </div>
              <Modal.Body>
                <AddExpense onAddExpense={addExpense} selectedFriend={friend.friendname} selectedFriendEmail={friend.friendemail} loggedInUserName={loggedInUser?.name} selectedCurrency={friend.currency} friend={friend} />
              </Modal.Body>
              <Modal.Footer className="py-1">
                <button type="button" onClick={(e) => setShowAddExpense(false)} className="rounded text-dark btn-lg btn-secondary bg-light border mt-1 ms-1 w-25">
                  Close
                </button>
              </Modal.Footer>
            </Modal>

            {/* <Modal onHide={() => setShowSettleUp(false)} backdrop="static">
            <div className="modal-header">
              <p className="mb-0 text-dark">
                Current Settle Up with <b>{friend.friendname}</b>
              </p>
              <a onClick={() => setShowSettleUp(false)}>
                <img src={close} alt="Logo" className="" width="30" />
              </a>
            </div>
            <Modal.Body>
              <div className="grid p-1">
                <div>
                  <div>{friend.balance > 0 ? `You (${loggedInUser?.name}) receive from ${friend?.friendname}` : `You (${loggedInUser?.name}) pay ${friend?.friendname}`}</div>
                </div>
                <div className="input-group">
                  <span className="form-control w-10" align="center">
                    {friend?.currency}
                  </span>
                  <input
                    type="number"
                    className="form-control w-75"
                    placeholder="Settle Amount"
                    value={settleUpAmounts ? Math.abs(settleUpAmounts) : ""} // Display as positive
                    onChange={(e) => {
                      const value = parseFloat(e.target.value);
                      // Always subtract value from balance during settle-up
                      setSettleUpAmounts(value > 0 ? value : 0); // Store positive for easier calculation
                    }}
                    step="any"
                    inputMode="decimal"
                  />
                </div>

                <Button
                  className="btn form-control btn-warning w-100 mt-2"
                  disabled={
                    loading || !settleUpAmounts // Disable when balance is 0
                  }
                  onClick={() => handleSettleUp(friend.email, parseFloat(friend.balance < 0 ? Math.abs(settleUpAmounts) : settleUpAmounts), friend)}
                >
                  {loading ? (
                    <>
                      <span className="px-1">
                        <i className="fas fa-spinner fa-spin text-light"></i>
                      </span>
                      Please wait...
                    </>
                  ) : (
                    "Confirm Settle Up"
                  )}
                </Button>
              </div>
            </Modal.Body>
          </Modal> */}
            <SettleUp friend={friend} balance={parseFloat(Math.abs(friend.balance).toFixed(2))} loggedInUser={loggedInUser} showSettleUp={showSettleUp} setShowSettleUp={setShowSettleUp} refreshBalance={refreshBalance} />
          </>
        )}
      </div>
      <div align="center" style={refreshBtn} className="position-fixed bottom-0">
        <Button className="rounded-circle d-flex align-items-center justify-content-center shadow bg-myapp" onClick={(e) => setrefreshBalance_(refreshBalance_ + 1)} style={{ width: "40px", height: "40px", border: "1px solid white", backgroundColor: "var(--bs-primary)" }} disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <FaSync size={20} />}
        </Button>
      </div>
    </>
  );
};
const refreshBtn = {
  zIndex: 2000,
  left: "90%",
  transform: "translateX(-50%)",
  marginBottom: "75px",
};
const cardStyleGreen = {
  background: "linear-gradient(to right, rgba(34, 139, 34, 0.1), rgba(255, 255, 255, 0.2), rgba(34, 139, 34, 0.1))",
  borderRadius: "5px",
  padding: "1rem",
  color: "#333",
};
const cardStyleRed = {
  background: "linear-gradient(to right, rgba(255, 99, 71, 0.1), rgba(255, 255, 255, 0.2), rgba(255, 99, 71, 0.1))",
  borderRadius: "5px",
  padding: "1rem",
  color: "#333",
};
export default FriendDetail;

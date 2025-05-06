import React, { useState, useEffect, useNavigate } from "react";
import { Modal, Button } from "react-bootstrap";
import AddFriend from "./AddFriend";
import AddExpense from "./AddExpense";
import BalanceSummary from "./BalanceSummary";
import { getData, onAddFriendService, UpdateData, addData, deleteData } from "../service/APIService";
import { v4 as uuid } from "uuid"; // Import UUID for unique IDs
import secureLocalStorage from "react-secure-storage";
import add from "../images/plus2.png";
import settle from "../images/accept.png";
import bin from "../images/bin.png";
import close from "../images/delete.png";
import arrow from "../images/arrow.png";
import { Link } from "react-router-dom";
import { Accordion, Card } from "react-bootstrap";
import { FaArrowRight } from "react-icons/fa";
import { FaEye } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import { FaSync } from "react-icons/fa";
import SettleUp from "./SettleUp";
import { setFriends, setExpenses, setLoggedInUser } from "../store/userSlice";
import { useSelector, useDispatch } from "react-redux";
const Home = () => {
  const location = useLocation();
  const [loggedInUser, setLoggedInUser] = useState(JSON.parse(secureLocalStorage.getItem("loggedInUser")));

  const dispatch = useDispatch();
  const friendsStore = useSelector((state) => state.user.friends);
  const expensesStore = useSelector((state) => state.user.expenses);
  const loggedInUserStore = useSelector((state) => state.user.loggedInUser);

  const [showAddFriend, setShowAddFriend] = useState(false);
  const [refreshBalance_, setrefreshBalance_] = useState(0);
  const [settleupfiltercount, setSettleupfiltercount] = useState(5); // after 5 days if the balance is 0 then it will move settle up collapse
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [selectedFriend, setSelectedFriend] = useState({});
  const [selectedFriendEmail, setSelectedFriendEmail] = useState(null);
  const [selectedCurrency, setSelectedCurrency] = useState(null);
  const [showSettleUp, setShowSettleUp] = useState(false);
  const [friendToSettle, setFriendToSettle] = useState({});
  const [friendToSettleName, setFriendToSettleName] = useState("");
  const [settleUpAmounts, setSettleUpAmounts] = useState("");
  const [loading, setLoading] = useState(false);

  const loggedInUserEmail = secureLocalStorage.getItem("loggedInUserEmail");
  const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
  const [refreshPosition, setRefreshPosition] = useState({ left: "50%", marginBottom: "75px" });
  const [isDragging, setIsDragging] = useState(false);
  // Fetch friends and expenses on mount
  useEffect(() => {
    const initializeData = async () => {
      if (!loggedInUserEmail) return;

      try {
        const userFriends = await getData(loggedInUserEmail, "splitequal-friends");
        const userExpenses = await getData(loggedInUserEmail, "splitequal-expense");

        // Update Redux store
        dispatch(setFriends(userFriends));
        dispatch(setExpenses(userExpenses));
        console.log("saved to store");
        setLoggedInUser(sessionUser);
      } catch (error) {
        console.error("Error initializing data:", error);
      } finally {
        setLoading(false);
      }
    };
    console.log("friendsStore", friendsStore);
    console.log("expensesStore", expensesStore);
    setLoading(true); // Show spinner or loading state only for background refresh
    initializeData();
  }, [loggedInUserEmail, location.state?.refresh || 0, refreshBalance_]);
  // Add a new friend
  const addFriend = async (friend) => {
    if (!loggedInUser) return;
    if (loggedInUser.email === friend.friendemail) {
      alert("Logged user cannot be added a friend.");
      return;
    }
    try {
      // Fetch existing friends to check for duplicates
      const existingFriends = await getData(loggedInUser.email, "splitequal-friends");
      const friendExists = existingFriends.some((f) => f.friendemail === friend.friendemail);
      if (friendExists) {
        alert("This friend already exists.");
        return; // Stop execution if friend exists
      }
      const newFriend = {
        ...friend,
        email: loggedInUser.email,
        id: uuid(),
        balance: 0,
        type: "splitequal-friends",
      };
      console.log(newFriend);
      await addData(newFriend);
      setShowAddFriend(false);
      await refreshBalance();
    } catch (error) {
      console.error("Error adding friend:", error);
    }
  };

  const addExpense = async (expense) => {
    setShowAddExpense(false);
    await refreshBalance();
    return;
  };
  const refreshBalance = async () => {
    const userFriends = await getData(loggedInUser.email, "splitequal-friends");
    dispatch(setFriends(userFriends));
    groupedFriendsMain();
    setrefreshBalance_(refreshBalance_ + 1);
    console.log("update balance", refreshBalance_);
    console.log("friends in home", friendsStore);
  };
  // Remove a friend
  const removeFriend = async (friendId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this friend?");
    if (!isConfirmed) return;
    setLoading(true);
    await deleteData(friendId);
    await getData(loggedInUserEmail, "splitequal-friends");
    setLoading(false);
  };

  const handleSettleUp = async (friendEmail, settleAmount, friendToSettle) => {
    setLoading(true);
    setShowSettleUp(false);
    setLoading(false);
    await refreshBalance();
  };
  // Group friends by balance = 0
  const groupedFriends = friendsStore.reduce(
    (acc, friend) => {
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());

      // Parse friend's date and truncate the time
      const friendDate = new Date(friend.date);
      const startOfFriendDate = new Date(friendDate.getFullYear(), friendDate.getMonth(), friendDate.getDate());
      const timeDiff = startOfToday - startOfFriendDate;
      const daysDiff = Math.floor(timeDiff / (1000 * 60 * 60 * 24));

      console.log("Days Difference:", daysDiff);
      if (friend.balance === 0 && daysDiff > settleupfiltercount) {
        acc.settled.push(friend);
      } else {
        acc.unsettled.push(friend);
      }

      return acc;
    },
    { settled: [], unsettled: [] }
  );
  console.log("groupedFriends", groupedFriends);
  const groupedFriendsMain = friendsStore.reduce((acc, friend) => {
    const today = new Date();
    const friendDate = new Date(friend.date);
    const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const startOfFriendDate = new Date(friendDate.getFullYear(), friendDate.getMonth(), friendDate.getDate());
    const daysDiff = Math.floor((startOfToday - startOfFriendDate) / (1000 * 60 * 60 * 24));
    if (daysDiff <= settleupfiltercount || friend.balance !== 0) {
      if (!acc[friend.friendemail]) {
        acc[friend.friendemail] = [];
      }
      acc[friend.friendemail].push(friend);
    }

    return acc;
  }, {});

  const startDragging = (e) => {
    setIsDragging(true);
    e.preventDefault();
  };

  const stopDragging = () => {
    setIsDragging(false);
  };

  const handleDragging = (e) => {
    if (isDragging) {
      const buttonX = e.clientX;
      const newLeftPercentage = Math.min(Math.max((buttonX / window.innerWidth) * 100, 5), 95);
      setRefreshPosition((prev) => ({ ...prev, left: `${newLeftPercentage}%` }));
    }
  };
  const handleRefresh = () => {
    setLoading(true);
    setrefreshBalance_(refreshBalance_ + 1);
    setTimeout(() => {
      setLoading(false);
    }, 2000);
  };
  const handleLogout = () => {
    secureLocalStorage.removeItem("loggedInUser");
    secureLocalStorage.removeItem("guestUser");
    //navigate("/");
    window.location.reload();
  };

  return (
    <>
      <div className="container">
        <div align="right">
          <p className="mb-0">
            <small>Welcome, {loggedInUser?.name || "Guest"}!</small>
          </p>
        </div>
        <BalanceSummary friends={[...friendsStore]} loggedInUser={loggedInUserEmail} onSettleUp={handleSettleUp} refreshBalance={refreshBalance_} loading={loading} />

        <div className="d-flex justify-content-between align-items-center mb-2">
          <div>
            <h6 className="mb-0">Friends List</h6>
          </div>
          <div>
            {loggedInUserEmail === "guest" ? (
              <a className="btn btn-sm btn-warning" onClick={(e) => handleLogout()}>
                Please Log in
              </a>
            ) : (
              <button className="btn btn-sm btn-warning" onClick={(e) => setShowAddFriend(true)}>
                Add Friend
              </button>
            )}
          </div>
        </div>

        {friendsStore.length === 0 ? (
          "No friends added yet."
        ) : (
          <>
            <ul className="list-group mb-4">
              {Object.entries(groupedFriendsMain)
                .sort(([emailA], [emailB]) => emailA.localeCompare(emailB))
                .map(([friendEmail, friendGroup]) => (
                  <li key={friendEmail} className="p-1 list-group-item">
                    <div>
                      <p className="mb-0 fw-bold">{friendGroup[0].friendname.toUpperCase()}</p>
                    </div>

                    {friendGroup.map((friend) => (
                      <div key={friend.id} className="d-flex justify-content-between pb-1 border-top border-light p-1 align-items-center">
                        <div className="">
                          <small className="px-1">
                            {Number(friend.balance) === 0 ? (
                              <span className="rounded p-1 bg-light">
                                <span className="text-dark border-end pe-1">{friend.currency}</span>
                                <span> (No Balance)</span>
                              </span>
                            ) : (
                              <span className={`rounded py-1 bg-light ${Number(friend.balance) < 0 ? "text-danger" : "text-success"}`}>
                                <span className="form-group  px-1">
                                  <span className="border-end pe-1">{friend.currency}</span>
                                  <b className="border-end pe-1">
                                    {" "}
                                    {Math.abs(friend.balance)
                                      .toFixed(2)
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                  </b>
                                </span>
                                <span className="text-nowrap pe-1">{Number(friend.balance) < 0 ? "You Pay" : "You Receive"} </span>
                              </span>
                            )}
                          </small>
                        </div>

                        <div className="text-nowrap">
                          <a className="mx-1 p-2 px-2 text-decoration-none border rounded badge text-success viewbutton" href={`/friend?id=${friend.id}&friendname=${friendGroup[0].friendname}&friendemail=${friend.friendemail}&currency=${friend.currency}&currencyname=${friend.currencyName}&balance=${Number(friend.balance)}`}>
                            View <FaArrowRight className="me-1 text-success" />
                          </a>
                          <img
                            src={add}
                            alt="Add Expense"
                            width="40"
                            className="px-2 border rounded p-1 mx-1 addexpense"
                            onClick={() => {
                              setrefreshBalance_(refreshBalance_ + 1);
                              setSelectedFriend(friend.friendname);
                              setSelectedFriendEmail(friend.friendemail);
                              setSelectedCurrency(friend.currency);
                              setShowAddExpense(true);
                              setFriendToSettle(friend);
                            }}
                          />
                          {/* <img
                            src={settle}
                            alt="Settle Up"
                            width="40"
                            className="px-2 border rounded p-1 mx-1 "
                            onClick={() => {
                              setrefreshBalance_(refreshBalance_ + 1);
                              setSelectedFriend(friend.friendname);
                              setSelectedFriendEmail(friend.friendemail);
                              setSettleUpAmounts(friend.balance);
                              setShowSettleUp(true);
                              setFriendToSettle(friend);
                            }}
                          />
                          <SettleUp friend={friendToSettle} balance={settleUpAmounts} loggedInUser={loggedInUser} showSettleUp={showSettleUp} setShowSettleUp={setShowSettleUp} refreshBalance={refreshBalance} /> */}
                        </div>
                      </div>
                    ))}
                  </li>
                ))}
            </ul>
            {groupedFriends.settled.length > 0 && (
              <Accordion>
                <Accordion.Item eventKey="0">
                  <Accordion.Header className="p-1">Settled Up Friends ({groupedFriends.settled.length})</Accordion.Header>
                  <Accordion.Body className="p-1">
                    <ul className="list-group">
                      {groupedFriends.settled.map((friend) => (
                        <li key={friend.id} className="p-1 list-group-item border-0 d-flex justify-content-between align-items-center">
                          <small>
                            {friend.friendname.toUpperCase()} - <b>{friend.currency + 0}</b>
                            <span> (No Balance)</span>
                          </small>
                          <span className="text-nowrap">
                            <img
                              src={add}
                              alt="Add Expense"
                              width="40"
                              className="px-2 border rounded p-1 mx-1 addexpense"
                              onClick={() => {
                                setrefreshBalance_(refreshBalance_ + 1);
                                setSelectedFriend(friend.friendname);
                                setSelectedFriendEmail(friend.friendemail);
                                setSelectedCurrency(friend.currency);
                                setShowAddExpense(true);
                                setFriendToSettle(friend);
                              }}
                            />
                            <a className="ms-2 px-2 text-decoration-none border rounded badge text-success viewbutton" href={`/friend?id=${friend.id}&friendname=${friend.friendname}&friendemail=${friend.friendemail}&currency=${friend.currency}&currencyname=${friend.currencyName}&balance=${Number(friend.balance)}`}>
                              <FaArrowRight className="m-1 text-success" />
                            </a>
                          </span>
                        </li>
                      ))}
                    </ul>
                  </Accordion.Body>
                </Accordion.Item>
              </Accordion>
            )}
          </>
        )}

        <Modal show={showAddFriend} onHide={(e) => setShowAddFriend(false)} backdrop="static" keyboard={false}>
          <div className="modal-header">
            <h5 className="modal-title">Add a New Friend</h5>
            <a onClick={(e) => setShowAddFriend(false)}>
              <img src={close} alt="Logo" className="" width="30" />
            </a>
          </div>
          <Modal.Body>
            <AddFriend onAddFriend={addFriend} />
          </Modal.Body>
          <Modal.Footer>
            <button type="button" onClick={(e) => setShowAddFriend(false)} className=" text-dark btn-lg btn-secondary bg-light border mt-2 ms-1 w-25">
              Close
            </button>
          </Modal.Footer>
        </Modal>
        <Modal show={showAddExpense} onHide={(e) => setShowAddExpense(false)} backdrop="static" keyboard={false}>
          <div className="modal-header">
            <p className="mb-0 text-dark">
              Add Expense for <b>{selectedFriend}</b>
            </p>
            <a onClick={(e) => setShowAddExpense(false)}>
              <img src={close} alt="Logo" className="" width="30" />
            </a>
          </div>
          <Modal.Body>
            <AddExpense onAddExpense={addExpense} selectedFriend={selectedFriend} selectedFriendEmail={selectedFriendEmail} loggedInUserName={loggedInUser?.name} selectedCurrency={selectedCurrency} friend={friendToSettle} />
          </Modal.Body>
          <Modal.Footer className="py-1">
            <button type="button" onClick={(e) => setShowAddExpense(false)} className="rounded text-dark btn-lg btn-secondary bg-light border mt-1 ms-1 w-25">
              Close
            </button>
          </Modal.Footer>
        </Modal>
      </div>
      <div align="center" className="position-absolute bottom-0 start-50 translate-middle mb-4 d-none">
        <Button variant="warning" className="btn-small p-1" onClick={(e) => setrefreshBalance_(refreshBalance_ + 1)} disabled={loading}>
          <small>{loading ? "Refreshing..." : "Refresh Balance"}</small>
        </Button>
        <div className="mb-4 py-1"></div>
      </div>
      <div align="center" style={{ ...refreshBtn, left: refreshPosition.left, marginBottom: refreshPosition.marginBottom }} className="position-fixed bottom-0 px-1" onMouseDown={startDragging} onMouseMove={handleDragging} onMouseUp={stopDragging} onMouseLeave={stopDragging}>
        <Button className="rounded-circle d-flex align-items-center justify-content-center shadow bg-myapp" onClick={handleRefresh} style={{ width: "40px", height: "40px", border: "1px solid white" }} disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <FaSync size={20} />}
        </Button>
      </div>
    </>
  );
};
const refreshBtn = {
  zIndex: 1000,
  left: "50%",
  transform: "translateX(-50%)",
  position: "absolute",
};
export default Home;

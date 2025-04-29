import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup, Badge, Alert } from "react-bootstrap";
import { getData, addData, UpdateData, getItemsbyid, getCurrencyName, getCountryCurrency, getItemsbyType, calculateAmountOwedToMember_, getData_Any2Column } from "../service/APIService";
import { v4 as uuid } from "uuid";
import secureLocalStorage from "react-secure-storage";
import { FaTimes, FaPlus, FaUserFriends, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import add from "../images/plus2.png";
import GroupAddExpenseModal from "./GroupAddExpenseModal";
import GroupSummary from "./GroupSummary";
import { FaSync } from "react-icons/fa";
import { useSelector, useDispatch } from "react-redux";
import { setGroups, updateGroup } from "../store/groupSlice";

const GroupExpense = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  //const [groups, setGroups] = useState([]); // use for call api in current page
  const groups = useSelector((state) => state.groups.groups); // redux
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [currentGroup, setCurrentGroup] = useState(null);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("$");
  const [splitType, setSplitType] = useState("equal");
  const [customShares, setCustomShares] = useState({});
  const [loading, setLoading] = useState(false);
  const [friends, setFriends] = useState([]);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [splitError, setSplitError] = useState("");
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);

  const [refreshPosition, setRefreshPosition] = useState({ left: "50%", marginBottom: "75px" });
  const [isDragging, setIsDragging] = useState(false);
  const [refreshBalance_, setrefreshBalance_] = useState(0);
  const refreshBtn = {
    zIndex: 1000,
    left: "50%",
    transform: "translateX(-50%)",
    position: "absolute",
  };
  useEffect(() => {
    // Load logged in user from secure storage
    const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
    setLoggedInUser(sessionUser);

    const fetchCurrencyOptions = () => {
      const options = getCountryCurrency();
      setCurrencyOptions(options);
    };
    fetchCurrencyOptions();
    // Load data when component mounts
    const loadData = async () => {
      if (!sessionUser?.email) return;
      const userFriends = await getData(sessionUser.email, "splitequal-friends");
      setFriends(userFriends);
      if (groups.length > 0) {
        console.log("Groups already in store, skip loading.");
        return; // ❌ Don't reload if already in Redux
      }

      setLoading(true);
      try {
        // Load friends
        const userFriends = await getData(sessionUser.email, "splitequal-friends");
        setFriends(userFriends);

        // Load all groups where user is either creator or member
        const allGroups = await getItemsbyType("splitequal-groups"); // Get all groups

        // Filter groups where user is creator or member
        const userGroups = allGroups.filter(
          (group) =>
            group.email === sessionUser.email || // User is creator
            group.members?.some((member) => member.email === sessionUser.email) // User is member
        );
        const groupsWithExpenses = await Promise.all(
          userGroups.map(async (group) => {
            const expenses = await getData_Any2Column("groupId", group.id, "type", "splitequal-group-expenses");
            return { ...group, expenses };
          })
        );
        //setGroups(groupsWithExpenses);
        dispatch(setGroups(groupsWithExpenses));
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [refreshBalance_]);
  useEffect(() => {
    if (!currentGroup || !amount) return;

    // Initialize shares when switching to equal split
    if (splitType === "equal" && currentGroup.members) {
      const equalShare = parseFloat(amount) / currentGroup.members.length;
      const newShares = {};
      currentGroup.members.forEach((member) => {
        newShares[member.email] = parseFloat(equalShare.toFixed(2));
      });
      setCustomShares(newShares);
    }

    // Initialize percentages when switching to percentage split
    if (splitType === "percentage" && currentGroup.members) {
      const equalPercentage = 100 / currentGroup.members.length.toFixed(2);
      const newShares = {};
      currentGroup.members.forEach((member) => {
        newShares[member.email] = equalPercentage;
      });
      setCustomShares(newShares);
    }
  }, [splitType, currentGroup, amount]);
  const createGroup = async () => {
    if (!groupName || selectedFriends.length === 0) {
      alert("Please provide a group name and select at least one friend");
      return;
    }

    const newGroup = {
      id: uuid(),
      name: groupName,
      members: [{ email: loggedInUser.email, name: loggedInUser.name }, ...selectedFriends.map((f) => ({ email: f.friendemail, name: f.friendname }))],
      currency,
      createdBy: loggedInUser.email,
      email: loggedInUser.email,
      type: "splitequal-groups",
      date: new Date().toISOString(),
    };

    try {
      console.log("newGroup", newGroup);
      await addData(newGroup);
      setGroups([...groups, newGroup]);
      setShowCreateGroup(false);
      setGroupName("");
      setSelectedFriends([]);
    } catch (error) {
      console.error("Error creating group:", error);
    }
  };
  const handleRefresh = async () => {
    if (!loggedInUser?.email) return;
    try {
      setLoading(true);
      const userFriends = await getData(loggedInUser.email, "splitequal-friends");
      setFriends(userFriends);

      const allGroups = await getItemsbyType("splitequal-groups");

      const userGroups = allGroups.filter((group) => group.email === loggedInUser.email || group.members?.some((member) => member.email === loggedInUser.email));

      const groupsWithExpenses = await Promise.all(
        userGroups.map(async (group) => {
          const expenses = await getData_Any2Column("groupId", group.id, "type", "splitequal-group-expenses");
          return { ...group, expenses };
        })
      );

      dispatch(setGroups(groupsWithExpenses));
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

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
  const toggleFriendSelection = (friend) => {
    setSelectedFriends((prev) => (prev.some((f) => f.friendemail === friend.friendemail) ? prev.filter((f) => f.friendemail !== friend.friendemail) : [...prev, friend]));
  };

  const updateCustomShare = (email, value) => {
    setCustomShares((prev) => ({
      ...prev,
      [email]: parseFloat(value) || 0,
    }));
  };

  // Validate shares before saving
  const validateShares = () => {
    const totalAmount = parseFloat(amount) || 0;
    const members = currentGroup?.members || [];

    if (splitType === "percentage") {
      let totalPercentage = 0;
      members.forEach((member) => {
        const percentage = parseFloat(customShares[member.email]) || 0;
        totalPercentage += percentage;
      });

      if (Math.abs(totalPercentage - 100) > 0.01) {
        // Allow for small floating point differences
        setSplitError(`Total percentage must equal 100% (current total: ${totalPercentage.toFixed(2)}%)`);
        return false;
      }
    } else if (splitType === "custom") {
      let totalShares = 0;
      members.forEach((member) => {
        const share = parseFloat(customShares[member.email]) || 0;
        totalShares += share;
      });

      if (Math.abs(totalShares - totalAmount) > 0.01) {
        setSplitError(`Total shares (${totalShares.toFixed(2)}) must equal the expense amount (${totalAmount.toFixed(2)})`);
        return false;
      }
    }

    setSplitError("");
    return true;
  };

  const renderSharesInput = () => {
    if (!currentGroup) return null;

    return (
      <Form.Group className="mb-1">
        <Form.Label>
          {splitType === "percentage" ? "Percentage Shares" : "Custom Shares"}
          {splitType === "percentage" && <span className="text-muted ms-2">(Total must equal 100%)</span>}
          {splitType === "custom" && <span className="text-muted ms-2">(Total must equal {amount})</span>}
        </Form.Label>
        <div className="border rounded p-1">
          {currentGroup.members.map((member) => (
            <div key={member.email} className="d-flex align-items-center mb-0">
              <div className="flex-grow-1">
                {member.name} {member.email === loggedInUser?.email && "(You)"}
              </div>{" "}
              {splitType !== "percentage" && <span className="mx-2">{currency}</span>}{" "}
              <Form.Control
                type="number"
                style={{ width: "100px", height: "50px" }}
                value={customShares[member.email] || ""}
                onChange={(e) => {
                  const value = e.target.value;
                  setCustomShares((prev) => ({
                    ...prev,
                    [member.email]: value ? parseFloat(value) : 0,
                  }));
                }}
                placeholder={splitType === "percentage" ? "0%" : "0"}
                min="0"
                step={splitType === "percentage" ? "1" : "0.01"}
                suffix={splitType === "percentage" ? "%" : ""}
              />
            </div>
          ))}
        </div>
      </Form.Group>
    );
  };

  return (
    <div className="container">
      <div className="d-flex justify-content-between align-items-middle mb-1">
        <p className="mb-0">
          <Button variant="warning" className="p-1 px-2 text-nowrap" onClick={() => setShowCreateGroup(true)}>
            Create Group
          </Button>
        </p>
        <p className="mb-0">
          <small>Welcome, {loggedInUser?.name || "Guest"}!</small>
        </p>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-warning" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading groups and friends...</p>
        </div>
      ) : (
        <>
          <div className="input-group w-auto">
            <input type="text" className="form-control form-control-sm w-75" placeholder="Search Groups" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            {searchText && (
              <Button variant="outline-secondary" className="form-control w-10" size="sm" onClick={() => setSearchText("")}>
                x
              </Button>
            )}
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-4">
              <FaUserFriends size={48} className="text-muted mb-3" />
              <p>No groups created yet</p>
            </div>
          ) : groups.filter((group) => group.name.toLowerCase().includes(searchText.toLowerCase())).length === 0 ? (
            <div className="text-center py-4">
              <p>No groups found</p>
              {searchText && (
                <Button variant="outline-secondary" onClick={() => setSearchText("")}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            <ListGroup>
              {groups
                .filter((group) => group.name.toLowerCase().includes(searchText.toLowerCase()))
                .map((group) => {
                  const userBalance = group.balances?.[loggedInUser?.email] || 0;
                  return (
                    <ListGroup.Item key={group.id} className="mb-0">
                      <div className="d-flex1 justify-content-between align-items-center">
                        <div>
                          <div className="d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 color-myapp" style={{ cursor: "pointer" }} onClick={() => navigate(`/group/${group.id}`, { state: { group } })}>
                              <b>{group.name}</b>{" "}
                              <small className="text-muted mb-0">
                                {group.members.length} members • {group.currency}
                              </small>
                            </h6>
                            <div>
                              <a className="mx-1 p-2 px-2 text-decoration-none border1 rounded badge text-success viewbutton" style={{ cursor: "pointer" }} onClick={() => navigate(`/group/${group.id}`, { state: { group } })}>
                                View <FaArrowRight className="me-1 text-success" />
                              </a>

                              <img
                                src={add}
                                alt="Add Expense"
                                width="35"
                                className="px-2 p-2 border1  rounded   addexpense"
                                onClick={() => {
                                  setCurrentGroup(group);
                                  setShowAddExpense(true);
                                  setSplitError("");
                                  setCurrency(group.currency);
                                }}
                              />
                            </div>
                          </div>
                          <div className="px-2">
                            <GroupSummary group={group} page="home" loggedInUser={loggedInUser} calculateAmountOwedToMember_={(memberEmail) => calculateAmountOwedToMember_(group.expenses || [], loggedInUser, memberEmail)} />
                          </div>
                          {/* Summary here */}
                        </div>
                      </div>
                    </ListGroup.Item>
                  );
                })}
            </ListGroup>
          )}
        </>
      )}
      {/* Create Group Modal */}
      <Modal show={showCreateGroup} onHide={() => setShowCreateGroup(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Create New Group</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-3">
            <Form.Label>Group Name</Form.Label>
            <Form.Control type="text" value={groupName} onChange={(e) => setGroupName(e.target.value)} placeholder="Enter group name" />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Default Currency</Form.Label>
            <Form.Select value={currency} onChange={(e) => setCurrency(e.target.value)} required>
              {currencyOptions.map((option) => (
                <option key={option.currency} value={option.currency}>
                  {option.currencyName} ({option.currency})
                </option>
              ))}
            </Form.Select>
          </Form.Group>

          <Form.Group>
            <Form.Label>Select Friends</Form.Label>
            <div className="border rounded p-2" style={{ maxHeight: "200px", overflowY: "auto" }}>
              {friends.map((friend) => (
                <Form.Check key={friend.friendemail} type="checkbox" label={friend.friendname} checked={selectedFriends.some((f) => f.friendemail === friend.friendemail)} onChange={() => toggleFriendSelection(friend)} />
              ))}
            </div>
          </Form.Group>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowCreateGroup(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={createGroup}>
            Create Group
          </Button>
        </Modal.Footer>
      </Modal>
      {/* Add Group Expense Modal */}

      {/* <GroupAddExpenseModal
        show={showAddExpense}
        onHide={() => setShowAddExpense(false)}
        currentGroup={currentGroup}
        loggedInUser={loggedInUser}
        onExpenseAdded={(updatedGroup) => {
          setGroups(groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
          setCurrentGroup(updatedGroup);
        }}
      /> */}
      <GroupAddExpenseModal show={showAddExpense} page="home" onHide={() => setShowAddExpense(false)} currentGroup={currentGroup} loggedInUser={loggedInUser} />
      <div align="center" style={{ ...refreshBtn, left: refreshPosition.left, marginBottom: refreshPosition.marginBottom }} className="position-fixed bottom-0 px-1" onMouseDown={startDragging} onMouseMove={handleDragging} onMouseUp={stopDragging} onMouseLeave={stopDragging}>
        <Button className="rounded-circle d-flex align-items-center justify-content-center shadow bg-myapp" onClick={handleRefresh} style={{ width: "40px", height: "40px", border: "1px solid white" }} disabled={loading}>
          {loading ? <i className="fas fa-spinner fa-spin"></i> : <FaSync size={20} />}
        </Button>
      </div>
    </div>
  );
};

export default GroupExpense;

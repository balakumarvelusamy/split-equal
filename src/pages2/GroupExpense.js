import React, { useState, useEffect } from "react";
import { Modal, Button, Form, ListGroup, Badge, Alert } from "react-bootstrap";
import { getData, addData, UpdateData, getItemsbyid, getCurrencyName, getCountryCurrency, getItemsbyType } from "../service/APIService";
import { v4 as uuid } from "uuid";
import secureLocalStorage from "react-secure-storage";
import { FaTimes, FaPlus, FaUserFriends, FaArrowRight, FaExclamationTriangle } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import add from "../images/plus2.png";

const GroupExpense = () => {
  const navigate = useNavigate();
  const [showCreateGroup, setShowCreateGroup] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState([]);
  const [groups, setGroups] = useState([]);
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

        setGroups(userGroups);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);
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

  const addGroupExpense = async (currency) => {
    if (!description || !amount || !currentGroup) {
      setSplitError("Please fill all fields.");
      return;
    }

    if (!validateShares()) {
      return;
    }

    setLoading(true);
    const shares = calculateShares();
    const expenseId = uuid();
    const currencyName = await getCurrencyName(currency);

    try {
      // Create expense record
      const groupExpense = {
        id: expenseId,
        groupId: currentGroup.id,
        description,
        amount: parseFloat(amount).toFixed(2),
        currency,
        currencyName,
        splitType,
        shares,
        paidBy: loggedInUser.email,
        email: loggedInUser.email,
        type: "splitequal-group-expenses",
        date: new Date().toISOString(),
      };

      // Add the expense to the database
      await addData(groupExpense);

      // Update group balances
      const updatedGroup = { ...currentGroup };
      if (!updatedGroup.balances) {
        updatedGroup.balances = {};
      }

      // Calculate new balances
      currentGroup.members.forEach((member) => {
        const memberEmail = member.email;
        const shareAmount = shares[memberEmail] || 0;

        if (!updatedGroup.balances[memberEmail]) {
          updatedGroup.balances[memberEmail] = 0;
        }

        if (memberEmail === loggedInUser.email) {
          // The payer's balance increases (they should receive money from others)
          updatedGroup.balances[memberEmail] += shareAmount * (currentGroup.members.length - 1);
        } else {
          // Other members' balances decrease (they owe money to payer)
          updatedGroup.balances[memberEmail] -= shareAmount;
        }

        // Round to 2 decimal places
        updatedGroup.balances[memberEmail] = parseFloat(updatedGroup.balances[memberEmail].toFixed(2));
      });

      // Update the group in the database
      await UpdateData(updatedGroup);

      // Update the local state
      setGroups(groups.map((g) => (g.id === updatedGroup.id ? updatedGroup : g)));
      setCurrentGroup(updatedGroup);

      // Reset form
      setDescription("");
      setAmount("");
      setCustomShares({});
      setShowAddExpense(false);
    } catch (error) {
      console.error("Error adding group expense:", error);
    } finally {
      setLoading(false);
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

  const calculateShares = () => {
    const totalAmount = parseFloat(amount) || 0;
    const members = currentGroup?.members || [];

    if (splitType === "equal") {
      const equalShare = totalAmount / members.length;
      const shares = {};
      members.forEach((member) => {
        shares[member.email] = equalShare;
      });
      return shares;
    } else if (splitType === "percentage") {
      const shares = {};
      let totalPercentage = 0;

      // Calculate total percentage entered
      members.forEach((member) => {
        const percentage = parseFloat(customShares[member.email]) || 0;
        totalPercentage += percentage;
        shares[member.email] = (totalAmount * percentage) / 100;
      });

      return shares;
    } else {
      // Custom shares - just return the custom values
      return customShares;
    }
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
      <div align="right">
        <p className="mb-0">
          <small>Welcome, {loggedInUser?.name || "Guest"}!</small>
        </p>
      </div>
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading groups and friends...</p>
        </div>
      ) : (
        <>
          <div className="d-flex justify-content-between align-items-center my-2">
            <h5>Groups</h5>
            <Button variant="warning" onClick={() => setShowCreateGroup(true)}>
              <FaPlus /> Create Group
            </Button>
          </div>

          {groups.length === 0 ? (
            <div className="text-center py-4">
              <FaUserFriends size={48} className="text-muted mb-3" />
              <p>No groups created yet</p>
            </div>
          ) : (
            <ListGroup>
              {groups.map((group) => {
                const userBalance = group.balances?.[loggedInUser?.email] || 0;
                return (
                  <ListGroup.Item key={group.id} className="mb-0">
                    <div className="d-flex justify-content-between align-items-center">
                      <div>
                        <h6 className="mb-2" style={{ cursor: "pointer" }} onClick={() => navigate(`/group/${group.id}`, { state: { group } })}>
                          {group.name} <FaArrowRight className="me-1 text-success" />
                        </h6>
                        <small className="text-muted mb-0">
                          {group.members.length} members • {group.currency}
                        </small>
                      </div>
                      <div>
                        <a className="mx-1 p-2 px-2 text-decoration-none border rounded badge text-success viewbutton" style={{ cursor: "pointer" }} onClick={() => navigate(`/group/${group.id}`, { state: { group } })}>
                          View <FaArrowRight className="me-1 text-success" />
                        </a>

                        <img
                          src={add}
                          alt="Add Expense"
                          width="40"
                          className="px-2 border  rounded p-1 mx-2 addexpense"
                          onClick={() => {
                            setCurrentGroup(group);
                            setShowAddExpense(true);
                            setSplitError("");
                            setCurrency(group.currency);
                          }}
                        />
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
      <Modal show={showAddExpense} onHide={() => setShowAddExpense(false)} size="lg">
        <Modal.Header closeButton>
          <b>Add Group Expense - {currentGroup?.name}</b>
        </Modal.Header>
        <Modal.Body>
          <Form.Group className="mb-1">
            <b>Description*</b>
            <Form.Control type="text" value={description} required onChange={(e) => setDescription(e.target.value)} placeholder="What was this expense for?" />
          </Form.Group>

          <div className="row mb-1">
            <div className="col-md-6">
              <b>Amount*</b>
              <Form.Control type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" />
            </div>
            <div className="col-md-6">
              <b>Currency*</b>

              <Form.Control as="select" value={currency} disabled onChange={(e) => setCurrency(e.target.value)} required>
                {currencyOptions.map((option) => (
                  <option key={option.currency} value={option.currency}>
                    {option.currencyName} ({option.currency})
                  </option>
                ))}
              </Form.Control>
            </div>
          </div>

          <Form.Group className="mb-1">
            <b>Split Type*</b>
            <div>
              <Form.Check type="radio" label="Equal" name="splitType" checked={splitType === "equal"} onChange={() => setSplitType("equal")} inline />
              <Form.Check type="radio" label="Percentage" name="splitType" checked={splitType === "percentage"} onChange={() => setSplitType("percentage")} inline />
              <Form.Check type="radio" label="Custom" name="splitType" checked={splitType === "custom"} onChange={() => setSplitType("custom")} inline />
            </div>
          </Form.Group>

          {splitType !== "equal" && renderSharesInput()}

          {splitError && (
            <Alert variant="danger" className="mt-1 p-1">
              <FaExclamationTriangle className="me-2" />
              {splitError}
            </Alert>
          )}

          <div className="alert alert-info mt-3 p-1">
            <strong>Summary:</strong>
            <ul className="mt-1 mb-0">
              {currentGroup?.members.map((member) => {
                const share = calculateShares()[member.email] || 0;
                return (
                  <li key={member.email}>
                    {member.name}: {currency} {share.toFixed(2)}
                    {splitType === "percentage" && ` (${(customShares[member.email] || 0).toFixed(2)}%)`}
                  </li>
                );
              })}
            </ul>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowAddExpense(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={(e) => addGroupExpense(currency)} disabled={loading}>
            {loading ? "Saving..." : "Add Expense"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GroupExpense;

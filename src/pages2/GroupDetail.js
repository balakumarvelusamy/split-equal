import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getData_Any2Column, addData, calculateAmountOwedToMember_, UpdateData } from "../service/APIService";
import { Modal, Button, Form, ListGroup, Badge, Alert } from "react-bootstrap";
import { FaArrowLeft, FaRecycle } from "react-icons/fa";
import { v4 as uuid } from "uuid";
import secureLocalStorage from "react-secure-storage";
import GroupAddExpenseModal from "./GroupAddExpenseModal";
import GroupSummary from "./GroupSummary";
import { useDispatch, useSelector } from "react-redux";
import { updateGroup } from "../store/groupSlice";
import GroupChatModal from "../components2/GroupChatModal";
import { FaSync, FaComment, FaComments } from "react-icons/fa";
const GroupDetail = () => {
  const { groupId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState("");
  const [refreshBalance_, setrefreshBalance_] = useState(0);
  // State to control visible expense count for "Load More"
  const [visibleExpensesCount, setVisibleExpensesCount] = useState(10);
  const groups = useSelector((state) => state.groups.groups);
  const [group, setGroup] = useState(state?.group || null);
  const [showAddMemberModal, setShowAddMemberModal] = useState(false);
  const [newMemberName, setNewMemberName] = useState("");
  const [newMemberEmail, setNewMemberEmail] = useState("");
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [memberBalances, setMemberBalances] = useState({});
  const [netBalance, setNetBalance] = useState(0);
  const [showChatModal, setShowChatModal] = useState(false);
  // Expense Modal State
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [showExpenseModal, setShowExpenseModal] = useState(false);

  const [refreshPosition, setRefreshPosition] = useState({ left: "90%", marginBottom: "75px" });
  const [isDragging, setIsDragging] = useState(false);
  const refreshBtn = {
    zIndex: 1000,
    left: "90%",
    transform: "translateX(-50%)",
    position: "absolute",
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
  const handleChats = async () => {
    if (!loggedInUser?.email) return;
    try {
    } catch (error) {
      console.error("Error refreshing data:", error);
    } finally {
      setLoading(false);
    }
  };

  const calculateBalancesFromExpenses = useCallback(
    (expenses) => {
      if (!loggedInUser?.email) return;

      let totalOwedByUser = 0;
      let totalOwedToUser = 0;

      expenses.forEach((expense) => {
        if (expense.isdeleted === 1) return;
        const paidBy = expense.paidBy;
        const shares = expense.shares || {};
        const userShare = shares[loggedInUser.email] || 0;

        if (paidBy === loggedInUser.email) {
          totalOwedToUser += parseFloat(expense.amount) - parseFloat(userShare);
        } else if (userShare > 0) {
          totalOwedByUser += parseFloat(userShare);
        }
      });

      setNetBalance(totalOwedToUser - totalOwedByUser);
    },
    [loggedInUser]
  );
  useEffect(() => {
    const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
    setLoggedInUser(sessionUser);

    const loadGroupData = async () => {
      try {
        // 1. Use existing Redux store group (if available)
        if (group && group.expenses?.length > 0) {
          setExpenses(group.expenses);
          calculateBalancesFromExpenses(group.expenses.filter((exp) => exp.isdeleted !== 1));
        }

        // 2. Fetch latest data in the background
        const groupExpenses = await getData_Any2Column("groupId", groupId, "type", "splitequal-group-expenses");
        const filteredExpenses = groupExpenses.filter((exp) => exp.isdeleted !== 1);
        const sortedExpenses = groupExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));

        setExpenses(sortedExpenses);
        calculateBalancesFromExpenses(filteredExpenses);

        const groupData = await getData_Any2Column("id", groupId, "type", "splitequal-groups");
        const fullGroup = { ...groupData[0], expenses: sortedExpenses };

        setGroup(fullGroup);
        dispatch(updateGroup(fullGroup));
      } catch (error) {
        console.error("Error loading group data:", error);
      }
    };

    loadGroupData();
  }, [groupId, refreshBalance_]);

  // Calculate your balance (logged in user)
  const yourBalance = memberBalances[group?.email] || 0;

  const handleSettleUp = async (payerEmail, recipientEmail, amount) => {
    if (!payerEmail || !recipientEmail || !amount || !group?.id) {
      console.error("Missing required parameters for settlement");
      return;
    }

    try {
      if (typeof amount !== "number" || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      const maxAmount = Math.abs(calculateAmountOwedToMember1(recipientEmail));
      if (amount > maxAmount) {
        throw new Error(`Amount cannot exceed ${maxAmount.toFixed(2)}`);
      }
      const payerName = group.members.find((m) => m.email === payerEmail)?.name || payerEmail;
      const recipientName = group.members.find((m) => m.email === recipientEmail)?.name || recipientEmail;
      const settlement = {
        id: uuid(),
        groupId: group.id,
        description: `Settle Up b/w ${payerName} and ${recipientName}`,
        amount: parseFloat(amount).toFixed(2),
        currency: group.currency,
        currencyName: group.currencyName,
        splitType: "settleup-group",
        paidBy: payerEmail,
        paidByName: payerName,
        email: loggedInUser.email,
        type: "splitequal-group-expenses",
        date: new Date().toISOString(),
        settlementData: {
          payerEmail,
          payerName,
          recipientEmail,
          recipientName,
          isSettlement: true,
        },
      };

      await addData(settlement);

      // Update state in a single operation to avoid multiple re-renders
      const updatedExpenses = [settlement, ...expenses];
      setExpenses(updatedExpenses);
      calculateBalancesFromExpenses(updatedExpenses);

      setShowSettleModal(false);
      setSettleAmount("");
      setSelectedRecipient(null);
    } catch (error) {
      console.error("Settlement failed:", error.message || error);
      alert(`Settlement failed: ${error.message}`);
    }
  };
  const calculateMaxSettlement_old = (payerEmail, recipientEmail) => {
    let payerDebt = 0;
    let recipientCredit = 0;

    expenses.forEach((expense) => {
      const paidBy = expense.paidBy;
      const payerShare = expense.shares?.[payerEmail] || 0;
      const recipientShare = expense.shares?.[recipientEmail] || 0;

      if (paidBy === recipientEmail && payerShare > 0) {
        // You owe this recipient
        payerDebt += parseFloat(payerShare);
      } else if (paidBy === payerEmail && recipientShare > 0) {
        // They owe you (reduces your debt)
        payerDebt -= parseFloat(recipientShare);
      }

      if (paidBy === payerEmail && recipientShare > 0) {
        // You paid, they owe you
        recipientCredit += parseFloat(recipientShare);
      } else if (paidBy === recipientEmail && payerShare > 0) {
        // They paid, you owe them (reduces what they're owed)
        recipientCredit -= parseFloat(payerShare);
      }
    });

    // The maximum you can settle is the minimum between what you owe and what they're owed
    return Math.min(payerDebt, recipientCredit).toFixed(2);
  };

  const calculateAmountOwedToMember1 = (memberEmail) => {
    let rawAmountOwed = 0;
    let totalSettledAmount = 0;

    // 1. Calculate raw amount owed (before settlements)
    expenses.forEach((expense) => {
      if (expense.splitType !== "settleup-group") {
        const paidBy = expense.paidBy;
        const userShare = expense.shares?.[loggedInUser?.email] || 0;
        const memberShare = expense.shares?.[memberEmail] || 0;

        if (paidBy === memberEmail && userShare > 0) {
          rawAmountOwed += parseFloat(userShare); // You owe them
        } else if (paidBy === loggedInUser?.email && memberShare > 0) {
          rawAmountOwed -= parseFloat(memberShare); // They owe you
        }
      }
    });

    // 2. Sum all settle-up transactions between the two members
    expenses.forEach((expense) => {
      if (expense.splitType === "settleup-group") {
        const settlement = expense.settlementData;

        const isBetweenMembers = (settlement?.payerEmail === loggedInUser?.email && settlement?.recipientEmail === memberEmail) || (settlement?.payerEmail === memberEmail && settlement?.recipientEmail === loggedInUser?.email);

        if (isBetweenMembers) {
          totalSettledAmount += Math.abs(parseFloat(expense.amount || 0));
        }
      }
    });

    // 3. Final amount owed after subtracting all settlements
    const finalAmountOwed = Math.abs(rawAmountOwed) - totalSettledAmount;

    // Preserve the direction (who owes whom)
    return rawAmountOwed >= 0 ? finalAmountOwed : -finalAmountOwed;
  };
  if (loading) {
    return (
      <div className="groupheader text-center py-5">
        <div className="spinner-border text-info" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p>Loading groups details..</p>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="groupheader text-center py-5">
        <p>Group not found</p>
      </div>
    );
  }

  const userBalance = group.balances?.[group.email] || 0;

  // Add Member Handler
  const handleAddMember = async () => {
    if (!newMemberName || !newMemberEmail) {
      alert("Please fill out name and email.");
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newMemberEmail)) {
      alert("Please enter a valid email address.");
      return;
    }
    const existingMember = group.members.find((member) => member.email === newMemberEmail);
    if (existingMember) {
      alert("Member already exists in the group.");
      return;
    }
    const updatedGroup = { ...group };
    updatedGroup.members = [...updatedGroup.members, { name: newMemberName, email: newMemberEmail }];
    try {
      await UpdateData(updatedGroup);
      //setGroup(updatedGroup); //redux
      dispatch(updateGroup(updatedGroup));
      const matchingGroup = groups.find((g) => g.id === updatedGroup.id);
      if (matchingGroup) {
        setGroup(matchingGroup);
      }
      setShowAddMemberModal(false);
      setNewMemberName("");
      setNewMemberEmail("");
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };
  // Delete Member Handler for Add Member Modal
  const handleDeleteMember = async (memberToDelete) => {
    if (!window.confirm(`Are you sure you want to remove ${memberToDelete.name} from the group?`)) {
      return;
    }

    const updatedGroup = {
      ...group,
      members: group.members.filter((m) => m.email !== memberToDelete.email),
    };

    try {
      await UpdateData(updatedGroup);
      //setGroup(updatedGroup); //redux
      dispatch(updateGroup(updatedGroup));
      const matchingGroup = groups.find((g) => g.id === updatedGroup.id);
      if (matchingGroup) {
        setGroup(matchingGroup);
      }
    } catch (error) {
      console.error("Failed to delete member:", error);
    }
  };
  return (
    <>
      <header className="groupheader bg-myapp p-3 text-white">
        <div className="d-flex justify-content-between align-items-middle mb-1">
          {/* Back Button */}
          <span onClick={() => navigate(-1)} style={{ cursor: "pointer" }}>
            <small>
              {" "}
              <FaArrowLeft className="me-1 text-warning" /> Back
            </small>{" "}
          </span>
          <small className="text-white">Group Details </small>
          {/* Welcome Text */}
          <p className="mb-0">
            <small>
              {" "}
              <span>
                <i className="fi fi-rr-user"></i>
              </span>{" "}
              {loggedInUser?.name || "Guest"}!
            </small>
          </p>
        </div>

        <div className="p-2">
          <div className="d-flex justify-content-between">
            <h4 className="py-1 bg-myapp w-75 myapp-text-warning  mb-1">{group?.name}</h4>
            <small className="text-white py-1" style={{ cursor: "pointer", textDecoration: "underline" }} onClick={() => setShowAddMemberModal(true)}>
              {group?.members?.length} members
            </small>
          </div>

          <GroupSummary group={group} page="groupdetails" loggedInUser={loggedInUser} calculateAmountOwedToMember_={(memberEmail) => calculateAmountOwedToMember_(expenses || [], loggedInUser, memberEmail)} />
          <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
            <Button variant="warning" size="sm" onClick={() => setShowAddExpenseModal(true)}>
              Add Expense
            </Button>
            <Button variant={"warning"} size="sm" onClick={() => setShowSettleModal(true)}>
              Settle Up
            </Button>
          </div>
        </div>
      </header>
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading groups details..</p>
        </div>
      ) : (
        <div className="container mt-3">
          {/* Expense History */}
          <div className="input-group w-auto">
            <input type="text" className="form-control w-75" placeholder="Search Groups Expense" value={searchText} onChange={(e) => setSearchText(e.target.value)} />
            {searchText && (
              <Button variant="outline-secondary" className="form-control w-auto" size="sm" onClick={() => setSearchText("")}>
                x
              </Button>
            )}
          </div>
          <h6>Expense History</h6>
          {expenses.length === 0 ? (
            <div className="alert alert-info">No expenses yet</div>
          ) : expenses.filter((expense) => JSON.stringify(expense).toLowerCase().includes(searchText.toLowerCase())).length === 0 ? (
            <div className="text-center py-4">
              <p>No Expense found</p>
              {searchText && (
                <Button variant="outline-secondary" onClick={() => setSearchText("")}>
                  Clear Search
                </Button>
              )}
            </div>
          ) : (
            (() => {
              const filteredExpenses = expenses.filter((expense) => JSON.stringify(expense).toLowerCase().includes(searchText.toLowerCase()));
              const visibleExpenses = filteredExpenses.slice(0, visibleExpensesCount);
              return (
                <ListGroup>
                  {visibleExpenses.map((expense) => {
                    const dateObj = new Date(expense.date);
                    const formattedDayMonth = dateObj.toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "short",
                    });

                    return (
                      <ListGroup.Item key={expense.id} className="p-1">
                        <div className="d-flex justify-content-between p-0">
                          <div>
                            <h6
                              className={`mb-0 color-myapp  ${expense.isdeleted ? "text-decoration-line-through" : ""}`}
                              style={{ cursor: "pointer", color: "blue" }}
                              onClick={() => {
                                setSelectedExpense(expense);
                                setShowExpenseModal(true);
                              }}
                            >
                              {expense.description}
                            </h6>
                            <span className="text-center px-1 bg-light rounded text-nowrap ">
                              <small>{formattedDayMonth}</small>
                            </span>{" "}
                            <small className="text-muted">| Split: {expense?.splitType}</small> <small className="text-muted">| PaidBy: {expense?.paidByName}</small>
                          </div>
                          <div>
                            <span className={`fw-bold text-muted ${expense.isdeleted ? "text-decoration-line-through" : ""}`}>
                              {expense.currency}
                              {expense.amount}
                            </span>
                          </div>
                        </div>
                      </ListGroup.Item>
                    );
                  })}

                  {filteredExpenses.length > visibleExpensesCount && (
                    <div className="text-center my-2">
                      <button className="btn btn-warning" onClick={() => setVisibleExpensesCount((prev) => prev + 20)}>
                        Load More
                      </button>
                    </div>
                  )}
                </ListGroup>
              );
            })()
          )}

          <div align="center" style={{ ...refreshBtn, left: refreshPosition.left, marginBottom: refreshPosition.marginBottom }} className="position-fixed bottom-0 px-1" onMouseDown={startDragging} onMouseMove={handleDragging} onMouseUp={stopDragging} onMouseLeave={stopDragging}>
            <Button className="rounded-circle d-flex align-items-center justify-content-center shadow bg-myapp p-1" onClick={() => setShowChatModal(true)} style={{ width: "40px", height: "40px", border: "1px solid white" }} disabled={loading}>
              <FaComments />
            </Button>
          </div>

          <Modal show={showSettleModal} onHide={() => setShowSettleModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Settle Up in {group?.name}</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <Form.Group className="mb-3">
                <Form.Label>Recipient</Form.Label>
                <Form.Select
                  value={selectedRecipient?.email || ""}
                  onChange={(e) => {
                    const recipientEmail = e.target.value;
                    const recipient = group?.members?.find((m) => m.email === recipientEmail);
                    setSelectedRecipient(recipient || null);
                    setSettleAmount("");
                  }}
                  required
                >
                  <option value="">Select who to pay</option>
                  {group?.members
                    ?.filter((member) => {
                      const amountOwed = calculateAmountOwedToMember1(member.email);
                      return member.email !== loggedInUser?.email && Math.abs(amountOwed) > 0.01;
                    })
                    .map((member) => {
                      const amountOwed = calculateAmountOwedToMember1(member.email);
                      return (
                        <option key={member.email} value={member.email}>
                          {member.name} ({amountOwed > 0 ? "Receives" : "Pays"} {group?.currency}
                          {Math.abs(amountOwed.toFixed(2))})
                        </option>
                      );
                    })}
                </Form.Select>
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label>Amount to Settle</Form.Label>
                <Form.Control
                  type="number"
                  value={settleAmount}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                      setSettleAmount(value);
                    }
                  }}
                  placeholder={selectedRecipient ? `Max: ${Math.abs(calculateAmountOwedToMember1(selectedRecipient.email).toFixed(2))}` : "Select recipient first"}
                  min="0.01"
                  step="0.01"
                  max={selectedRecipient ? calculateAmountOwedToMember1(selectedRecipient.email) : undefined}
                  disabled={!selectedRecipient}
                  required
                />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowSettleModal(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={() => {
                  if (selectedRecipient && settleAmount) {
                    handleSettleUp(loggedInUser?.email, selectedRecipient.email, parseFloat(Math.abs(settleAmount)));
                  }
                }}
                disabled={!selectedRecipient || !settleAmount}
              >
                Confirm Settlement
              </Button>
            </Modal.Footer>
          </Modal>

          <GroupAddExpenseModal
            show={showAddExpenseModal}
            onHide={() => setShowAddExpenseModal(false)}
            currentGroup={group}
            loggedInUser={loggedInUser}
            onExpenseAdded={(updatedGroup) => {
              //setGroup(updatedGroup); redux
              const loadExpenses = async () => {
                const groupExpenses = await getData_Any2Column("groupId", groupId, "type", "splitequal-group-expenses");
                const sortedExpenses = groupExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
                setExpenses(sortedExpenses);
                calculateBalancesFromExpenses(sortedExpenses);
              };
              loadExpenses();
              const matchingGroup = groups.find((g) => g.id === updatedGroup.id);
              if (matchingGroup) {
                setGroup(matchingGroup);
              }
              dispatch(updateGroup(updatedGroup));
            }}
          />
          <GroupChatModal show={showChatModal} onHide={() => setShowChatModal(false)} groupId={group.id} loggedInUser={loggedInUser} />

          {/* Add Member Modal */}
          <Modal show={showAddMemberModal} onHide={() => setShowAddMemberModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Add New Member</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <div className="mb-3">
                <h6>Existing Members:</h6>
                <ul className="list-unstyled ps-2">
                  {group?.members?.map((member) => (
                    <li key={member.email} className="py-1 d-flex justify-content-between align-items-center">
                      <small>
                        {member.name} ({member.email})
                      </small>
                      {/* {calculateAmountOwedToMember1(member.email) === 0 && member.email !== loggedInUser?.email && (
                        <Button variant="danger" size="sm" onClick={() => handleDeleteMember(member)}>
                          Delete
                        </Button>
                      )} */}
                    </li>
                  ))}
                </ul>
                <hr />
              </div>
              <Form.Group className="mb-3">
                <Form.Label>Member Name</Form.Label>
                <Form.Control type="text" placeholder="Enter member name" required value={newMemberName} onChange={(e) => setNewMemberName(e.target.value)} />
              </Form.Group>
              <Form.Group className="mb-3">
                <Form.Label>Member Email</Form.Label>
                <Form.Control type="email" placeholder="Enter member email" required value={newMemberEmail} pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$" onChange={(e) => setNewMemberEmail(e.target.value)} />
              </Form.Group>
            </Modal.Body>
            <Modal.Footer>
              <Button variant="secondary" onClick={() => setShowAddMemberModal(false)}>
                Cancel
              </Button>
              <Button variant="primary" onClick={handleAddMember}>
                Add Member
              </Button>
            </Modal.Footer>
          </Modal>

          {/* Expense Details Modal */}
          <Modal show={showExpenseModal} onHide={() => setShowExpenseModal(false)}>
            <Modal.Header closeButton>
              <Modal.Title>Expense Details</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              {selectedExpense && (
                <>
                  {/* <Form.Group className="mb-2">
                    <Form.Label>Description</Form.Label>
                    <Form.Control type="text" value={selectedExpense.description} onChange={(e) => setSelectedExpense({ ...selectedExpense, description: e.target.value })} />
                  </Form.Group> */}
                  <p className="mb-0">
                    <strong>Description:</strong> {selectedExpense.description}
                  </p>

                  <p className="mb-0">
                    <strong>Amount:</strong> {selectedExpense.amount}
                  </p>
                  <p className="mb-0">
                    <strong>Split Type:</strong> {selectedExpense.splitType}
                  </p>

                  <p className="mb-0">
                    <strong>Shares:</strong>
                  </p>
                  <ul className="list-unstyled ps-3">
                    {selectedExpense.shares &&
                      Object.entries(selectedExpense.shares).map(([email, share]) => (
                        <li key={email}>
                          {email}: {share}
                        </li>
                      ))}
                  </ul>
                </>
              )}
            </Modal.Body>
            <Modal.Footer>
              {!selectedExpense?.isdeleted ? (
                <>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      const updated = { ...selectedExpense, isdeleted: 1 };
                      await UpdateData(updated);
                      setrefreshBalance_(refreshBalance_ + 1);
                      setShowExpenseModal(false);
                    }}
                  >
                    {!loading ? "Delete" : "Deleting"}
                  </Button>
                  {/* <Button
                    variant="primary"
                    onClick={async () => {
                      await UpdateData(selectedExpense);
                      setrefreshBalance_(refreshBalance_ + 1);
                      setShowExpenseModal(false);
                    }}
                  >
                    {!loading ? "Save" : "Saving"}
                  </Button> */}
                </>
              ) : (
                <>
                  <span className="text-danger px-2">Status: Deleted</span>
                  <Button
                    variant="danger"
                    onClick={async () => {
                      const updated = { ...selectedExpense, isdeleted: 0 };
                      await UpdateData(updated);
                      setrefreshBalance_(refreshBalance_ + 1);
                      setShowExpenseModal(false);
                    }}
                  >
                    <FaRecycle className="me-1" /> Restore
                  </Button>
                </>
              )}
              <Button variant="secondary" onClick={() => setShowExpenseModal(false)}>
                Close
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
};

export default GroupDetail;

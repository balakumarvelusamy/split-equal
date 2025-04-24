import React, { useState, useEffect } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getData_Any2Column, addData } from "../service/APIService";
import { Modal, Button, Form, ListGroup, Badge, Alert } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { v4 as uuid } from "uuid";
import secureLocalStorage from "react-secure-storage";

const GroupDetail = () => {
  const { groupId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [group, setGroup] = useState(state?.group || null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [memberBalances, setMemberBalances] = useState({});
  var netBalance;
  useEffect(() => {
    const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
    setLoggedInUser(sessionUser);
    const loadGroupData = async () => {
      setLoading(true);
      try {
        // Load group expenses
        const groupExpenses = await getData_Any2Column("groupId", groupId, "type", "splitequal-group-expenses");
        setExpenses(groupExpenses);

        // Calculate balances from expenses
        calculateBalancesFromExpenses(groupExpenses);

        // Load group info if not passed in state
        if (!group) {
          const groupData = await getData_Any2Column("id", groupId, "type", "splitequal-groups");
          setGroup(groupData[0]);
        }
      } catch (error) {
        console.error("Error loading group data:", error);
      } finally {
        setLoading(false);
      }
    };

    const calculateBalancesFromExpenses = (expenses) => {
      const balances = {};
      const loggedInUserEmail = loggedInUser?.email;

      // Initialize balances - we only care about the logged-in user's position
      let totalOwedByUser = 0; // What user owes to others (negative)
      let totalOwedToUser = 0; // What others owe to user (positive)

      // Process each expense
      expenses.forEach((expense) => {
        const paidBy = expense.paidBy;
        const shares = expense.shares || {};
        const userShare = shares[loggedInUserEmail] || 0;

        if (paidBy === loggedInUserEmail) {
          // User paid - others owe them
          totalOwedToUser += parseFloat(expense.amount) - parseFloat(userShare);
        } else if (userShare > 0) {
          // Someone else paid - user owes them
          totalOwedByUser += parseFloat(userShare);
        }
      });

      // Calculate net balance (negative means user owes, positive means user is owed)
      netBalance = totalOwedToUser - totalOwedByUser;

      setMemberBalances({
        ...memberBalances,
        [loggedInUserEmail]: netBalance,
      });
    };

    loadGroupData();
  }, [groupId, group]);

  // Calculate your balance (logged in user)
  const yourBalance = memberBalances[group?.email] || 0;

  const handleSettleUp = async (payerEmail, recipientEmail, amount) => {
    if (!payerEmail || !recipientEmail || !amount || !group?.id) {
      console.error("Missing required parameters for settlement");
      return;
    }

    try {
      // Validate amount is a positive number
      if (typeof amount !== "number" || amount <= 0) {
        throw new Error("Amount must be a positive number");
      }

      // Create settlement record similar to group expense structure
      const settlement = {
        id: uuid(),
        groupId: group.id,
        description: `Settlement between ${payerEmail} and ${recipientEmail}`,
        amount: parseFloat(amount).toFixed(2),
        currency: group.currency,
        currencyName: group.currencyName,
        splitType: "settleup-group", // Using your specified splitType
        paidBy: payerEmail,
        email: loggedInUser.email, // Assuming you want to track who initiated
        type: "splitequal-group-expenses",
        date: new Date().toISOString(),
        settlementData: {
          // Additional settlement-specific data
          payerEmail,
          recipientEmail,
          isSettlement: true,
        },
      };

      // Add the settlement to the database
      await addData(settlement);

      // Update local state to include the new settlement
      setExpenses((prev) => [settlement, ...prev]);

      console.log("Settlement recorded:", settlement);
      return settlement;
    } catch (error) {
      console.error("Settlement failed:", error.message || error);
      throw error; // Re-throw if you want calling code to handle the error
    }
  };
  const calculateMaxSettlement = (payerEmail, recipientEmail) => {
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!group) {
    return <div>Group not found</div>;
  }

  const userBalance = group.balances?.[group.email] || 0;

  return (
    <>
      {loading ? (
        <div className="text-center py-4">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p>Loading groups and friends...</p>
        </div>
      ) : (
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

          {/* Group Balance Summary */}

          <div className="card mb-3">
            <div className="card-body p-2">
              <div className="d-flex justify-content-between">
                <h4 className="mb-1">{group?.name}</h4>
                <small className="text-muted">{group?.members?.length} members</small>
              </div>

              <div className="mt-2">
                {group?.members
                  ?.filter((member) => member.email !== loggedInUser?.email)
                  .map((member) => {
                    // For each member, calculate what you owe them or they owe you
                    let amount = 0;
                    let message = "";

                    expenses.forEach((expense) => {
                      const paidBy = expense.paidBy;
                      const userShare = expense.shares?.[loggedInUser?.email] || 0;
                      const memberShare = expense.shares?.[member.email] || 0;

                      if (paidBy === loggedInUser?.email && memberShare > 0) {
                        // You paid - member owes you
                        amount += parseFloat(memberShare);
                        message = `${member.name} owes you`;
                      } else if (paidBy === member.email && userShare > 0) {
                        // Member paid - you owe them
                        amount += parseFloat(userShare);
                        message = `You owe ${member.name}`;
                      }
                    });

                    if (amount > 0) {
                      return (
                        <div key={member.email} className="d-flex justify-content-between py-0">
                          <small className="mb-0">{message}</small>
                          <small className={`fw-bold ${message.startsWith("You owe") ? "text-danger" : "text-success"}`}>
                            {group?.currency}
                            {amount.toFixed(2)}
                          </small>
                        </div>
                      );
                    }
                    return null;
                  })
                  .filter((item) => item !== null)}

                {expenses.length === 0 && (
                  <div className="text-center py-2">
                    <small className="text-muted">No expenses yet</small>
                  </div>
                )}
              </div>

              <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                <Button variant={netBalance === 0 ? "outline-secondary" : "primary"} size="sm">
                  Add Expense
                </Button>
                <Button variant={netBalance === 0 ? "outline-secondary" : "warning"} size="sm" disabled={netBalance === 0} onClick={() => setShowSettleModal(true)}>
                  Settle Up
                </Button>
              </div>
            </div>
          </div>

          {/* Expense History */}
          <h5>Expense History</h5>
          {expenses.length === 0 ? (
            <div className="alert alert-info">No expenses yet</div>
          ) : (
            <ListGroup>
              {expenses.map((expense) => (
                <ListGroup.Item key={expense.id} className="p-1">
                  <div className="d-flex justify-content-between p-0">
                    <div>
                      <h6 className="mb-0">{expense.description}</h6>
                      <small className="text-muted">{new Date(expense.date).toLocaleDateString()}</small> | <small className="text-muted">Split: {expense?.splitType}</small> | <small className="text-muted">PaidBy: {expense?.paidBy}</small>
                    </div>
                    <div>
                      <span className="fw-bold">
                        {expense.currency}
                        {expense.amount}
                      </span>
                    </div>
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}

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
                      // Calculate net balance from expenses
                      let netBalance = 0;
                      expenses.forEach((expense) => {
                        const paidBy = expense.paidBy;
                        const userShare = expense.shares?.[loggedInUser?.email] || 0;
                        const memberShare = expense.shares?.[member.email] || 0;

                        if (paidBy === member.email && userShare > 0) {
                          // You owe this member
                          netBalance += parseFloat(userShare);
                        } else if (paidBy === loggedInUser?.email && memberShare > 0) {
                          // They owe you (reduces your debt)
                          netBalance -= parseFloat(memberShare);
                        }
                      });
                      //return member.email !== loggedInUser?.email && netBalance > 0;
                      return member.email !== loggedInUser?.email;
                    })
                    .map((member) => {
                      // Calculate the exact amount owed
                      let amountOwed = 0;
                      expenses.forEach((expense) => {
                        const paidBy = expense.paidBy;
                        const userShare = expense.shares?.[loggedInUser?.email] || 0;
                        const memberShare = expense.shares?.[member.email] || 0;

                        if (paidBy === member.email && userShare > 0) {
                          amountOwed += parseFloat(userShare);
                        } else if (paidBy === loggedInUser?.email && memberShare > 0) {
                          amountOwed -= parseFloat(memberShare);
                        }
                      });

                      return (
                        <option key={member.email} value={member.email}>
                          {member.name} (Receives {group?.currency}
                          {amountOwed.toFixed(2)})
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
                  placeholder={selectedRecipient ? `Max: ${calculateMaxSettlement(loggedInUser?.email, selectedRecipient.email)}` : "Select recipient first"}
                  min="0.01"
                  step="0.01"
                  max={selectedRecipient ? calculateMaxSettlement(loggedInUser?.email, selectedRecipient.email) : undefined}
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
                    handleSettleUp(loggedInUser?.email, selectedRecipient.email, parseFloat(settleAmount));
                    setShowSettleModal(false);
                  }
                }}
                disabled={!selectedRecipient || !settleAmount}
              >
                Confirm Settlement
              </Button>
            </Modal.Footer>
          </Modal>
        </div>
      )}
    </>
  );
};

export default GroupDetail;

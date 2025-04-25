import React, { useState, useEffect, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { getData_Any2Column, addData } from "../service/APIService";
import { Modal, Button, Form, ListGroup, Badge, Alert } from "react-bootstrap";
import { FaArrowLeft } from "react-icons/fa";
import { v4 as uuid } from "uuid";
import secureLocalStorage from "react-secure-storage";
import GroupAddExpenseModal from "./GroupAddExpenseModal";

const GroupDetail = () => {
  const { groupId } = useParams();
  const { state } = useLocation();
  const navigate = useNavigate();
  const [group, setGroup] = useState(state?.group || null);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showSettleModal, setShowSettleModal] = useState(false);
  const [showAddExpenseModal, setShowAddExpenseModal] = useState(false);
  const [settleAmount, setSettleAmount] = useState("");
  const [selectedRecipient, setSelectedRecipient] = useState(null);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [memberBalances, setMemberBalances] = useState({});
  const [netBalance, setNetBalance] = useState(0);
  const calculateBalancesFromExpenses = useCallback(
    (expenses) => {
      if (!loggedInUser?.email) return;

      let totalOwedByUser = 0;
      let totalOwedToUser = 0;

      expenses.forEach((expense) => {
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
      setLoading(true);
      try {
        const groupExpenses = await getData_Any2Column("groupId", groupId, "type", "splitequal-group-expenses");
        const sortedExpenses = groupExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
        setExpenses(sortedExpenses);
        calculateBalancesFromExpenses(groupExpenses);

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

    loadGroupData();
  }, [groupId]);

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

      const maxAmount = Math.abs(calculateAmountOwedToMember(recipientEmail));
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

  const calculateAmountOwedToMember = (memberEmail) => {
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
        <div className="spinner-border text-primary" role="status">
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
            <small className="text-white py-1">{group?.members?.length} members</small>
          </div>

          <div className="mt-2">
            {group?.members
              ?.filter((member) => member.email !== loggedInUser?.email)
              .map((member) => {
                const amountOwed = calculateAmountOwedToMember(member.email);
                if (Math.abs(amountOwed) > 0.01) {
                  // Only show if amount is significant
                  const message = amountOwed > 0 ? `You owe <b>${member.name}</b> (Pay)` : `<b>${member.name}</b> owes you (Receive)`;
                  return (
                    <div key={member.email} className="d-flex justify-content-between py-0">
                      <small className="mb-0">
                        <div contentEditable="false" dangerouslySetInnerHTML={{ __html: message }}></div>
                      </small>
                      <small className={`fw-bold ${amountOwed > 0 ? "myapp-text-danger" : "myapp-text-sucess"}`}>
                        {group?.currency}
                        {Math.abs(amountOwed).toFixed(2)}
                      </small>
                    </div>
                  );
                }
                return null;
              })
              .filter(Boolean)}
          </div>

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
          <div className="d-none">
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
                      const amountOwed = calculateAmountOwedToMember(member.email);
                      if (Math.abs(amountOwed) > 0.01) {
                        // Only show if amount is significant
                        const message = amountOwed > 0 ? `You owe <b>${member.name}</b> (Pay)` : `<b>${member.name}</b> owes you (Receive)`;
                        return (
                          <div key={member.email} className="d-flex justify-content-between py-0">
                            <small className="mb-0">
                              <div contentEditable="false" dangerouslySetInnerHTML={{ __html: message }}></div>
                            </small>
                            <small className={`fw-bold ${amountOwed > 0 ? "text-danger" : "text-success"}`}>
                              {group?.currency}
                              {Math.abs(amountOwed).toFixed(2)}
                            </small>
                          </div>
                        );
                      }
                      return null;
                    })
                    .filter(Boolean)}
                </div>

                <div className="d-flex justify-content-between align-items-center mt-2 pt-2 border-top">
                  <Button variant="primary" size="sm">
                    Add Expense
                  </Button>
                  <Button variant={"warning"} size="sm" onClick={() => setShowSettleModal(true)}>
                    Settle Up
                  </Button>
                </div>
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
                      <small className="text-muted">{new Date(expense.date).toLocaleDateString()}</small> | <small className="text-muted">Split: {expense?.splitType}</small> | <small className="text-muted">PaidBy: {expense?.paidByName}</small>
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
                      const amountOwed = calculateAmountOwedToMember(member.email);
                      return member.email !== loggedInUser?.email;
                    })
                    .map((member) => {
                      const amountOwed = calculateAmountOwedToMember(member.email);
                      return (
                        <option key={member.email} value={member.email}>
                          {member.name} (Receives {group?.currency}
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
                  value={Math.abs(settleAmount)}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value === "" || /^\d*\.?\d{0,2}$/.test(value)) {
                      setSettleAmount(value);
                    }
                  }}
                  placeholder={selectedRecipient ? `Max: ${calculateAmountOwedToMember(selectedRecipient.email).toFixed(2)}` : "Select recipient first"}
                  min="0.01"
                  step="0.01"
                  max={selectedRecipient ? calculateAmountOwedToMember(selectedRecipient.email) : undefined}
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
              setGroup(updatedGroup);
              const loadExpenses = async () => {
                const groupExpenses = await getData_Any2Column("groupId", groupId, "type", "splitequal-group-expenses");
                const sortedExpenses = groupExpenses.sort((a, b) => new Date(b.date) - new Date(a.date));
                setExpenses(sortedExpenses);
                calculateBalancesFromExpenses(sortedExpenses);
              };
              loadExpenses();
            }}
          />
        </div>
      )}
    </>
  );
};

export default GroupDetail;

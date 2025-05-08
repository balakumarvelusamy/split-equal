import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Alert } from "react-bootstrap";
import { FaExclamationTriangle } from "react-icons/fa";
import { v4 as uuid } from "uuid";
import { addData, UpdateData, getCurrencyName, getCountryCurrency } from "../service/APIService";
import { useDispatch } from "react-redux";
import { updateGroup } from "../store/groupSlice";

const GroupAddExpenseModal = ({ show, page, onHide, currentGroup, loggedInUser, onExpenseAdded }) => {
  const dispatch = useDispatch();
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(currentGroup?.currency || "$");
  const [splitType, setSplitType] = useState("equal");
  const [customShares, setCustomShares] = useState({});
  const [splitError, setSplitError] = useState("");
  const [loading, setLoading] = useState(false);
  const [currencyOptions, setCurrencyOptions] = useState([]);

  useEffect(() => {
    const options = getCountryCurrency();
    setCurrencyOptions(options);
    setCurrency(currentGroup?.currency || options[0]?.currency || "$");
  }, [currentGroup]);

  useEffect(() => {
    if (!currentGroup || !amount) return;

    const members = currentGroup.members;
    if (splitType === "equal") {
      const selectedMembers =
        Object.keys(customShares).length > 0
          ? Object.entries(customShares)
              .filter(([email, include]) => include)
              .map(([email]) => email)
          : members.map((m) => m.email);

      const equalShare = parseFloat(amount) / selectedMembers.length;
      const newShares = {};
      members.forEach((member) => {
        newShares[member.email] = selectedMembers.includes(member.email) ? parseFloat(equalShare.toFixed(2)) : 0;
      });
      setCustomShares(newShares);
    }

    if (splitType === "percentage") {
      const percentageShare = 100 / members.length;
      const newShares = {};
      members.forEach((member) => {
        newShares[member.email] = parseFloat(percentageShare.toFixed(2));
      });
      setCustomShares(newShares);
    }
  }, [splitType, currentGroup, amount]);

  const calculateShares = () => {
    const totalAmount = parseFloat(amount) || 0;
    const members = currentGroup?.members || [];

    if (splitType === "equal") {
      const selectedMembers =
        Object.keys(customShares).length > 0
          ? Object.entries(customShares)
              .filter(([email, share]) => share !== 0)
              .map(([email]) => email)
          : members.map((m) => m.email);

      const equalShare = totalAmount / selectedMembers.length;
      const shares = {};
      members.forEach((member) => {
        shares[member.email] = selectedMembers.includes(member.email) ? equalShare : 0;
      });
      return shares;
    } else if (splitType === "percentage") {
      const shares = {};
      members.forEach((member) => {
        const percentage = parseFloat(customShares[member.email]) || 0;
        shares[member.email] = (totalAmount * percentage) / 100;
      });
      return shares;
    } else {
      return customShares;
    }
  };

  const validateShares = () => {
    const totalAmount = parseFloat(amount) || 0;
    const members = currentGroup?.members || [];

    if (splitType === "percentage") {
      let totalPercentage = 0;
      members.forEach((member) => {
        totalPercentage += parseFloat(customShares[member.email]) || 0;
      });

      if (Math.abs(totalPercentage - 100) > 0.01) {
        setSplitError(`Total percentage must equal 100% (current: ${totalPercentage.toFixed(2)}%)`);
        return false;
      }
    } else if (splitType === "custom") {
      let totalShares = 0;
      members.forEach((member) => {
        totalShares += parseFloat(customShares[member.email]) || 0;
      });

      if (Math.abs(totalShares - totalAmount) > 0.01) {
        setSplitError(`Total custom shares must equal the amount (${totalAmount.toFixed(2)})`);
        return false;
      }
    }

    setSplitError("");
    return true;
  };

  const handleAddExpense = async () => {
    if (!description || !amount || !currentGroup) {
      setSplitError("Please fill all required fields.");
      return;
    }

    if (!validateShares()) return;

    setLoading(true);
    const shares = calculateShares();
    const expenseId = uuid();
    const currencyName = await getCurrencyName(currency);

    try {
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
        paidByName: loggedInUser.name,
        email: loggedInUser.email,
        type: "splitequal-group-expenses",
        date: new Date().toISOString(),
      };

      await addData(groupExpense);

      const updatedGroup = {
        ...currentGroup,
        balances: { ...currentGroup.balances },
        members: [...currentGroup.members],
        expenses: [...(currentGroup.expenses || [])], // ✅ copy existing expenses safely
      };

      // Update balances
      updatedGroup.members.forEach((member) => {
        const memberEmail = member.email;
        const shareAmount = shares[memberEmail] || 0;

        if (!updatedGroup.balances[memberEmail]) {
          updatedGroup.balances[memberEmail] = 0;
        }

        if (memberEmail === loggedInUser.email) {
          updatedGroup.balances[memberEmail] += shareAmount * (currentGroup.members.length - 1);
        } else {
          updatedGroup.balances[memberEmail] -= shareAmount;
        }

        updatedGroup.balances[memberEmail] = parseFloat(updatedGroup.balances[memberEmail].toFixed(2));
      });

      updatedGroup.expenses.push(groupExpense);

      await UpdateData(updatedGroup);
      dispatch(updateGroup(updatedGroup));
      page != "home" && onExpenseAdded(updatedGroup);
      // Reset form
      setDescription("");
      setAmount("");
      setCustomShares({});
      setSplitType("equal");
      setSplitError("");
      onHide();
    } catch (error) {
      console.error("Failed to add group expense:", error);
    } finally {
      setLoading(false);
    }
  };

  const renderSharesInput = () => {
    if (!currentGroup) return null;
    console.log(splitType);
    if (splitType === "equal") {
      const updateSummary = () => {}; // Placeholder for any update summary logic if needed
      return (
        <Form.Group className="mb-1">
          <Form.Label>Select Members to Split</Form.Label>
          <div className="border rounded p-1">
            {currentGroup.members.map((member) => (
              <div key={member.email} className="d-flex align-items-center mb-1">
                <Form.Check
                  type="checkbox"
                  label={`${member.name} ${member.email === loggedInUser?.email ? "(You)" : ""}`}
                  checked={customShares[member.email] !== 0}
                  onChange={(e) => {
                    const isChecked = e.target.checked;
                    const updatedShares = {
                      ...customShares,
                      [member.email]: isChecked ? 1 : 0,
                    };

                    const selectedMembers = Object.entries(updatedShares)
                      .filter(([email, include]) => include)
                      .map(([email]) => email);

                    const equalShare = parseFloat(amount) / selectedMembers.length || 0;
                    const newShares = {};
                    currentGroup.members.forEach((m) => {
                      newShares[m.email] = selectedMembers.includes(m.email) ? parseFloat(equalShare.toFixed(2)) : 0;
                    });
                    setCustomShares(newShares);
                    updateSummary();
                  }}
                />
              </div>
            ))}
          </div>
        </Form.Group>
      );
    }

    return (
      <Form.Group className="mb-1">
        <Form.Label>{splitType === "percentage" ? "Percentage Shares" : "Custom Shares"}</Form.Label>
        <div className="border rounded p-1">
          {currentGroup.members.map((member) => (
            <div key={member.email} className="d-flex align-items-center mb-1">
              <div className="flex-grow-1">
                {member.name} {member.email === loggedInUser?.email && "(You)"}
              </div>
              {splitType !== "percentage" && <span className="mx-2">{currency}</span>}
              <Form.Control
                type="number"
                style={{ width: "100px", height: "30px" }}
                className="p-0"
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
                inputMode="decimal"
                step={splitType === "percentage" ? "1" : "0.01"}
              />
            </div>
          ))}
        </div>
      </Form.Group>
    );
  };

  return (
    <Modal show={show} onHide={onHide} size="lg">
      <Modal.Header closeButton>
        <b>Add Group Expense - {currentGroup?.name}</b>
      </Modal.Header>
      <Modal.Body>
        <Form.Group className="mb-1">
          <b>Description*</b>
          <Form.Control type="text" value={description} required onChange={(e) => setDescription(e.target.value)} placeholder="What was this expense for?" />
        </Form.Group>

        <div className="row mb-1">
          <div className="col">
            <b>Amount*</b>
            <Form.Control type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" step="0.01" inputMode="decimal" />
          </div>
          <div className="col">
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

        {renderSharesInput()}

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
              const share = customShares[member.email] || 0;
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
        <Button variant="secondary" onClick={onHide}>
          Cancel
        </Button>
        <Button variant="primary" onClick={handleAddExpense} disabled={loading}>
          {loading ? "Saving..." : "Add Expense"}
        </Button>
      </Modal.Footer>
    </Modal>
  );
};

export default GroupAddExpenseModal;

import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import close from "../images/delete.png";
import { FaRegEdit } from "react-icons/fa";
import { getData, UpdateData, addData } from "../service/APIService";
import { v4 as uuid } from "uuid";
const ExpenseHistory = ({ displayedExpenses, refreshBalance_ }) => {
  const [showModal, setShowModal] = useState(false);
  const [historyPage, setHistoryPage] = useState(window.location.href.includes("history"));
  const [selectedExpense, setSelectedExpense] = useState(null);
  const [editedAmount, setEditedAmount] = useState("");

  // Open the modal and set the selected expense
  const openModal = (expense) => {
    setSelectedExpense(expense);
    setEditedAmount(Math.abs(expense.amount).toFixed(2)); // Prefill the current amount
    setShowModal(true);
  };

  // Close the modal
  const closeModal = () => {
    setShowModal(false);
    setSelectedExpense(null);
    setEditedAmount("");
  };

  // Handle save changes
  const handleSaveChanges = async () => {
    if (!selectedExpense) return;
    const updatedExpense = {
      ...selectedExpense,
      amount: parseFloat(editedAmount), // Update the amount
    };
    await onEditExpense(selectedExpense, updatedExpense); // Call the parent's edit handler
    closeModal();
  };

  // Handle delete expense
  const handleDelete = async () => {
    if (!selectedExpense) return;
    const isConfirmed = window.confirm("Are you sure you want to delete this expense?");
    if (!isConfirmed) return;
    await onDeleteExpense(selectedExpense); // Call the parent's delete handler
    closeModal();
  };

  const onEditExpense = async (selectedExpense, updatedExpense) => {
    const { email, friendemail, currency, expensetype, amount } = selectedExpense;

    try {
      // Fetch both user's split-equal-friend entries
      const userFriends = await getData(email, "splitequal-friends");
      const friendFriends = await getData(friendemail, "splitequal-friends");

      const userEntry = userFriends.find((entry) => entry.friendemail === friendemail && entry.currency === currency);
      const friendEntry = friendFriends.find((entry) => entry.friendemail === email && entry.currency === currency);

      if (!userEntry || !friendEntry) {
        console.log("Matching friend entries not found");
        return;
      }

      // Step 1: Reverse the original balances
      switch (expensetype) {
        case "you-paid-full":
          userEntry.balance -= amount;
          friendEntry.balance += amount;
          break;
        case "friend-paid-full":
          userEntry.balance += amount;
          friendEntry.balance -= amount;
          break;
        case "you-paid-split":
          userEntry.balance -= amount / 2;
          friendEntry.balance += amount / 2;
          break;
        case "friend-paid-split":
          userEntry.balance += amount / 2;
          friendEntry.balance -= amount / 2;
          break;
        default:
          console.warn("Unknown expense type:", expensetype);
          return;
      }

      // Step 2: Apply the new balances
      switch (updatedExpense.expensetype) {
        case "you-paid-full":
          userEntry.balance += updatedExpense.amount;
          friendEntry.balance -= updatedExpense.amount;
          break;
        case "friend-paid-full":
          userEntry.balance -= updatedExpense.amount;
          friendEntry.balance += updatedExpense.amount;
          break;
        case "you-paid-split":
          userEntry.balance += updatedExpense.amount / 2;
          friendEntry.balance -= updatedExpense.amount / 2;
          break;
        case "friend-paid-split":
          userEntry.balance -= updatedExpense.amount / 2;
          friendEntry.balance += updatedExpense.amount / 2;
          break;
        default:
          console.warn("Unknown updated expense type:", updatedExpense.expensetype);
          return;
      }
      console.log("userEntry", { ...userEntry, balance: Number(userEntry.balance.toFixed(2)) });
      console.log("friendEntry", { ...friendEntry, balance: Number(friendEntry.balance.toFixed(2)) });

      // Update balances in the database
      await UpdateData({ ...userEntry, balance: Number(userEntry.balance.toFixed(2)) });
      await UpdateData({ ...friendEntry, balance: Number(friendEntry.balance.toFixed(2)) });

      // Step 3: Mark the original expense as updated
      await UpdateData({ ...updatedExpense, date: new Date().toISOString(), isupdated: 1 });

      // Update UI
      refreshBalance_();
    } catch (error) {
      console.error("Error editing expense:", error);
    }
  };

  const onDeleteExpense = async (selectedExpense) => {
    try {
      const { email, friendemail, currency, expensetype, amount } = selectedExpense;

      // Fetch both user's split-equal-friend entries
      const userFriends = await getData(email, "splitequal-friends");
      const friendFriends = await getData(friendemail, "splitequal-friends");

      const userEntry = userFriends.find((entry) => entry.friendemail === friendemail && entry.currency === currency);
      const friendEntry = friendFriends.find((entry) => entry.friendemail === email && entry.currency === currency);

      if (!userEntry || !friendEntry) {
        console.error("Matching friend entries not found");
        return;
      }

      // Reverse the balances for the deleted expense
      switch (expensetype) {
        case "you-paid-full":
          userEntry.balance -= amount;
          friendEntry.balance += amount;
          break;
        case "friend-paid-full":
          userEntry.balance += amount;
          friendEntry.balance -= amount;
          break;
        case "you-paid-split":
          userEntry.balance -= amount / 2;
          friendEntry.balance += amount / 2;
          break;
        case "friend-paid-split":
          userEntry.balance += amount / 2;
          friendEntry.balance -= amount / 2;
          break;
        case "settle-up":
          userEntry.balance += amount;
          friendEntry.balance += amount;
          break;
        default:
          console.warn("Unknown expense type:", expensetype);
          return;
      }
      console.log("userEntry", { ...userEntry, balance: Number(userEntry.balance.toFixed(2)) });
      console.log("friendEntry", { ...friendEntry, balance: Number(friendEntry.balance.toFixed(2)) });

      // Update balances in the database
      await UpdateData({ ...userEntry, balance: Number(userEntry.balance.toFixed(2)) });
      await UpdateData({ ...friendEntry, balance: Number(friendEntry.balance.toFixed(2)) });

      // Mark the expense as deleted
      await UpdateData({ ...selectedExpense, isdeleted: 1 });
      refreshBalance_();
    } catch (error) {
      console.error("Error deleting expense:", error);
    }
  };
  return (
    <div>
      {" "}
      <>
        {displayedExpenses.map((expense) => {
          const expenseDate = new Date(expense.date);
          const formattedDayMonth = expenseDate.toLocaleDateString("en-US", {
            day: "numeric",
            month: "short",
          });
          const formattedYear = expenseDate.getFullYear();

          return (
            <li key={expense.id} className="list-group-item px-1 py-1 ">
              <div className="me-auto d-flex align-items-center">
                {/* Date Section */}
                <div className="text-center px-1 bg-light rounded ">
                  <div className="text-nowrap">
                    <small>{formattedDayMonth}</small>
                  </div>
                  <small>{formattedYear}</small>
                </div>

                {/* Expense Details */}
                <div className="flex-grow-1 px-1 ">
                  <div>
                    <span className={expense.isdeleted === 1 ? "text-decoration-line-through" : ""}>
                      <small className="fw-bold">
                        {expense.description}
                        <small className="text-danger text-decoration-none px-1 fw-light d-none">{expense.isdeleted === 1 && "Deleted"}</small>
                        <small className="text-success text-decoration-none px-1 fw-light">{expense.isupdated === 1 && "Updated"}</small>
                      </small>
                      <div>
                        <small className="px-0 py-0 fw-light">{expense.expenseTypeText}</small>
                      </div>
                    </span>
                  </div>
                </div>
                <div>
                  {expense.isdeleted !== 1 && !historyPage ? (
                    <span className="bg-light rounded border px-1">
                      <a
                        href="#"
                        className={`fw-bold text-nowrap text-decoration-none ${expense.amount < 0 ? "text-danger" : "text-success"}`}
                        onClick={(e) => {
                          e.preventDefault();
                          openModal(expense); // Open modal when amount is clicked
                        }}
                      >
                        <small>
                          {expense.currency}{" "}
                          {Math.abs(expense.amount)
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                          {/* add comma after 3 digit */}
                          <FaRegEdit className="m-1 pb-1  text-dark" />
                        </small>
                      </a>
                    </span>
                  ) : (
                    <span className="bg-light border rounded px-1">
                      <span className={`fw-bold text-nowrap text-decoration-none ${expense.amount < 0 ? "text-danger" : "text-success"}`}>
                        <small className={expense.isdeleted === 1 ? "text-decoration-line-through" : ""}>
                          {expense.currency}{" "}
                          {Math.abs(expense.amount)
                            .toFixed(2)
                            .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                        </small>
                      </span>
                    </span>
                  )}
                </div>
              </div>
            </li>
          );
        })}
      </>
      {/* Modal for Editing or Deleting Expense */}
      <Modal show={showModal} onHide={closeModal} backdrop="static" keyboard={false}>
        <div className="modal-header">
          <h5 className="modal-title">{selectedExpense?.expensetype !== "settle-up" ? "Edit Expense" : "Delete Settle up"}</h5>
          <a onClick={closeModal}>
            <img src={close} alt="Close" className="" width="30" />
          </a>
        </div>
        <Modal.Body>
          {selectedExpense && (
            <div>
              <p className="mb-0">
                <strong>Description:</strong> {selectedExpense.description}
              </p>
              <p className="mb-0">
                <strong>Amount Paid:</strong> {selectedExpense.currency + selectedExpense.amount}
              </p>
              <p className="mb-0">
                <strong>Expense Type:</strong> {selectedExpense.expensetype}
              </p>
              {selectedExpense.expenseTypeText !== "" && (
                <p className="mb-0">
                  <strong>Expense Description:</strong> {selectedExpense.expenseTypeText}
                </p>
              )}
              {selectedExpense?.expensetype !== "settle-up" && (
                <div className="input-group">
                  <label className="form-control px-1" align="center" htmlFor="editAmount">
                    Amount <b>{selectedExpense.currency}</b>
                  </label>
                  <label className="form-control d-none" align="center" htmlFor="editAmount">
                    {selectedExpense.currency}
                  </label>

                  <input
                    type="number"
                    id="editAmount"
                    className="form-control w-50"
                    value={editedAmount}
                    onChange={(e) => {
                      const value = e.target.value;
                      // Regular expression to allow numbers with up to 2 decimal places, not starting with 0 (except decimals like 0.1)
                      const regex = /^(?!0\d)(\d+(\.\d{0,2})?|0(\.\d{0,2})?)$/;
                      if (value === "" || regex.test(value)) {
                        setEditedAmount(value ? parseFloat(value) : "");
                      }
                    }}
                    step="any"
                    inputMode="decimal"
                    required
                  />
                </div>
              )}
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="d-flex justify-content-between">
          <div>
            <Button variant="danger" className="p-1 btn-sm" onClick={handleDelete}>
              <i className="fas fa-trash-alt px-1"></i>
            </Button>
          </div>
          <div>
            {selectedExpense?.expensetype !== "settle-up" && (
              <Button variant="warning" className="p-1 btn-sm" onClick={handleSaveChanges}>
                Save Changes
              </Button>
            )}{" "}
            <Button variant="secondary" className="p-1 btn-sm" onClick={closeModal}>
              Cancel
            </Button>
          </div>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default ExpenseHistory;

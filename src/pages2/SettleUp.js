import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { v4 as uuid } from "uuid";
import { addData, UpdateData, getData } from "../service/APIService";
import close from "../images/delete.png";

const SettleUp = ({ friend, balance, loggedInUser, showSettleUp, setShowSettleUp, refreshBalance }) => {
  const [settleUpAmounts, setSettleUpAmounts] = useState(balance);
  const [loading, setLoading] = useState(false);
  console.log(parseFloat(Math.abs(settleUpAmounts).toFixed(2)));
  useEffect(() => {
    setSettleUpAmounts(balance);
  }, [balance]);
  const handleSettleUp = async (friendEmail, settleAmount, friendToSettle) => {
    setLoading(true);

    const currentDate = new Date().toISOString().replace("T", " ").split(".")[0];
    const updatedFriend = { ...friendToSettle, balance: friendToSettle.balance < 0 ? friendToSettle.balance + settleAmount : friendToSettle.balance - settleAmount };

    // Settle Expense Entry
    const settleExpense = {
      id: uuid(),
      type: "splitequal-expense",
      description: `Settle up with ${friendToSettle.friendname}`,
      amount: settleAmount,
      friendemail: friendToSettle.friendemail,
      currency: friendToSettle.currency,
      currencyName: friendToSettle.currencyName,
      expensetype: "settle-up",
      expenseTypeText: "",
      date: currentDate,
      email: loggedInUser.email,
    };

    const ReverseSettleExpense = {
      ...settleExpense,
      id: uuid(),
      email: friendToSettle.friendemail,
      friendemail: loggedInUser.email,
    };

    try {
      await addData(settleExpense);
      // await addData(ReverseSettleExpense); // only entry for logged in user

      let updatedData = {
        ...friendToSettle,
        balance: updatedFriend.balance,
        date: currentDate,
      };
      updatedData.balance = Number(updatedData.balance.toFixed(2));
      await UpdateData(updatedData);

      const friendData = await getData(friendToSettle.friendemail, "splitequal-friends");
      const reverseEntry = friendData.find((f) => f.friendemail === loggedInUser.email && f.currency === friendToSettle.currency);

      if (reverseEntry) {
        reverseEntry.balance =
          reverseEntry.balance < 0
            ? reverseEntry.balance + settleAmount // Your friend owes you, their debt decreases
            : reverseEntry.balance - settleAmount;
        let reversedata = {
          ...reverseEntry,
          date: currentDate,
        };
        console.log("4 Reverse Entry Update", reversedata);
        reversedata.balance = Number(reversedata.balance.toFixed(2));
        await UpdateData(reversedata);
      } else {
        const reverseSettleEntry = {
          id: uuid(),
          friendemail: loggedInUser.email,
          email: friendEmail,
          friendname: loggedInUser.name,
          currency: friendToSettle.currency,
          currencyName: friendToSettle.currencyName,
          balance: 0,
          type: "splitequal-friends",
          date: currentDate,
        };
        //await addData(reverseSettleEntry); // dont add new row so commented
      }

      await refreshBalance();
      setShowSettleUp(false);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      setShowSettleUp(false);
      console.error("Error during settle-up:", error);
    }
  };

  return (
    <Modal show={showSettleUp} onHide={() => setShowSettleUp(false)} backdrop="static">
      <div className="modal-header">
        <p className="mb-0 text-dark">
          Settle Up with <b>{friend.friendname}</b>
        </p>
        <a onClick={() => setShowSettleUp(false)}>
          <img src={close} alt="Logo" className="" width="30" />
        </a>
      </div>
      <Modal.Body>
        <div className="grid p-1">
          <div>
            <div>{friend.balance > 0 ? `You Received from ${friend?.friendname}` : `You Paid ${friend?.friendname}`}</div> <small>{friend.friendemail}</small>
          </div>
          <div className="input-group">
            <span className="form-control w-10" align="center">
              {friend?.currency}
            </span>
            <input
              type="number"
              className="form-control w-75"
              placeholder="Settle Amount"
              maxLength="10"
              max="10000000000"
              value={settleUpAmounts !== null && settleUpAmounts !== undefined ? settleUpAmounts : ""}
              onChange={(e) => {
                const value = e.target.value;
                // Regular expression to allow numbers with up to 2 decimal places, not starting with 0 (except decimals like 0.1)
                const regex = /^(?!0\d)(\d+(\.\d{0,2})?|0(\.\d{0,2})?)$/;
                if (value === "" || regex.test(value)) {
                  setSettleUpAmounts(value ? parseFloat(value) : "");
                }
              }}
              step="0.01"
              inputMode="decimal"
            />
          </div>
          <Button className="btn form-control btn-warning w-100 mt-2" disabled={loading || !settleUpAmounts} onClick={() => handleSettleUp(friend.email, parseFloat(Math.abs(settleUpAmounts)), friend)}>
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
      <Modal.Footer>
        <button type="button" onClick={(e) => setShowSettleUp(false)} className=" text-dark btn-lg btn-secondary bg-light border mt-2 ms-1 w-25">
          Close
        </button>
      </Modal.Footer>
    </Modal>
  );
};

export default SettleUp;

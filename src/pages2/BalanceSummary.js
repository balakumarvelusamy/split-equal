import React, { useState, useEffect } from "react";
import { getData, getCurrency } from "../service/APIService";

const BalanceSummary = ({ friends, loggedInUser, onSettleUp, refreshBalance, loading }) => {
  //const [friends, setFriends] = useState(friendsList);
  const [balances, setBalances] = useState({});
  const [totalPay, setTotalPay] = useState(0);
  const [balance, setBalance] = useState(refreshBalance || 0);
  const [totalReceive, setTotalReceive] = useState(0);
  const [settleAmounts, setSettleAmounts] = useState({});
  //const [loading, setLoading] = useState(friends.length === 0);

  useEffect(() => {
    console.log("friends balance summary", friends);
    console.log("refreshBalance", refreshBalance);
    const balanceByCurrency = {};
    let overallPay = 0;
    let overallReceive = 0;

    friends.forEach((friend) => {
      const { balance, currency } = friend;

      if (!balanceByCurrency[currency]) {
        balanceByCurrency[currency] = { pay: 0, receive: 0 };
      }

      if (balance < 0) {
        balanceByCurrency[currency].pay += Math.abs(balance);
        overallPay += Math.abs(balance);
      } else if (balance > 0) {
        balanceByCurrency[currency].receive += balance;
        overallReceive += balance;
      }
    });

    setBalances(balanceByCurrency);
    setTotalPay(overallPay);
    setTotalReceive(overallReceive);
  }, [friends, loggedInUser, onSettleUp, refreshBalance]);

  const handleSettleAmountChange = (e, friendEmail) => {
    const { value } = e.target;
    setSettleAmounts({
      ...settleAmounts,
      [friendEmail]: value,
    });
  };

  const handleSettleUpClick = (friendEmail) => {
    const settleAmount = parseFloat(settleAmounts[friendEmail] || 0);
    if (!isNaN(settleAmount) && settleAmount > 0) {
      onSettleUp(friendEmail, settleAmount);
      setSettleAmounts({ ...settleAmounts, [friendEmail]: "" });
    }
  };

  return (
    <div>
      <h6 className="mb-2">Balance Summary</h6>

      {
        <>
          <div className="row justify-content-center mb-4">
            <div className="col-md-12">
              <div className="card balance-summary">
                <div className="card-body p-2 h-100" style={cardStyle}>
                  <div className="d-flex justify-content-between">
                    <div>
                      <small>You need to pay </small>
                    </div>
                    <div>
                      <small>You will receive</small>
                    </div>
                  </div>

                  {
                    <div className="mt-0 h-100">
                      {Object.entries(balances)
                        .filter(([currency, { pay, receive }]) => pay !== 0 || receive !== 0) // Filter out 0 values
                        .map(([currency, { pay, receive }]) => (
                          <div key={currency} className="d-flex justify-content-between">
                            <div>
                              <h6 className="text-danger fw-bold mb-0">
                                {currency}{" "}
                                {parseFloat(pay)
                                  .toFixed(2)
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              </h6>
                            </div>
                            <div>
                              <h6 className="text-success fw-bold mb-0">
                                {currency}{" "}
                                {parseFloat(receive)
                                  .toFixed(2)
                                  .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                              </h6>
                            </div>
                          </div>
                        ))}
                    </div>
                  }
                </div>
              </div>
            </div>
          </div>
        </>
      }
    </div>
  );
};
const cardStyle = {
  background: "linear-gradient(to right, rgba(255, 99, 71, 0.1), rgba(255, 255, 255, 0.2), rgba(34, 139, 34, 0.1))",
  borderRadius: "5px",
  padding: "1rem",
  color: "#333",
};
export default BalanceSummary;

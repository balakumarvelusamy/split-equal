import React, { useState, useEffect } from "react";
import { getData, addData, UpdateData, getItemsbyid, getCurrency, getCountryCurrency, getCurrencyName, maskEmail } from "../service/APIService";
import { v4 as uuid } from "uuid";
import Select from "react-select";
import secureLocalStorage from "react-secure-storage";

const AddExpense = ({ onAddExpense, selectedFriend, selectedFriendEmail, loading, loggedInUserName, selectedCurrency, friend }) => {
  const [friendname, setFriend] = useState(selectedFriend);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [friendemail, setFriendEmail] = useState(selectedFriendEmail);
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState(selectedCurrency || "$");
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [expenseType, setExpenseType] = useState(null);
  const [date, setDate] = useState("");
  const [expenseOptions, setExpenseOptions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const getTodayDate = () => new Date().toISOString().split("T")[0];
  const getTodayDateTime = () => new Date().toISOString().replace("T", " ").split(".")[0];
  const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
  useEffect(() => {
    setLoggedInUser(sessionUser);
    setDate(getTodayDate());
    setFriend(selectedFriend);
    setFriendEmail(selectedFriendEmail);
  }, [selectedFriend, selectedFriendEmail]);

  useEffect(() => {
    const fetchCurrencyOptions = () => {
      const options = getCountryCurrency();
      setCurrencyOptions(options);
    };
    fetchCurrencyOptions();
    updateExpenseOptions();
  }, [amount, friendname]);

  const handleCurrencyChange = (e) => {
    const newCurrency = e.target.value;
    setCurrency(newCurrency);

    // Reset selected expense type when currency changes
    setExpenseType(null);

    // Update the expense options to reflect the new currency
    updateExpenseOptions(newCurrency);
  };

  const updateExpenseOptions = (newCurrency = currency) => {
    const amountValue = parseFloat(amount) || 0;
    const you = loggedInUserName.toUpperCase() || "You";
    const displayyou = "You";
    const friend = friendname.toUpperCase() || "Friend";

    const options = [
      {
        value: "you-paid-split",
        label: `${you} paid & Split Equally,\n ${friend} Owes ${newCurrency} ${(amountValue / 2).toFixed(2)}`,
        displaylabel: `${displayyou} paid & Split Equally,\n ${friend} Owes ${newCurrency} ${(amountValue / 2).toFixed(2)}`,
        color: "darkgreen",
      },
      {
        value: "you-paid-full",
        label: `${you} paid full,\n ${friend} Owes you ${newCurrency} ${amountValue}`,
        displaylabel: `${displayyou} paid full,\n ${friend} Owes you ${newCurrency} ${amountValue}`,
        color: "darkgreen",
      },
      {
        value: "friend-paid-split",
        label: `${friend} paid & Split Equally,\n ${you} Owe ${newCurrency} ${(amountValue / 2).toFixed(2)}`,
        displaylabel: `${friend} paid & Split Equally,\n ${displayyou} Owe ${newCurrency} ${(amountValue / 2).toFixed(2)}`,
        color: "red",
      },
      {
        value: "friend-paid-full",
        label: `${friend} paid full,\n ${you} Owe ${newCurrency} ${amountValue}`,
        displaylabel: `${friend} paid full,\n ${displayyou} Owe ${newCurrency} ${amountValue}`,
        color: "red",
      },
    ];

    setExpenseOptions(options);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!friendname || !friendemail || !amount || !description || !date || !expenseType) return;
    if (friendemail == loggedInUser.email) {
      alert("You cannot add Expense for yourself here.");
      return;
    }
    setIsLoading(true); // Disable button
    const currencyName = await getCurrencyName(currency);
    try {
      const expense = {
        id: uuid(),
        friendname,
        friendemail,
        description,
        amount: Number(amount),
        currency,
        currencyName: currencyName,
        expensetype: expenseType.value,
        expenseTypeText: expenseType.label,
        type: "splitequal-expense",
        date: getTodayDateTime(),
      };
      await addExpense(expense);
      await onAddExpense(expense);

      setDescription("");
      setAmount("");
      setCurrency("$");
      setExpenseType(null);
      setDate(getTodayDate());
    } catch (error) {
      console.error("Error adding expense:", error);
    } finally {
      setIsLoading(false); // Re-enable button
    }
  };
  const addExpense = async (expense) => {
    console.log("friend", friend);
    console.log("Expense:", expense);
    if (!loggedInUser) return;

    const newExpense = {
      ...expense,
      id: uuid(),
      email: loggedInUser.email,
      type: "splitequal-expense",
      date: getTodayDateTime(),
    };

    const ReverseExpense = {
      ...expense,
      id: uuid(),
      email: expense.friendemail,
      friendemail: loggedInUser.email,
      type: "splitequal-expense",
      date: getTodayDateTime(),
    };

    try {
      console.log("Adding Expense:", newExpense);
      console.log("Adding Reverse Expense:", ReverseExpense);

      // 1. Add both expenses to the database
      await addData(newExpense);
      //await addData(ReverseExpense); // only entry for logged in user

      // 2. Update current friend balance directly if they match the expense
      const id = await getItemsbyid(friend.id);
      const friendById = id.find((f) => f.friendemail === expense.friendemail);
      if (!friendById) {
        console.log("Friend not found with ID:", friend.id);
        return;
      }
      console.log("Friend not found with ID:", friendById);
      if (friendById.friendemail === expense.friendemail && friendById.currency === expense.currency) {
        switch (expense.expensetype) {
          case "you-paid-split":
            friendById.balance += expense.amount / 2;
            break;
          case "friend-paid-split":
            friendById.balance -= expense.amount / 2;
            break;
          case "you-paid-full":
            friendById.balance += expense.amount;
            break;
          case "friend-paid-full":
            friendById.balance -= expense.amount;
            break;
          default:
            console.warn("Unknown expense type:", expense.expensetype);
        }

        // 3. Update the friend's record in the database
        console.log("Updating Friend Balance:", friend);
        friendById.balance = Number(friendById.balance.toFixed(2));
        await UpdateData({ ...friendById, type: "splitequal-friends" });
      } else {
        // 4. Create a new entry if the friend doesn't exist (this should rarely happen here)
        const newFriendEntry = {
          id: uuid(),
          friendemail: expense.friendemail,
          email: loggedInUser.email,
          friendname: expense.friendname,
          currency: expense.currency,
          currencyName: expense.currencyName,
          balance: expense.expensetype.includes("you-paid") ? (expense.expensetype.includes("split") ? expense.amount / 2 : expense.amount) : expense.expensetype.includes("split") ? -expense.amount / 2 : -expense.amount,
          type: "splitequal-friends",
          date: getTodayDateTime(),
        };
        newFriendEntry.balance = Number(newFriendEntry.balance.toFixed(2));
        console.log("Adding New Friend Entry:", newFriendEntry);
        await addData(newFriendEntry);
      }

      // 5. Update the other party's balance
      const Friends = await getData(expense.friendemail, "splitequal-friends");
      const FriendEntry = Friends.find((f) => f.friendemail === loggedInUser.email && f.currency === expense.currency);

      if (FriendEntry) {
        switch (expense.expensetype) {
          case "you-paid-split":
            FriendEntry.balance -= expense.amount / 2;
            break;
          case "friend-paid-split":
            FriendEntry.balance += expense.amount / 2;
            break;
          case "you-paid-full":
            FriendEntry.balance -= expense.amount;
            break;
          case "friend-paid-full":
            FriendEntry.balance += expense.amount;
            break;
          default:
            console.warn("Unknown expense type:", expense.expensetype);
        }

        console.log("Updating Other Party's View:", FriendEntry);
        FriendEntry.balance = Number(FriendEntry.balance.toFixed(2));
        await UpdateData({ ...FriendEntry, type: "splitequal-friends" });
      } else {
        const reverseEntry = {
          id: uuid(),
          friendemail: loggedInUser.email,
          email: expense.friendemail,
          friendname: loggedInUser.name,
          currency: expense.currency,
          currencyName: expense.currencyName,
          balance: expense.expensetype.includes("you-paid") ? (expense.expensetype.includes("split") ? -expense.amount / 2 : -expense.amount) : expense.expensetype.includes("split") ? expense.amount / 2 : expense.amount,
          type: "splitequal-friends",
          date: getTodayDateTime(),
        };
        reverseEntry.balance = Number(reverseEntry.balance.toFixed(2));
        console.log("Adding Reverse Entry for Other Party:", reverseEntry);
        await addData(reverseEntry);
      }
    } catch (error) {
      console.error("Error adding expense:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="p-2">
      <h6>{friendname + " - " + maskEmail(friendemail)}</h6>
      <input type="text" className="form-control mb-2" placeholder="Description" maxLength={50} value={description} onChange={(e) => setDescription(e.target.value)} required />

      <div className="input-group mb-2">
        <input
          type="number"
          className="form-control"
          placeholder="Amount"
          value={amount}
          onChange={(e) => {
            const value = e.target.value;
            // Regular expression to allow numbers with up to 2 decimal places, not starting with 0 (except decimals like 0.1)
            const regex = /^(?!0\d)(\d+(\.\d{0,2})?|0(\.\d{0,2})?)$/;
            if (value === "" || regex.test(value)) {
              setAmount(value);
            }
          }}
          step="any"
          inputMode="decimal"
          required
        />

        <select className="form-control" value={currency} onChange={handleCurrencyChange} required>
          {currencyOptions.map((option) => (
            <option key={option.currency} value={option.currency}>
              {option.currencyName} ({option.currency})
            </option>
          ))}
        </select>
      </div>

      <div className="mb-3 ">
        {expenseOptions.map((option) => (
          <div key={option.value} className="form-check border-bottom py-1  d-flex align-items-center justify-content-start" style={{ gap: "10px" }}>
            <input type="radio" disabled={amount === "" ? true : false} id={option.value} name="expenseType" value={option.value} className="form-check-input" onChange={() => setExpenseType(option)} checked={expenseType?.value === option.value} required />
            <label htmlFor={option.value} className="form-check-label" style={{ color: option.color, lineHeight: "1.4" }}>
              {option.displaylabel.split("\n").map((line, index) => (
                <small key={index}>
                  {line}
                  {index !== option.displaylabel.split("\n").length - 1 && <br />}
                </small>
              ))}
            </label>
          </div>
        ))}
      </div>

      <input type="date" className="form-control mb-2 d-none" value={date} onChange={(e) => setDate(e.target.value)} />

      <div className="d-flex justify-content-between">
        <button type="submit" className="btn-lg btn-warning mt-2 w-100" disabled={isLoading || loading}>
          {isLoading || loading ? "Please wait..." : "Add Expense"}
        </button>
      </div>
    </form>
  );
};

export default AddExpense;

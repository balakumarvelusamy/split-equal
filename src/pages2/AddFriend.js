import React, { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { getData, addData, UpdateData, getItemsbyid, getCurrency, getCountryCurrency, getCurrencyName } from "../service/APIService";

const AddFriend = ({ onAddFriend, country }) => {
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");
  const [currencyOptions, setCurrencyOptions] = useState([]);
  const [currency, setCurrency] = useState("$"); // Default to Dollar
  useEffect(() => {
    const fetchCurrencyOptions = () => {
      const options = getCountryCurrency();
      setCurrencyOptions(options);
    };
    fetchCurrencyOptions();
  }, []);
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!friendName || !friendEmail) {
      alert("Please provide both a name and an email.");
      return;
    }

    const currencyName = await getCurrencyName(currency);

    const friend = {
      id: uuid(), // Add unique ID
      friendname: friendName.trim(),
      friendemail: friendEmail.trim(),
      balance: 0,
      currency,
      currencyName,
      type: "splitequal-friends",
      date: new Date().toISOString().replace("T", " ").split(".")[0],
    };

    onAddFriend(friend);
    setFriendName("");
    setFriendEmail("");
    setCurrency("$"); // Reset to default
  };

  return (
    <form onSubmit={handleSubmit}>
      <label>Friend Name</label>
      <input type="text" className="form-control" maxLength={40} placeholder="Friend's Name" value={friendName} onChange={(e) => setFriendName(e.target.value)} required />

      <label>Friend Email</label>
      <input type="email" className="form-control" placeholder="Friend's Email" value={friendEmail} onChange={(e) => setFriendEmail(e.target.value.toLowerCase())} required />

      <label>Select Default Currency</label>

      <select className="form-control mt-2" value={currency} onChange={(e) => setCurrency(e.target.value)} required>
        {currencyOptions.map((option) => (
          <option key={option.currency} value={option.currency}>
            {option.currencyName} ({option.currency})
          </option>
        ))}
      </select>

      <button type="submit" className="mt-3">
        Add Friend
      </button>
    </form>
  );
};

export default AddFriend;

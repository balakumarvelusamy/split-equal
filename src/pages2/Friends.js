import React, { useState } from "react";
import { onAddFriendService } from "..service/APIService";

const AddFriend = ({ onAddFriend }) => {
  const [friendName, setFriendName] = useState("");
  const [friendEmail, setFriendEmail] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (friendName.trim() === "" || friendEmail.trim() === "") {
      alert("Please provide both a name and an email.");
      return;
    }

    // Pass friend name and email back to the parent component
    onAddFriend({ name: friendName, email: friendEmail });
    //await onAddFriendService({ name: friendName, email: friendEmail, friends: [], expenses: [] });
    setFriendName("");
    setFriendEmail("");
  };

  return (
    <div className="container">
      <form onSubmit={handleSubmit} className="grid px-0">
        <input type="text" placeholder="Friend's name" value={friendName} onChange={(e) => setFriendName(e.target.value)} required />
        <input type="email" placeholder="Friend's email" value={friendEmail} onChange={(e) => setFriendEmail(e.target.value.toLowerCase())} required />
        <button type="submit">Add Friend</button>
      </form>
    </div>
  );
};

export default AddFriend;

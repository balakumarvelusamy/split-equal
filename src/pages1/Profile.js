import React, { useEffect, useState } from "react";
import logout from "../images/logout.png";

const Profile = () => {
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null); // Track the logged-in user's email
  const [loggedInUserName, setLoggedInUserName] = useState(""); // Store the user's name
  const loggedInUserEmail = localStorage.getItem("loggedInUserEmail");
  useEffect(() => {
    const initializeUserSession = async () => {
      const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const guestUser = JSON.parse(localStorage.getItem("guestUser"));

      if (sessionUser && loggedInUserEmail != "guest") {
        setLoggedInUser(sessionUser.email);
        setLoggedInUserName(sessionUser.name);
        setSessionInitialized(true); // Set session as initialized after setting user
      } else {
        setLoggedInUser(guestUser.email);
        setLoggedInUserName(guestUser.name);
        setSessionInitialized(true); // Set session as initialized after setting user
      }
    };
    initializeUserSession();
  }, []);
  // Handle user logout with confirmation

  return (
    <>
      <div className="container">
        <div align="right">
          <p className="mb-0">
            <small>Welcome, {loggedInUserName}!</small>
          </p>
        </div>

        {/* Profile Information */}
        <div className="border rounded p-2 bg-light">
          <div>
            <strong>Name:</strong> {loggedInUserName}
          </div>
          <div>
            <strong>Email:</strong> {loggedInUser}
          </div>
        </div>
      </div>
    </>
  );
};

export default Profile;

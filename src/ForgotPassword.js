// src/ForgotPassword.js
import React, { useState } from "react";
import config from "./config.json";
import { UpdateUser, sendEmail, fetchUsers } from "./service/APIService"; // Helper function to send requests
import "./styles/ForgotPassword.css"; // Add styles for this page
import CryptoJS from "crypto-js"; // Import crypto-js for encryption/decryption
import secureLocalStorage from "react-secure-storage";
const ForgotPassword = ({ useremail, showChangePassword, setShowChangePassword }) => {
  const [email, setEmail] = useState(useremail);
  const [currentUser, setCurrentUser] = useState({});
  const [otp, setOtp] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sendingOtp, setsendingOtp] = useState(false);
  const SECRET_KEY = process.env.REACT_APP_KEY;
  // Function to generate a random 6-digit OTP
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
  const encryptPassword = (password) => {
    return CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  };
  // Send OTP to user email
  const handleSendOtp = async (e) => {
    e.preventDefault();
    const otp = generateOtp();
    setGeneratedOtp(otp);
    const requestDateTime = new Date().toLocaleString();
    const htmlContent = `<p>Your OTP code is: <h2>{####}</h2></p><p>Requested on: {REQUEST_TIME}</p>`;
    const bodytext = otp;

    let emailData = {
      sender: process.env.REACT_APP_SENDEREMAIL,
      recipient: email,
      subject: config.apptitle + " Password Reset OTP",
      cc: email,
      body: htmlContent.replace("{####}", bodytext).replace("{REQUEST_TIME}", requestDateTime),
    };

    try {
      setsendingOtp(true);
      const user = await fetchUsers(email);
      console.log(user.email);
      if (user.email === email) {
        setCurrentUser(user);
        const response = await sendEmail(emailData);
        alert("OTP sent to your email address." + emailData.recipient);
        setStep(2); // Move to the OTP verification step
        setsendingOtp(false);
        setOtp("");
        setError("");
      } else {
        alert("No user found");
        setsendingOtp(false);
        setError("");
        setOtp("");
      }
    } catch (error) {
      console.error("Failed to send OTP email", error);
      setError("Failed to send OTP. Please try again.");
      setsendingOtp(false);
      setOtp("");
    }
  };

  // Validate OTP and update password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (otp !== generatedOtp) {
      setError("Invalid OTP. Please try again.");
      return;
    }

    try {
      setLoading(true);
      const encryptedPassword = encryptPassword(newPassword);
      const updatedUser = {
        ...currentUser, // Keep existing properties
        password: encryptedPassword, // Update password
      };
      await UpdateUser(updatedUser);
      alert("Password updated successfully.");
      setStep(1);
      setEmail("");
      setOtp("");
      setNewPassword("");
      setGeneratedOtp("");
      setError("");
      setShowChangePassword(false);
    } catch (error) {
      console.error("Failed to update password", error);
      setError("Failed to update password. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="forgot-password-container">
      {error && <p className="error-text text-danger">{error}</p>}
      {step === 1 && (
        <form onSubmit={handleSendOtp}>
          <label>Email Address:</label>
          <input type="email" placeholder="Enter your email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required className="form-control" />
          <button type="submit" className="btn bg-myapp-recipe-ai-warning mt-2">
            {sendingOtp ? "Sending OTP..." : "Send OTP"}
          </button>
        </form>
      )}
      {step === 2 && (
        <form onSubmit={handleResetPassword}>
          <label>OTP:</label>
          <input type="number" placeholder="Enter OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required className="form-control" step="any" min="0" inputMode="decimal" />
          <a className="toggle-link my-link my-2" align="right" onClick={handleSendOtp}>
            {sendingOtp ? "Sending..." : "Re-Send OTP"}
          </a>
          <p className="mb-0">New Password:</p>
          <input type="password" placeholder="Enter new password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} required className="form-control" />
          <button type="submit" className="btn btn-warning mt-2">
            {loading ? "Resetting Password..." : "Reset Password"}
          </button>
        </form>
      )}
    </div>
  );
};

export default ForgotPassword;

import React, { useEffect, useState } from "react";
import logout from "../images/logout.png";
import Support from "./Contact";
import config from "../config.json";
import { useNavigate } from "react-router-dom";
import { fetchUsers, deleteUser, sendEmail, UpdateUser, getCountryCurrency } from "../service/APIService"; // Assume sendOtp sends an OTP to the email
import { Modal, Button } from "react-bootstrap";
import close from "../images/delete.png";
import secureLocalStorage from "react-secure-storage";
const Profile = () => {
  const [sessionInitialized, setSessionInitialized] = useState(false);
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [alertVisible, setAlertVisible] = useState(false);
  const [isAdminVisible, setIsAdminVisible] = useState(true);
  const [loggedInUserName, setLoggedInUserName] = useState("");
  const [showDeleteSection, setShowDeleteSection] = useState(false);
  const [showSupportSection, setShowSupportSection] = useState(false);
  const [enteredEmail, setEnteredEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState("");
  const [serverOtp, setServerOtp] = useState("");
  const [role, setRole] = useState("");
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const [finalConfirm, setFinalConfirm] = useState(false);

  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // Initialize navigate
  const [deleteSuccess, setDeleteSuccess] = useState(false);
  const loggedInUserEmail = secureLocalStorage.getItem("loggedInUserEmail");
  const [showModal, setShowModal] = useState(false);
  useEffect(() => {
    const initializeUserSession = async () => {
      if (deleteSuccess) {
        navigate("/");
        return;
      }
      const countryList = getCountryCurrency().map((item) => item.country);
      setCountries(countryList);
      const isBiometricEnabled = secureLocalStorage.getItem("biometricEnabled") === "true";
      setBiometricEnabled(isBiometricEnabled);
      const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
      const guestUser = JSON.parse(secureLocalStorage.getItem("guestUser"));
      if (sessionUser && loggedInUserEmail != "guest") {
        setLoggedInUser(sessionUser.email);
        setLoggedInUserName(sessionUser.name);
        setCountry(sessionUser.country || "");
        setRole(sessionUser.role);
        console.log("user", sessionUser);
        setSessionInitialized(true); // Set session as initialized after setting user
      } else {
        setLoggedInUser(guestUser.email);
        setLoggedInUserName(guestUser.name);
        setCountry(guestUser.country || "");
        setRole("");
        setSessionInitialized(true); // Set session as initialized after setting user
      }
    };
    initializeUserSession();
  }, [loggedInUser, deleteSuccess, navigate]);
  function isWebView() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    if (window.ReactNativeWebView) {
      return true;
    }
    if (/iPhone|iPad|iPod/.test(userAgent) && /AppleWebKit/.test(userAgent) && !/Safari/.test(userAgent)) {
      return true;
    }
    if (/wv|WebView/.test(userAgent)) {
      return true;
    }
    return false;
  }
  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text).then(
      () => {
        setAlertVisible(true);
        setTimeout(() => setAlertVisible(false), 1000);
      },
      (err) => {
        console.error("Failed to copy text:", err);
      }
    );
  };
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out from all apps?")) {
      secureLocalStorage.removeItem("loggedInUser");
      secureLocalStorage.removeItem("guestUser");
      secureLocalStorage.setItem("isLoggedOut", true);
      navigate("/");
    }
  };
  const handleDeleteProfile = async () => {
    const isConfirmed = window.confirm("Are you sure you want to delete your profile? ❌");
    if (!isConfirmed) return;
    setLoading(true);
    try {
      if (loggedInUser === enteredEmail && otpInput === serverOtp && finalConfirm) {
        const users = await fetchUsers(enteredEmail);
        if (users.email === loggedInUser) {
          console.log("delete user is valid");
          const deleteResponse = await deleteUser(users.id);
          setLoggedInUser("");
          setLoggedInUserName("");
          secureLocalStorage.removeItem("loggedInUser");
          secureLocalStorage.setItem("isLoggedOut", true);
          alert("Profile deleted successfully.");
          setDeleteSuccess(true);
        } else {
          alert("Email did not match. Failed to delete profile. Please try again.");
        }
      } else {
        alert("Email or OTP did not match. Please verify your details.");
      }
    } catch (error) {
      alert("Failed to delete user profile.");
    } finally {
      setLoading(false);
    }
  };
  const handleCountryChange = async (selectedCountry) => {
    setCountry(selectedCountry); // Update state immediately for a smooth UI

    if (loggedInUserEmail === "guest") {
      // Handle guest user update in localStorage
      const guestUser = JSON.parse(secureLocalStorage.getItem("guestUser"));
      guestUser.country = selectedCountry;
      secureLocalStorage.setItem("guestUser", JSON.stringify(guestUser));
      alert("Country updated for guest user.");
    } else {
      // Handle logged-in user update via server
      try {
        setLoading(true);
        const user = await fetchUsers(loggedInUserEmail);
        const updatedUser = { ...user, country: selectedCountry };
        console.log(updatedUser);
        await UpdateUser(updatedUser); // Update user on the server
        const loggedInUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
        loggedInUser.country = selectedCountry;
        secureLocalStorage.setItem("loggedInUser", JSON.stringify(loggedInUser));
        alert("Country updated successfully.");
      } catch (error) {
        console.error("Failed to update country:", error);
        alert("Failed to update country. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  const handleSendOtp = async () => {
    if (enteredEmail === loggedInUser) {
      const otp = Math.floor(100000 + Math.random() * 900000).toString(); // Generate a 6-digit OTP
      const requestDateTime = new Date().toLocaleString();
      const htmlContent = `<p>Your OTP code is: <h2>${otp}</h2></p><p>Requested on: ${requestDateTime}</p>`;

      const emailData = {
        sender: process.env.REACT_APP_SENDEREMAIL,
        recipient: loggedInUser,
        subject: config.apptitle + " Profile Deletion OTP",
        cc: loggedInUser,
        body: htmlContent,
      };

      try {
        setLoading(true);
        const response = await sendEmail(emailData); // Use sendEmail method here
        alert("OTP sent to your email address: " + emailData.recipient);
        setServerOtp(otp); // Set the generated OTP for later verification
        setOtpSent(true);
        setLoading(false);
      } catch (error) {
        alert("Failed to send OTP. Please try again.");
        setLoading(false);
      }
    } else {
      alert("Entered email does not match logged-in email.");
    }
  };
  const handleShowDetails = (recipe) => {
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
  };
  return (
    <>
      <div className="container">
        <div className="d-flex justify-content-between text-small">
          <div className="text-dark">
            <p>Welcome, {loggedInUserName}!</p>
          </div>
          <div className="mb-0">
            <a className="btn btn-sm w-auto text-dark bg-myapp-recipe-ai-warning px-2 mb-0 text-decoration-none " href="/" onClick={handleLogout}>
              Logout{" "}
              <span>
                <i className="fas fa-sign-out-alt"></i>
              </span>
            </a>
          </div>
        </div>
        <div className="border rounded p-2 bg-light">
          <div className="p-2">
            <strong>Name:</strong> {loggedInUserName}
          </div>
          <div className="p-2">
            <strong>Email:</strong> {loggedInUser}
          </div>
          <div className="d-flex align-items-center p-2 d-none">
            <strong>Country:</strong>{" "}
            <select value={country} defaultvalue={country} onChange={(e) => handleCountryChange(e.target.value)} className="form-control p-2 m-0 mx-1">
              <option value="">Select Country</option>
              {countries.map((countryName, index) => (
                <option key={index} value={countryName.toLowerCase()}>
                  {countryName}
                </option>
              ))}
              <option value="other">Other</option>
            </select>
          </div>
          {!isWebView() && loggedInUserEmail != "guest" && (
            <div className="d-none">
              <strong>Biometric Authentication:</strong> {biometricEnabled ? "Enabled" : "Disabled"}
            </div>
          )}
        </div>

        {loggedInUserEmail === "guest" && (
          <div align="center" className="p-3">
            <a className="btn btn-sm w-auto text-dark bg-myapp-recipe-ai-warning p-2 mb-0 text-decoration-none " href="/" onClick={handleLogout}>
              Login to access all features
            </a>
          </div>
        )}
        {/* Delete Profile Section */}
        <div className="mt-2" align="right">
          {loggedInUserEmail != "guest" && (
            <div className="d-flex justify-content-between">
              <button className="btn bg-myapp-recipe-ai-warning p-1 px-1 btn-sm w-auto" onClick={() => setShowModal(!showModal)}>
                <span>
                  <i className="fi fi-rr-user"></i>
                </span>{" "}
                Support
              </button>
              <button className="btn btn-danger p-1 px-1 btn-sm w-auto" onClick={() => (setShowDeleteSection(!showDeleteSection), setFinalConfirm(false))}>
                <span>
                  <i className="fi fi-rr-trash"></i>
                </span>{" "}
                Delete Profile{" "}
                {showDeleteSection && (
                  <span>
                    <i className="fi fi-rr-cross"></i>
                  </span>
                )}
              </button>
            </div>
          )}
          {showDeleteSection && (
            <div className="mt-3 border rounded p-3 bg-light" align="left">
              {" "}
              <h4 className="text-danger">Delete Profile</h4>
              <p>Are you sure you want to delete your profile?</p>
              <div>
                <label>Enter your email to confirm:</label>
                <input type="email" value={enteredEmail} onChange={(e) => setEnteredEmail(e.target.value)} className="form-control my-2" />
                <button className="btn btn-warning" onClick={handleSendOtp}>
                  {loading ? "Please wait..." : otpSent ? "Resend OTP" : "Send OTP"}
                </button>
              </div>
              {otpSent && (
                <div className="mt-3">
                  <label>Enter OTP sent to your email:</label>
                  <input type="number" value={otpInput} onChange={(e) => setOtpInput(e.target.value)} className="form-control my-2" step="any" min="0" inputMode="decimal" />
                  <button className="btn btn-danger" onClick={() => (setFinalConfirm(true), setShowDeleteSection(false))}>
                    Confirm Deletion
                  </button>
                </div>
              )}
            </div>
          )}
          {finalConfirm && (
            <div className="mt-3">
              <p>Are you absolutely sure you want to delete your profile?</p>
              <button className="btn btn-danger w-auto" onClick={handleDeleteProfile}>
                Yes, delete my profile
              </button>
            </div>
          )}
        </div>

        <Modal show={showModal} onHide={handleCloseModal} centered>
          <div className="modal-header">
            <h5 className="text-success mb-0">Support</h5>
            <a onClick={(e) => setShowModal(false)}>
              <img src={close} alt="Logo" className="" width="30" />
            </a>
          </div>
          <Modal.Body>
            <Support />
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={handleCloseModal}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>{" "}
      {isAdminVisible && role.includes("admin") && (
        <div align="center">
          <div className="">
            <a href="/admin/dashboard" className="text-decoration-none btn btn-sm btn-warning mx-1">
              <p className="mb-0">Admin</p>
            </a>
            <button
              className="btn btn-small border p-0 px-1"
              onClick={() => setIsAdminVisible(false)} // Hide the icon on click
              aria-label="Close"
            >
              Close
            </button>
          </div>
        </div>
      )}
      <div className="container d-none">
        <span>
          <button className="share-button" onClick={() => copyToClipboard(config.iosurl)}>
            <i className="fa fa-apple"></i>
          </button>
        </span>
        <span>
          <button className="share-button" style={{ bottom: "145px" }} onClick={() => copyToClipboard(config.androidurl)}>
            <i className="fa fa-android"></i>
          </button>
        </span>
        <small className="share-text ">
          <i className="fa fa-share text-secondary"></i>
        </small>
      </div>
      <div className="d-flex justify-content-end align-items-center mb-0 m-1">
        {alertVisible && (
          <div className="d-flex justify-content-center text-dark w-100">
            <div
              className="bg-white border justify-content-center text-dark "
              style={{
                color: "white",
                padding: "5px",
                borderRadius: "5px",

                zIndex: 1000,
              }}
            >
              Link copied to clipboard for Sharing
            </div>
          </div>
        )}
      </div>
    </>
  );
};

export default Profile;

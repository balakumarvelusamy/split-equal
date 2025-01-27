// src/LoginPage.js
import React, { useState, useEffect, useRef } from "react";
import { fetchUsers, saveUser, sendEmail, UpdateUser, getCountryCurrency } from "./service/APIService"; // Import UpdateUser function
import { Col, Image, Row, Modal, Button } from "react-bootstrap";
import { Link } from "react-router-dom";
import CryptoJS from "crypto-js";
import { FiEye, FiEyeOff, FiX, FiChevronDown } from "react-icons/fi";
import secureLocalStorage from "react-secure-storage";
import "./styles/LoginPage.css";
import "./App.css";
import config from "./config.json";
import banner from "./images/banner.jpg";
import logo from "./images/recipeailogo.jpg";
import ForgotPassword from "./ForgotPassword";
import close from "./images/delete.png";
import { jwtDecode } from "jwt-decode";
import { GoogleOAuthProvider, GoogleLogin, useGoogleLogin } from "@react-oauth/google";
const SECRET_KEY = process.env.REACT_APP_KEY;

const LoginPage = ({ onLogin }) => {
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showLoginOptionModal, setShowLoginOptionModal] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentUser, setCurrentUser] = useState({});
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [username, setUserName] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [sendingOtp, setsendingOtp] = useState(false);
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [isOtpSent, setIsOtpSent] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [biometricEnabled, setBiometricEnabled] = useState(false);
  const [country, setCountry] = useState("");
  const [countries, setCountries] = useState([]);
  const SECRET_KEY = process.env.REACT_APP_KEY;
  const GOOLGLE_SECRET_KEY = process.env.REACT_APP_SECRET_GOOGLE;
  const CLIENT_ID = process.env.REACT_APP_CLIENTID_GOOGLE;
  const googleButtonRef = useRef(null);
  useEffect(() => {
    const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
    const useremail = secureLocalStorage.getItem("loggedInUserEmail");
    const countryList = getCountryCurrency().map((item) => item.country);
    setCountries(countryList);
    if (sessionUser) {
      setEmail(sessionUser.email === "guest" ? "" : sessionUser?.email);
      setName(sessionUser.name);
    } else {
      setEmail(useremail === "guest" ? "" : sessionUser?.email);
    }
  }, []);

  const encryptPassword = (password) => CryptoJS.AES.encrypt(password, SECRET_KEY).toString();
  const decryptPassword = (encryptedPassword) => CryptoJS.AES.decrypt(encryptedPassword, SECRET_KEY).toString(CryptoJS.enc.Utf8);
  const generateOtp = () => Math.floor(100000 + Math.random() * 900000).toString();
  const handleSendOtp = async (e) => {
    if (email === "" || name === "" || password === "" || country == "") {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }
    console.log({ email, name, password: "encryptedPassword", country });
    e.preventDefault();
    setsendingOtp(true);
    const existingUser = await fetchUsers(email);
    if (existingUser) {
      setError("User already exists with this email");
      setsendingOtp(false);
      return;
    }

    const otpCode = generateOtp();
    setGeneratedOtp(otpCode);
    const requestDateTime = new Date().toLocaleString();
    const htmlContent = `<p>Your OTP code is: {####}</p><p>Requested on: {REQUEST_TIME}</p>`;
    const bodytext = otpCode;

    const emailData = {
      sender: process.env.REACT_APP_SENDEREMAIL,
      recipient: email,
      subject: `${config.apptitle} Registration OTP Code`,
      cc: email,
      body: htmlContent.replace("{####}", bodytext).replace("{REQUEST_TIME}", requestDateTime),
    };

    try {
      await sendEmail(emailData);
      setIsOtpSent(true);
      setError("");
      setOtp("");
    } catch (error) {
      console.error("Failed to send OTP email", error);
      setError("Failed to send OTP. Please try again.");
      setsendingOtp(false);
      setOtp("");
    }
    setsendingOtp(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    if (otp !== generatedOtp) {
      setError("Invalid OTP. Please try again.");
      setLoading(false);
      return;
    }
    if (email === "" || name === "" || password === "" || country == "") {
      setError("Please fill all fields");
      setLoading(false);
      return;
    }

    const encryptedPassword = encryptPassword(password);

    await saveUser({ email, name, password: encryptedPassword, country });
    setLoading(false);
    setShowRegister(false);
    setError("");
    setIsOtpSent(false);
    setOtp("");
    setShowRegisterModal(false);
    alert("User Registered Sucessfully ✅. Please log in");
    setShowLoginModal(true);
  };

  function isWebView() {
    const userAgent = navigator.userAgent || navigator.vendor || window.opera;
    // Check for React Native WebView (window.ReactNativeWebView)
    if (window.ReactNativeWebView) {
      return true;
    }
    // Check if running in a WKWebView on iOS (older detection fallback)
    if (/iPhone|iPad|iPod/.test(userAgent) && /AppleWebKit/.test(userAgent) && !/Safari/.test(userAgent)) {
      return true;
    }
    // Check if running in Android WebView by detecting "wv" or "WebView" in user agent
    if (/wv|WebView/.test(userAgent)) {
      return true;
    }
    // Not in WebView
    return false;
  }
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const storedUser = await fetchUsers(email);
    setCurrentUser(storedUser);
    if (storedUser) {
      const decryptedPassword = decryptPassword(storedUser.password);
      console.log("decryptedPassword", storedUser.password);
      console.log("decryptedPassword", decryptedPassword);
      if (decryptedPassword === password) {
        setLoading(false);
        onLogin({ email: storedUser.email, name: storedUser.name, country: storedUser.country || "" });
        setError("");
        console.log(window.webkit, "window.webki");
      } else {
        setError("Invalid email or password");
        setLoading(false);
      }
    } else {
      setError("User not found. Please Register to Log in.");
      setLoading(false);
    }
  };

  const handleLoginSuccess = async (response) => {
    try {
      setLoading(true);
      const decoded = jwtDecode(response.credential); // Decode the JWT
      console.log("Decoded Token:", decoded);
      const email = decoded.email;
      const name = decoded.name;
      console.log("Google Login Success", { email, name });
      // Check if the user exists
      let user = await fetchUsers(email);
      if (!user) {
        await saveUser({ email, name, password: "", country: country || "Unknown" });
        user = { email, name, country: country || "Unknown" };
      }
      // Log the user in
      onLogin({ email: user.email, name: user.name, country: user.country });
      setLoading(false);
      alert("Logged in successfully with Google!");
    } catch (error) {
      setLoading(false);
      console.error("Failed to decode Google credential", error);
      alert("Failed to log in with Google. Please try again.");
    }
  };

  const handleLoginError = () => {
    console.error("Login Failed");
  };
  const GoogleLoginWrapper = () => {
    const [loginState, setLoginState] = useState({ error: null, success: null });

    const googleLogin = useGoogleLogin({
      onSuccess: (response) => {
        console.log("Login Success:", response);
        const decoded = jwtDecode(response.credential); // Decode the JWT
        const email = decoded.email;
        alert("Logged in successfully with Google!" + email);
        setLoginState({ success: "Logged in successfully!", error: null });
      },
      onError: () => {
        console.error("Login Failed");
        setLoginState({ success: null, error: "Login failed. Please try again." });
      },
    });

    const handleCustomButtonClick = () => {
      googleLogin(); // Trigger the Google Login flow
    };

    return (
      <div className="mt-2" align="center">
        {/* Custom Button */}
        <button className="btn btn-dark loginbtn" onClick={handleCustomButtonClick}>
          Login with Google
        </button>

        {/* Status Message */}
        {loginState.success && <p style={{ color: "green" }}>{loginState.success}</p>}
        {loginState.error && <p style={{ color: "red" }}>{loginState.error}</p>}
      </div>
    );
  };

  return (
    <div className="">
      <header className="header bg-myapp-recipe-ai ">
        <div className="d-flex justify-content-between align-items-center">
          <div className="flex-grow-1">
            <h1 className="titlename-recipe-ai mb-0 text-nowrap w-75 px-3 p-3 ">{config.apptitle}</h1>{" "}
          </div>
          <div> {process.env.REACT_APP_ENV === "QA" && <small className="px-2">NP</small>}</div>

          <div className="px-2">
            <img src={logo} alt="Logo" className="rounded" width="45" />
          </div>
        </div>
      </header>
      <div className="login-container1 px-3">
        <div className="mt-4">
          <button type="button" className="btn btn-lg bg-myapp-recipe-ai-warning w-100  px-2 rounded " onClick={() => (setShowLoginOptionModal(true), setError(""))}>
            <small>Login</small>
          </button>
          <button type="button" className="btn btn-lg bg-dark w-100 text-light mt-2" onClick={() => (setShowRegister(true), setError(""), setShowRegisterModal(true), setIsOtpSent(false))}>
            <small>Register</small>
          </button>
        </div>

        <div className="mt-3 w-100">
          <div className="d-flex justify-content-between w-100">
            <div>
              <button type="button" className="toggle-link my-link  mt-1 text-decoration-none" onClick={() => onLogin({ email: "guest", name: "guest", country: "" })}>
                Log in as Guest
              </button>
            </div>
            <div>
              <button type="button" className="toggle-link my-link  mt-1 text-decoration-none" onClick={() => setShowChangePassword(true)}>
                Change Password?
              </button>
            </div>
          </div>
        </div>
      </div>
      <Modal show={showChangePassword} onHide={() => setShowChangePassword(false)} top backdrop="static" keyboard={false}>
        <div className="modal-header">
          <h5 className="modal-title">Forgot Password</h5>
          <a onClick={() => setShowChangePassword(false)}>
            <img src={close} alt="Logo" className="" width="30" />
          </a>
        </div>
        <Modal.Body>
          <ForgotPassword useremail={email} showChangePassword={showChangePassword} setShowChangePassword={setShowChangePassword} />
        </Modal.Body>
      </Modal>

      <Modal show={showLoginModal} top backdrop="static" keyboard={false} onHide={() => setShowLoginModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Login to {config.apptitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={handleLogin}>
            {error && <p className="error-text text-danger">{error}</p>}
            <div className="mb-3">
              <div align="left">Email</div>
              <div className="password-container" style={{ position: "relative", width: "100%" }}>
                <input type="email" placeholder="Enter your Email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required className="form-control" />
                <button
                  type="button"
                  onClick={() => setEmail("")}
                  className="btn-eye text-danger"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    color: "red",
                    cursor: "pointer",
                    padding: "0",
                  }}
                >
                  {email ? <FiX /> : ""}
                </button>
              </div>
            </div>
            <div className="mb-3">
              <div align="left">Password</div>
              <div className="password-container" style={{ position: "relative", width: "100%" }}>
                <input type={showPassword ? "text" : "password"} placeholder="Enter your Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-control" style={{ paddingRight: "2.5rem" }} />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="btn-eye"
                  style={{
                    position: "absolute",
                    right: "10px",
                    top: "50%",
                    transform: "translateY(-50%)",
                    background: "none",
                    border: "none",
                    cursor: "pointer",
                    padding: "0",
                  }}
                >
                  {showPassword ? <FiEyeOff /> : <FiEye />}
                </button>
              </div>
            </div>
            <div className="text-end">
              <button type="submit" className="btn btn-lg bg-myapp-recipe-ai-warning" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </div>
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="success px-2 py-1" onClick={() => setShowRegisterModal(true)}>
            Register
          </Button>
          <Button variant="secondary px-2 py-1" onClick={() => setShowLoginModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showLoginOptionModal} top backdrop="static" keyboard={false} onHide={() => setShowLoginOptionModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Select Login Option</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {" "}
          <div align="center" className="d-flex-column justify-content-column mt-2 align-items-center ">
            <div className="">
              {" "}
              <div className="mt-3">
                <button type="button" className="loginbtn btn btn-md btn-light border  p-2  px-4 rounded " onClick={() => setShowLoginModal(true)}>
                  <small>Login with Email</small>
                </button>
              </div>
              <div id="googlebutton" className="" align="center">
                {loading ? (
                  <p className="p-1 mb-0 border w-auto rounded mt-2 loginbtn" align="center">
                    <span className="px-1">
                      <i className="fas fa-spinner fa-spin text-success"></i>
                    </span>
                    Logging in...
                  </p>
                ) : (
                  <>
                    <div className="mt-2" align="center">
                      {CLIENT_ID && (
                        <GoogleOAuthProvider clientId={CLIENT_ID}>
                          <GoogleLogin className="google-login-button" onSuccess={handleLoginSuccess} onError={handleLoginError} shape="rectangular" width={"250px"} type="standard" theme="filled_black" />
                        </GoogleOAuthProvider>
                      )}
                    </div>
                    <div className="d-none">
                      {CLIENT_ID && (
                        <GoogleOAuthProvider clientId={CLIENT_ID}>
                          <GoogleLoginWrapper />
                        </GoogleOAuthProvider>
                      )}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </Modal.Body>
        <Modal.Footer className="py-1">
          <Button variant="secondary px-2 py-1" onClick={() => setShowLoginOptionModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showRegisterModal} top backdrop="static" keyboard={false} onHide={() => setShowRegisterModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Register for {config.apptitle}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <form onSubmit={isOtpSent ? handleRegister : handleSendOtp} className="login-form">
            {
              <>
                {" "}
                <div align="left">Full Name</div>
                <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required className="form-control" />
                <div align="left">Email</div>
                <div className="password-container" style={{ position: "relative", width: "100%" }}>
                  <input type="email" placeholder="Enter your Email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required className="form-control" />
                  <button
                    type="button"
                    onClick={() => setEmail("")}
                    className="btn-eye text-danger"
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "red",
                      cursor: "pointer",
                      padding: "0",
                    }}
                  >
                    {email ? <FiX /> : ""}
                  </button>
                </div>
                <div align="left" className="d-none">
                  User Name
                  <input type="text" placeholder="User Name" value={name} onChange={(e) => setUserName(e.target.value)} required className="form-control" />
                </div>
                <div align="left">Password</div>
                <div className="password-container" style={{ position: "relative", width: "100%" }}>
                  <input type={showPassword ? "text" : "password"} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required className="form-control" style={{ paddingRight: "2.5rem" }} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="btn-eye">
                    {showPassword ? <FiEyeOff /> : <FiEye />}
                  </button>
                </div>
                <div align="left">Country</div>
                <div className="password-container" style={{ position: "relative", width: "100%" }}>
                  <select value={country} onChange={(e) => setCountry(e.target.value)} required className="form-control">
                    <option value="">Select a Country</option>
                    {countries.map((countryName, index) => (
                      <option key={index} value={countryName.toLowerCase()}>
                        {countryName}
                      </option>
                    ))}
                  </select>{" "}
                  <button
                    type="button"
                    className="btn-eye text-danger"
                    style={{
                      position: "absolute",
                      right: "10px",
                      top: "50%",
                      transform: "translateY(-50%)",
                      background: "none",
                      border: "none",
                      color: "black",
                      cursor: "pointer",
                      padding: "0",
                    }}
                  >
                    {<FiChevronDown />}
                  </button>
                </div>
              </>
            }
            {isOtpSent && (
              <>
                <div align="left">Enter OTP</div>
                <input type="number" placeholder="OTP" value={otp} onChange={(e) => setOtp(e.target.value)} required className="form-control" step="any" min="0" inputMode="decimal" />
                <a className="toggle-link my-link my-2" onClick={handleSendOtp}>
                  {sendingOtp ? "Sending.." : "Re-Send OTP"}
                </a>
              </>
            )}
            {!isOtpSent && (
              <>
                <small className="text-danger">{error}</small>
                <button type="submit" onClick={handleSendOtp} className="btn btn-lg bg-myapp-recipe-ai-warning mt-2 w-100 rounded-start border-white" disabled={loading}>
                  <small> {sendingOtp ? "Please wait..." : "Get OTP & Register"}</small>
                </button>
              </>
            )}
            {isOtpSent && (
              <p>
                <small className="text-danger"> {error}</small>

                <button type="button" onClick={handleRegister} className="btn btn-lg bg-myapp-recipe-ai-warning mt-2 w-100 rounded-start border-white " disabled={loading}>
                  <small>{loading ? "Please wait..." : "Register"}</small>
                </button>
              </p>
            )}
          </form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary px-2 py-1" onClick={() => setShowRegisterModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
      <footer className="bottom-nav bottom-nav-recipe-bottom-radius rounded-top bg-myapp-recipe-ai py-3">
        <small className="text-light px-2">
          <small>{config.footertext}</small>
          <div className="d-flex justify-content-center">
            <a href="/privacypolicy" className=" px-2 text-decoration-underline ">
              Privacy Policy
            </a>
            <a href="/contact" className=" px-2 text-decoration-underline ">
              Contact us
            </a>
          </div>
        </small>
      </footer>
    </div>
  );
};

export default LoginPage;

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, useMatch } from "react-router-dom";
import { useNavigate } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import { Link } from "react-router-dom";
import Home from "./pages7-recipie-ai/Home"; // Recepie AI
import App7 from "./App7"; // Recepie AI
import Admin from "./AppAdmin";
import BottomNav from "./Manage/BottomNav";
import AppManage from "./AppManage";
import AppPublic from "./AppPublic";
import "./MainApp.css";
import "./styles/expensetracker.css";
import { fetchUsers, saveUser } from "./service/APIService"; // Import the API service functions
import image from "./images/pr_source.png"; // Main page image
import icon1 from "./images/splitequal.png";
import qr from "./images/qr.jpg"; // Icon image for the app
import user from "./images/user.png";
import share from "./images/share.png";
import commingsoon from "./images/commingsoon.jpg";
import logo from "./images/recipeailogo.jpg";
import todo from "./images/todolist.jpg";
import AppCarousel from "./AppCarousel";
import "./styles/BottomNav.css";
import "./styles/Header.css";
import config from "./config.json";
import LoginPage from "./LoginPage";
import apps from "./data/apps";

import banner from "./images/recipeailogo.jpg";
import admin from "./images/admin.jpg";

const MainApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(JSON.parse(localStorage.getItem("isLoggedOut")));
  const [showRegister, setShowRegister] = useState(false);
  const [alertVisible, setAlertVisible] = useState(false);
  const [isAdminVisible, setIsAdminVisible] = useState(true);
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showA2HSButton, setShowA2HSButton] = useState(false);

  const matchApp1 = useMatch("/app1/*");
  const matchApp2 = useMatch("/app2/*");
  const matchApp31 = useMatch("/app3/*");
  const matchApp5 = useMatch("/app5/*");
  const matchApp6 = useMatch("/app6/*"); //finalcial calc
  const matchApp7 = useMatch("/app7/*"); //finalcial calc
  const _App4 = useMatch("/app4/*");
  const _admin = useMatch("/admin/*");
  const matchApp3 = useMatch("/manage/*");
  const matchApp4 = useMatch("/public/*");

  const navigate = useNavigate();

  useEffect(() => {
    try {
      const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
      const guestUser = JSON.parse(localStorage.getItem("guestUser"));
      if (sessionUser) {
        setError(false);
        setIsLoggedIn(true);
        setEmail(sessionUser.email);
        setName(sessionUser.name);
      } else if (guestUser) {
        setIsLoggedIn(true);
        setEmail("guest");
        setName("guest");
        setError(false);
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setError(true);
    }
  }, [isLoggedIn, navigate]);

  const isNestedApp = matchApp1 || matchApp31 || matchApp2 || matchApp3 || matchApp4 || _App4 || _admin || matchApp5 || matchApp6 || matchApp7;

  const handleLogin = (userData) => {
    try {
      if (userData.email === "guest") {
        localStorage.setItem("guestUser", JSON.stringify(userData));
        localStorage.setItem("isLoggedOut", false);
        localStorage.setItem("loggedInUserEmail", "guest");
      } else {
        localStorage.setItem("loggedInUser", JSON.stringify(userData));
        localStorage.setItem("loggedInUserEmail", userData.email);
        localStorage.setItem("isLoggedOut", false);
      }
      setIsLoggedOut(false);
      setIsLoggedIn(userData);
      setError(false);
      const currentUrl = window.location.hostname; // Get the current hostname
      navigate("/app7/home");
    } catch {
      setError(true);
    }
  };
  const handleLogout = () => {
    if (window.confirm("Are you sure you want to log out from all apps?")) {
      localStorage.removeItem("loggedInUser");
      localStorage.setItem("isLoggedOut", true);
      navigate("/app7/home");
    } else {
      navigate("/app7/home");
    }
  };
  const NotFoundPage = () => {
    return (
      <div className="container" style={{ textAlign: "center", padding: "20px" }}>
        <h1>Welcome to {config.apptitle}</h1>

        <p>Please reload the App</p>
        <button className="btn btn-success" onClick={() => (window.location.href = "/app7/home")} style={{ padding: "10px 30px", fontSize: "16px" }}>
          Reload
        </button>
      </div>
    );
  };
  if ((!isLoggedIn || isLoggedOut) && !matchApp4) {
    return (
      <div>
        <div className="container mb-0 d-flex flex-column align-items-center">
          <div>
            <p className="mb-0">Welcome to {config.apptitle}</p>
          </div>
          <div>
            {" "}
            <p align="center" className="app-description">
              {config.appdescription}
            </p>
          </div>
        </div>
        <AppCarousel />{" "}
        <div className="mt-0 d-flex flex-column align-items-center">
          <div>
            <img src={banner} className="rounded" height="200" alt="Login Banner" />
          </div>
        </div>
        <LoginPage onLogin={handleLogin} />
        <div className="container mt-4 d-flex flex-column align-items-center">
          <small align="center" className="app-description px-2 pb-0">
            {config.appdescription2}
          </small>
        </div>
      </div>
    );
  } else
    return (
      <>
        {error ? (
          <NotFoundPage />
        ) : (
          <div>
            {!isNestedApp && (
              <div align="center" className="p-5">
                <button className="btn  bg-myapp-recipe-ai text-light " onClick={() => (window.location.href = "/app7/home")} style={{ padding: "10px 30px", fontSize: "16px" }}>
                  Go To Home
                </button>
              </div>
            )}
            <ErrorBoundary>
              <Routes>
                <Route path="/app7/*" element={<App7 />} />
                <Route path="/manage/*" element={<AppManage />} />
                <Route path="/admin/*" element={<Admin />} />
                <Route path="/public/*" element={<AppPublic />} />
              </Routes>
            </ErrorBoundary>
          </div>
        )}
      </>
    );
};

// Wrap MainApp with Router to allow useMatch and other hooks to work
const MainAppWrapper = () => (
  <Router>
    <MainApp />
  </Router>
);

const styles = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "20px",
    padding: "10px",
  },
  iconContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  appIconLink: {
    textDecoration: "none",
    textAlign: "center",
  },
  appIcon: {
    width: "75px",
    height: "75px",
    borderRadius: "15px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
  appText: {
    marginTop: "8px",
    fontSize: "12px",
    color: "#000",
  },
  a2hsButton: {
    position: "fixed",
    bottom: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 20px",
    backgroundColor: "#FFC107",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: 1000, // Ensures it's above other content
  },
  closeButton: {
    position: "absolute",
    background: "#f00",
    color: "#fff",
    border: "none",

    fontSize: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    left: "62%",
  },
};
const styles1 = {
  container: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    gap: "10px",
  },
  iconContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  appIconLink: {
    textDecoration: "none",
    textAlign: "center",
  },
  appIcon: {
    width: "45px",
    height: "45px",
    borderRadius: "10px",
    boxShadow: "0px 4px 10px rgba(0, 0, 0, 0.2)",
  },
  appText: {
    marginTop: "8px",
    fontSize: "11px",
    color: "#000",
  },
  a2hsButton: {
    position: "fixed",
    bottom: "80px",
    left: "50%",
    transform: "translateX(-50%)",
    padding: "10px 20px",
    backgroundColor: "#FFC107",
    color: "#fff",
    border: "none",
    borderRadius: "5px",
    fontSize: "16px",
    cursor: "pointer",
    boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)",
    zIndex: 1000, // Ensures it's above other content
  },
};

export default MainAppWrapper;

import React, { useEffect, useState } from "react";
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from "react-router-dom";
import ErrorBoundary from "./ErrorBoundary";
import secureLocalStorage from "react-secure-storage";
import logo from "./images/recipeailogo.jpg";
//private
import Home from "./pages7-recipie-ai/Home"; // Recipe AI
import History from "./pages7-recipie-ai/History";
import CalHistory from "./pages7-recipie-ai/CalHistory";
import Blog from "./pages7-recipie-ai/Blog";
import CalorieCheck from "./pages7-recipie-ai/CalorieCheck";
import Profile from "./pages7-recipie-ai/Profile";
import BottomNav from "./components7/BottomNav";

import Header from "./components7/Header";
import AppCarousel from "./AppCarousel";
import LoginPage from "./LoginPage";
//assets
import "./MainApp.css";
import "./styles/expensetracker.css";
import banner from "./images/recipeailogo.jpg";
import config from "./config.json";
import "./styles/BottomNav.css";
import "./styles/Header.css";

//public
import PrivacyPolicy from "./Public/PrivacyPolicy";
import Contact from "./Public/Contact";
import PublicBottomNav from "./Public/BottomNav";
import PublicHeader from "./Public/Header";
///admin
import AdminHeader from "./adminComponents/Header";
import AdminBottomNav from "./adminComponents/BottomNav";
import AdminDashboard from "./adminPages/Dashboard";
import AdminContactus from "./adminPages/ContactUs";
const useremail = secureLocalStorage.getItem("loggedInUserEmail");
const MainApp = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(JSON.parse(secureLocalStorage.getItem("isLoggedOut")));
  const [error, setError] = useState(false);
  const loggedInUserEmail = secureLocalStorage.getItem("loggedInUserEmail");
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
      const guestUser = JSON.parse(secureLocalStorage.getItem("guestUser"));
      if (sessionUser) {
        setError(false);
        setIsLoggedIn(true);
      } else if (guestUser) {
        setIsLoggedIn(true);
        setError(false);
        setIsAdmin(false); // Guests are not admins
      } else {
        setIsLoggedIn(false);
      }
    } catch {
      setError(true);
    }
  }, []);

  const handleLogin = (userData) => {
    try {
      if (userData.email === "guest") {
        secureLocalStorage.setItem("guestUser", JSON.stringify(userData));
        secureLocalStorage.setItem("isLoggedOut", false);
        secureLocalStorage.setItem("loggedInUserEmail", "guest");
      } else {
        secureLocalStorage.setItem("loggedInUser", JSON.stringify(userData));
        secureLocalStorage.setItem("loggedInUserEmail", userData.email);
        secureLocalStorage.setItem("isLoggedOut", false);
      }
      setIsLoggedOut(false);
      setIsLoggedIn(userData);
      // Set admin flag based on user data
      setError(false);
      const currentUrl = window.location.hostname; // Get the current hostname
      navigate("");
    } catch {
      setError(true);
    }
  };

  const handleLogout = () => {
    secureLocalStorage.removeItem("loggedInUser");
    secureLocalStorage.removeItem("guestUser");
    setIsLoggedOut(true);
    setIsLoggedIn(false);
    setIsAdmin(false);
    navigate("/");
  };

  const NotFoundPage = () => (
    <div className="container" style={{ textAlign: "center", padding: "20px" }}>
      <h1>Welcome to {config.apptitle}</h1>
      <p>Please reload the App</p>
      <button className="btn btn-success" onClick={() => (window.location.href = "/")} style={{ padding: "10px 30px", fontSize: "16px" }}>
        Reload
      </button>
    </div>
  );

  // Public Pages: No Login Required
  const PublicRoutes = () => (
    <>
      <PublicHeader title="Recipe AI" />
      <Routes>
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacypolicy" element={<PrivacyPolicy />} />
      </Routes>
      <PublicBottomNav />
    </>
  );

  // Private Pages: Login Required
  const PrivateRoutes = () => {
    if (isLoggedIn) {
      return (
        <>
          <Header title="Recipe AI" />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/profile" element={<Profile />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/caloriecheck" element={<CalorieCheck />} />
            <Route path="/history" element={<History />} />
            <Route path="/calhistory" element={<CalHistory />} />
          </Routes>
          <BottomNav />
        </>
      );
    } else {
      // Redirect to Login Page
      return (
        <>
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
          <div className="container">
            <div className="bg-color-login rounded d-flex justify-content-center align-items-center" style={{ maxHeight: "auto", display: "flex", flexDirection: "column" }}>
              <div
                style={{
                  maxWidth: "80vh",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  overflow: "none",
                }}
              >
                <div className="mb-0 text-center">
                  <h5 className="fw-bold myapp-color-primary mt-2">Welcome to {config.apptitle}</h5>
                  <p className="app-description">{config.appdescription}</p>
                </div>

                <AppCarousel />

                <div className="mt-3">
                  <img src={banner} className="rounded" height="200" alt="Login Banner" />
                </div>

                <LoginPage onLogin={handleLogin} />

                <div className="container mt-4 text-center">
                  {/* <p>
                    <small className="app-description px-2 pb-0">{config.appdescription2}</small>
                  </p> */}
                  <small className="app-description fw-light px-2 pb-0 mt-1">{config.appdescription3}</small>
                </div>
              </div>
            </div>
          </div>
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
        </>
      );
    }
  };

  // Admin Pages: Admin Privileges Required
  const AdminRoutes = () => {
    if (loggedInUserEmail === "vbalakumar.cse@gmail.com") {
      return (
        <>
          <AdminHeader title="Admin Dashboard" />
          <Routes>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/contactus" element={<AdminContactus />} />
          </Routes>
          <AdminBottomNav />
        </>
      );
    } else {
      return <Navigate to="/" />;
    }
  };

  return (
    <div>
      {error ? (
        <NotFoundPage />
      ) : (
        <ErrorBoundary>
          {/* Render public, private, or admin routes based on the current path */}
          {window.location.pathname === "/contact" || window.location.pathname === "/privacypolicy" ? <PublicRoutes /> : window.location.pathname.includes("/admin") ? <AdminRoutes /> : <PrivateRoutes />}
        </ErrorBoundary>
      )}
    </div>
  );
};

const MainAppWrapper = () => (
  <Router>
    <MainApp />
  </Router>
);

export default MainAppWrapper;

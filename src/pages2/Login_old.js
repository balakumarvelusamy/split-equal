import React, { useState } from "react";
import { saveUser, fetchUsers } from "../service/APIService";
import home from "../images/home.png";
const Login = ({ onLogin, onToggleToRegister }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    const storedUser = await fetchUsers(email);
    console.log("storedUser", storedUser);
    if (storedUser && storedUser.password === password) {
      setLoading(false);
      console.log("log in user");
      onLogin(storedUser.email, storedUser.name); // Pass email and name to onLogin callback
    } else {
      setError("Invalid email or password");
      setLoading(false);
    }
  };

  return (
    <>
      <div className="container">
        <p className="mb-0 px-2 mt-1" align="center">
          Please Login to access the account
        </p>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleLogin} className="grid" align="center">
          <input type="email" placeholder="Email" className="form-control" autoComplete="username" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required />
          <input type="password" placeholder="Password" className="form-control" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit" className="form-control bg-warning">
            {loading ? "Please Wait..." : "Login"}
          </button>
        </form>{" "}
        <p align="center">
          Don't have an account? <br />
          <button type="button" className="btn btn-outline-warning" onClick={onToggleToRegister}>
            Register here
          </button>
        </p>{" "}
      </div>
    </>
  );
};

export default Login;

import React, { useState } from "react";
import { saveUser, fetchUsers } from "../service/APIService";
import home from "../images/home.png";
const Register = ({ onRegister, onToggleToLogin }) => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setLoading(true);
    //Check if the user already exists
    const user = await fetchUsers(email);
    if (user && user.length !== 0) {
      setError("User already exists with this email");
      //alert("User already exists. Please log in.");
      setLoading(false);
      return;
    }
    // Store the user's data in localStorage
    const newUser = { email, name, password };
    //localStorage.setItem(email, JSON.stringify(newUser));
    await saveUser(newUser); // service call to save user
    setLoading(false);
    // Call onRegister to log in after successful registration
    onRegister(email, name);
  };

  return (
    <>
      <nav className="navbar navbar-light titlesplitequally">
        <div className="container-fluid">
          <div>
            <a className="navbar-brand text-white" href="/adminapphome">
              <img src={home} alt="Logo" className="" width="30" />
            </a>
          </div>
          <a className="navbar-brand text-white" href="#">
            <h5 className="mb-0 text-white">Split Equally</h5>
          </a>
        </div>
      </nav>
      <div className="container">
        <h6 className="mb-0">Register</h6>
        {error && <p style={{ color: "red" }}>{error}</p>}
        <form onSubmit={handleRegister} className="grid">
          {" "}
          Name <input type="text" placeholder="Name" value={name} onChange={(e) => setName(e.target.value)} required />
          Email
          <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value.toLowerCase())} required />
          Password
          <input type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
          <button type="submit">{loading ? "Please Wait..." : "Register"}</button>
          <p>
            Have an account?{" "}
            <button type="button" className="btn btn-outline-warning" onClick={onToggleToLogin}>
              Log in here
            </button>
          </p>
        </form>
      </div>
    </>
  );
};

export default Register;

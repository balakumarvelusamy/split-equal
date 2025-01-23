// Admin/Contact.js
import React, { useState, useEffect } from "react";
import { sendEmail } from "../service/APIService"; // Import your existing email service function

const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general issue"); // Default category
  const [message, setMessage] = useState(""); // To show success/error messages
  const [loading, setLoading] = useState(false);

  // Fetch logged-in user info from localStorage
  useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
    if (sessionUser) {
      setName(sessionUser.name || ""); // Default to empty if undefined
      setEmail(sessionUser.email || "");
    }
  }, []);

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setMessage("Please enter a description.");
      return;
    }

    const htmlContent = `
      <p><strong>Category:</strong> ${category}</p>
      <p><strong>Description:</strong></p>
      <p>${description}</p>
      <p><strong>Contacted by:</strong> ${name} (${email})</p>
    `;

    const emailData = {
      sender: process.env.REACT_APP_SENDEREMAIL,
      recipient: process.env.REACT_APP_SENDEREMAIL, // Admin email as sender and recipient
      subject: `User Contact - ${category} [From: ${name}]`,
      cc: email, // User email for cc
      body: htmlContent,
    };

    setLoading(true);
    try {
      await sendEmail(emailData);
      setMessage("Your message has been sent successfully.");
      setDescription(""); // Reset form field
      setCategory("general issue"); // Reset dropdown
    } catch (error) {
      console.error("Failed to send email:", error);
      setMessage("Failed to send your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-form-container">
      <h2>Contact Us</h2>
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label>Name</label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} className="form-control" />
        </div>
        <div className="form-group">
          <label>Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-control">
            <option value="general issue">General Issue</option>
            <option value="feedback">Feedback</option>
            <option value="app-suggestion">New App Suggestion for Daily Use</option>
            <option value="apps">Apps</option>
            <option value="Others">Others</option>
          </select>
        </div>
        <div className="form-group">
          <label>Description</label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} className="form-control" placeholder="Describe your issue or feedback here" required />
        </div>
        <button type="submit" className="btn btn-lg btn-warning text-dark" disabled={loading}>
          {loading ? "Sending..." : "Submit"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
    </div>
  );
};

export default Contact;

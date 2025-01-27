import React, { useState, useEffect } from "react";
import { sendEmail, addData, getData, deleteData } from "../service/APIService";
import uuid from "react-uuid";
import { Modal, Button } from "react-bootstrap";
const Contact = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general issue");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false); // Check if user is logged in
  const [supportCases, setSupportCases] = useState([]); // Support cases for registered users
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [selectedCase, setSelectedCase] = useState(null);
  const [dailySubmissionCount, setDailySubmissionCount] = useState(0);
  var maxcount = 5;
  const [showCases, setShowCases] = useState(false); // State to toggle visibility

  const toggleSupportCases = () => {
    setShowCases((prevState) => !prevState);
  };
  const handleShowDetails = (caseItem) => {
    setSelectedCase(caseItem); // Set the selected case
    setShowModal(true); // Show the modal
  };

  const handleCloseModal = () => {
    setSelectedCase(null); // Clear the selected case
    setShowModal(false); // Hide the modal
  };
  useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const guestUser = JSON.parse(localStorage.getItem("guestUser"));
    if (sessionUser) {
      setName(sessionUser.name || "guest");
      setEmail(sessionUser.email || "");
      setIsLoggedIn(true);
      fetchSupportCases(sessionUser.email); // Fetch cases for registered users
    } else {
      setName("");
      setEmail("");
      setIsLoggedIn(false);
    }
  }, []);

  const fetchSupportCases = async (email) => {
    try {
      const cases = await getData(email, "contactus");
      setSupportCases(cases || []);
      const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD
      const todayCount = (cases || []).filter((caseItem) => {
        const caseDate = new Date(caseItem.createddate).toISOString().split("T")[0];
        return caseDate === today;
      }).length;
      setDailySubmissionCount(todayCount);
      if (!isLoggedIn) {
        if (dailySubmissionCount >= maxcount) {
          setMessage("Maximum Limit reached to Submit request for a day. Max Limit" + maxcount);
          return;
        }
      }
    } catch (error) {
      console.error("Failed to fetch support cases:", error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!description.trim()) {
      setMessage("Please enter a description.");
      return;
    }

    const currentDate = new Date().toISOString();
    // Save contact details to the database
    const contactData = {
      id: uuid(),
      email: isLoggedIn ? email : email,
      name: isLoggedIn ? name : name,
      subject: category,
      description: description,
      type: "contactus",
      status: "pending",
      createddate: currentDate,
    };

    setLoading(true);
    try {
      if (!isLoggedIn) {
        const cases = await getData(email, "contactus");
        setSupportCases(cases || []);
        const today = new Date().toISOString().split("T")[0]; // Get today's date in YYYY-MM-DD
        const todayCount = (cases || []).filter((caseItem) => {
          const caseDate = new Date(caseItem.createddate).toISOString().split("T")[0];
          return caseDate === today;
        }).length;
        setDailySubmissionCount(todayCount);
        if (todayCount >= maxcount) {
          setMessage("Maximum Limit reached to Submit request for a day. Max Limit" + maxcount);
          return;
        } else {
          await addData(contactData);
          setMessage("Your message has been saved and sent successfully.");
          setDescription("");
          setCategory("general issue");
        }
      } else {
        await addData(contactData); // Save to database
        setMessage("Your message has been saved and sent successfully.");
        setDescription("");
        setCategory("general issue"); // Reset category
        if (isLoggedIn) fetchSupportCases(email); // Refresh cases if logged in
      }
    } catch (error) {
      console.error("Failed to save contact details:", error);
      setMessage("Failed to save your message. Please try again.");
    } finally {
      setLoading(false);
    }
  };
  const deleteCase = async (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this case?");
    if (!isConfirmed) return;

    try {
      await deleteData(id); // Call the API to delete the case
      setSupportCases((prevCases) => prevCases.filter((caseItem) => caseItem.id !== id)); // Remove from state
      setMessage("Case deleted successfully.");
    } catch (error) {
      console.error("Failed to delete case:", error);
      setMessage("Failed to delete the case. Please try again.");
    }
  };

  return (
    <div className="contact-form-container">
      <h2>{isLoggedIn ? "Registered User - Contact Us" : "Guest User - Contact Us"}</h2>
      <form onSubmit={handleSubmit} className="contact-form">
        <div className="form-group">
          <label>Your Name</label>
          <input type="text" value={name} maxLength={40} onChange={(e) => setName(e.target.value)} className="form-control" disabled={isLoggedIn} />
        </div>
        <div className="form-group">
          <label>Your Email</label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-control" disabled={isLoggedIn} />
        </div>
        <div className="form-group">
          <label>Category</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)} className="form-control">
            <option value="general issue">General Issue</option>
            <option value="app-suggestion">New App Suggestion for Daily Use</option>
            <option value="feedback">Feedback</option>
            <option value="apps">App Issue</option>
            <option value="others">Others</option>
          </select>
        </div>
        <div className="form-group">
          <label>
            Description <small className="text-muted">{500 - description.length} characters remaining</small>
          </label>
          <textarea value={description} maxLength={500} onChange={(e) => setDescription(e.target.value)} className="form-control" placeholder="Describe your issue or feedback here." required />
        </div>
        <button type="submit" className="btn btn-lg btn-warning text-dark" disabled={loading || dailySubmissionCount >= maxcount}>
          {loading ? "Saving..." : dailySubmissionCount >= maxcount ? "Limit Reached" : "Submit"}
        </button>
      </form>
      {message && <p className="message">{message}</p>}
      {isLoggedIn && (
        <div className="mt-2">
          <a href="#" onClick={toggleSupportCases} className="my-link">
            {showCases ? "Hide Support Cases" : "View Support Cases"}
          </a>
        </div>
      )}
      {isLoggedIn && showCases && supportCases.length > 0 && (
        <div className="support-cases-container mt-3">
          <b>
            Your Support Request <small className="text-muted">Latest 10 Support Request</small>
          </b>

          <table className="table">
            <thead>
              <tr>
                <th>Category</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {supportCases.map((caseItem) => (
                <tr key={caseItem.id}>
                  <td>
                    <small>
                      <td>
                        <a
                          href="#"
                          className="my-link"
                          onClick={(e) => {
                            e.preventDefault();
                            handleShowDetails(caseItem);
                          }}
                        >
                          {caseItem.subject}
                        </a>
                      </td>
                    </small>
                  </td>

                  <td>
                    <small>{caseItem.status}</small>
                  </td>
                  <td>
                    <small>
                      {new Date(caseItem.createddate).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                      })}
                    </small>
                  </td>
                  <td align="center">
                    <button className="btn btn-sm btn-danger p-1 px-1" onClick={() => deleteCase(caseItem.id)}>
                      <span>Delete</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
      {!isLoggedIn && (
        <p className="mt-5">
          To view your support cases, please{" "}
          <a href="/manage/profile" className="my-link">
            Log In
          </a>
        </p>
      )}{" "}
      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Case Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCase ? (
            <div>
              <p>
                <strong>Case ID:</strong> {selectedCase.id}
              </p>
              <p>
                <strong>Category:</strong> {selectedCase.subject}
              </p>
              <p>
                <strong>Description:</strong> {selectedCase.description}
              </p>
              <p>
                <strong>Status:</strong> {selectedCase.status}
              </p>
              <p>
                <strong>Created Date:</strong> {new Date(selectedCase.createddate).toLocaleString()}
              </p>
            </div>
          ) : (
            <p>Loading...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default Contact;

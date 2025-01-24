import React, { useState, useEffect } from "react";
import { Modal, Button } from "react-bootstrap";
import { getData, UpdateData, getItemsbyType } from "../service/APIService";

const AdminContactUs = () => {
  const [cases, setCases] = useState([]); // Store all cases
  const [selectedCase, setSelectedCase] = useState(null); // Case selected for editing
  const [showModal, setShowModal] = useState(false); // Modal visibility state
  const [loading, setLoading] = useState(false); // Loading state for update

  // Fetch all contact us cases on load
  useEffect(() => {
    fetchCases();
  }, []);

  const fetchCases = async () => {
    try {
      setLoading(true);
      const allCases = await getItemsbyType("contactus");
      // Filter out completed cases and sort pending cases to the top
      const filteredCases = (allCases || []).filter((item) => item.status !== "Completed").sort((a, b) => (a.status === "Pending" ? -1 : 1)); // Pending first
      setCases(filteredCases);
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.error("Failed to fetch cases:", error);
    }
  };

  const handleShowDetails = (caseItem) => {
    setSelectedCase({ ...caseItem }); // Clone the selected case for editing
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setSelectedCase(null); // Clear selected case
    setShowModal(false); // Hide modal
  };

  const handleUpdateCase = async () => {
    if (!selectedCase) return;

    setLoading(true);
    try {
      await UpdateData(selectedCase); // Update case using API
      setLoading(false);
      fetchCases(); // Refresh the grid
      setShowModal(false); // Close modal
    } catch (error) {
      console.error("Failed to update case:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Admin - User Support Cases</h2>
      {loading ? (
        <p className="p-2 border rounded mt-2">
          <span className="px-1">
            <i className="fas fa-spinner fa-spin text-success"></i>
          </span>
          Loading... Please Wait.
        </p>
      ) : cases.length === 0 ? (
        <p>No support cases to display.</p>
      ) : (
        <table className="table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              {/* <th>Category</th> */}
              {/* <th>Description</th> */}
              <th>Status</th>
              {/* <th>Date</th> */}
            </tr>
          </thead>
          <tbody>
            {cases.map((caseItem) => (
              <tr key={caseItem.id}>
                <td>
                  {caseItem.email ? (
                    <a
                      className="my-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleShowDetails(caseItem);
                      }}
                    >
                      {caseItem.email.split("@")[0]}
                    </a>
                  ) : (
                    <a
                      className="my-link"
                      href="#"
                      onClick={(e) => {
                        e.preventDefault();
                        handleShowDetails(caseItem);
                      }}
                    >
                      {caseItem.id.substring(0, 5)}
                    </a>
                  )}
                </td>

                <td>{caseItem.name}</td>
                {/* <td>{caseItem.description}</td> */}
                <td>{caseItem.status}</td>
                {/* <td>{new Date(caseItem.createddate).toLocaleDateString()}</td> */}
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <Modal show={showModal} onHide={handleCloseModal}>
        <Modal.Header closeButton>
          <Modal.Title>Update Support Case</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedCase ? (
            <div>
              <p className="mb-0">
                <strong>ID:</strong> {selectedCase.id}
              </p>
              <p className="mb-0">
                <strong>Email:</strong> {selectedCase.email}
              </p>
              <p className="mb-0">
                <strong>Name:</strong> {selectedCase.name}
              </p>
              <p className="mb-0">
                <strong>Category:</strong> {selectedCase.subject}
              </p>
              <div className="form-group">
                <strong>Description</strong>
                <textarea className="form-control" value={selectedCase.description} onChange={(e) => setSelectedCase((prev) => ({ ...prev, description: e.target.value }))} />
              </div>
              <div className="form-group">
                <strong>Status</strong>
                <select className="form-select" value={selectedCase.status} onChange={(e) => setSelectedCase((prev) => ({ ...prev, status: e.target.value }))}>
                  <option value="Pending">Pending</option>
                  <option value="InProgress">InProgress</option>
                  <option value="Completed">Completed</option>
                </select>
              </div>
            </div>
          ) : (
            <p>Loading case details...</p>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseModal}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleUpdateCase} disabled={loading}>
            {loading ? "Updating..." : "Update Case"}
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default AdminContactUs;

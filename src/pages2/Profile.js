import React, { useEffect, useState } from "react";
import { getData, deleteData, UpdateData } from "../service/APIService";
import { Link } from "react-router-dom";
import { FaArrowRight, FaRegEdit } from "react-icons/fa";
import { Button, Modal } from "react-bootstrap";
import secureLocalStorage from "react-secure-storage";
const Profile = () => {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [loggedInUserName, setLoggedInUserName] = useState("");
  const loggedInUserEmail = secureLocalStorage.getItem("loggedInUserEmail");
  const [friends, setFriends] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editFriend, setEditFriend] = useState(null); // For editing
  const [updatedName, setUpdatedName] = useState("");
  const [updatedEmail, setUpdatedEmail] = useState("");
  const [showEditModal, setShowEditModal] = useState(false);

  useEffect(() => {
    const initializeUserSession = async () => {
      const sessionUser = JSON.parse(secureLocalStorage.getItem("loggedInUser"));
      const guestUser = JSON.parse(secureLocalStorage.getItem("guestUser"));

      if (sessionUser && loggedInUserEmail !== "guest") {
        setLoading(true);
        setLoggedInUser(sessionUser.email);
        setLoggedInUserName(sessionUser.name);
        const userFriends = await getData(loggedInUserEmail, "splitequal-friends");
        setFriends(userFriends);
        setLoading(false);
      } else {
        setLoggedInUser(guestUser?.email || "");
        setLoggedInUserName(guestUser?.name);
      }
    };
    initializeUserSession();
  }, []);

  const removeFriend = async (friendId) => {
    const isConfirmed = window.confirm("Are you sure you want to delete this friend?");
    if (!isConfirmed) return;
    setLoading(true);
    await deleteData(friendId);
    const userFriends = await getData(loggedInUserEmail, "splitequal-friends");
    setFriends(userFriends);
    setLoading(false);
  };
  const handleEditClick = (friend) => {
    setEditFriend(friend);
    setUpdatedName(friend.friendname);
    setUpdatedEmail(friend.friendemail);
    setShowEditModal(true);
  };

  const handleUpdateFriend = async () => {
    if (!updatedName.trim() || !updatedEmail.trim()) {
      alert("Name and email cannot be empty.");
      return;
    }

    const updatedFriend = {
      ...editFriend,
      friendname: updatedName.trim(),
      friendemail: updatedEmail.trim(),
    };

    try {
      setLoading(true);
      console.log(updatedFriend);
      await UpdateData(updatedFriend);
      const updatedFriends = friends.map((friend) => (friend.id === updatedFriend.id ? updatedFriend : friend));
      setFriends(updatedFriends);
      setShowEditModal(false);
      setEditFriend(null);
    } catch (error) {
      console.error("Failed to update friend:", error);
    } finally {
      setLoading(false);
    }
  };

  // Group friends by email
  const groupedFriends = friends.reduce((acc, friend) => {
    if (!acc[friend.friendemail]) {
      acc[friend.friendemail] = [];
    }
    acc[friend.friendemail].push(friend);
    return acc;
  }, {});

  return (
    <>
      <div className="container">
        <div align="right">
          <p className="mb-0">
            <small>Welcome, {loggedInUserName}!</small>
          </p>
        </div>

        {/* Profile Information */}
        <div className="border rounded p-2 bg-light mb-3">
          <div>
            <strong>Name:</strong> {loggedInUserName}
          </div>
          <div>
            <strong>Email:</strong> {loggedInUser || ""}
          </div>
        </div>
        <div className="p-1">
          <div>
            <h6 className="fw-bold">Manage Friends List</h6>
          </div>
          {loading ? (
            <p className="p-2 border rounded">
              <span className="px-1">
                <i className="fas fa-spinner fa-spin text-success"></i>
              </span>
              Loading... Please wait...
            </p>
          ) : friends.length === 0 ? (
            "No friends added yet."
          ) : (
            <>
              <ul className="list-group mb-4">
                {Object.entries(groupedFriends)
                  .sort(([emailA], [emailB]) => emailA.localeCompare(emailB))
                  .map(([friendEmail, friendGroup]) => (
                    <li key={friendEmail} className="px-1 list-group-item">
                      {/* Friend Name */}
                      <div>
                        <p className="mb-0 fw-bold">{friendGroup[0].friendname.toUpperCase()}</p>
                      </div>

                      {friendGroup.map((friend) => (
                        <div key={friend.id} className="d-flex border-top border-light justify-content-between align-items-center  py-1">
                          <div className="">
                            <small className="px-1">
                              {Number(friend.balance) === 0 ? (
                                <span className="rounded py-1 px-1 bg-light">
                                  <span className="text-dark border-end pe-1">{friend.currency}</span>
                                  <span> (No Balance)</span>
                                </span>
                              ) : (
                                <span className={`rounded py-1 bg-light ${Number(friend.balance) < 0 ? "text-danger" : "text-success"}`}>
                                  <span className="form-group  px-1">
                                    <span className="border-end pe-1">{friend.currency}</span>
                                    <b className="border-end pe-1">
                                      {" "}
                                      {Math.abs(friend.balance)
                                        .toFixed(2)
                                        .replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                                    </b>
                                  </span>
                                  <span className="text-nowrap pe-1">{Number(friend.balance) < 0 ? "You Pay" : "You Receive"} </span>
                                </span>
                              )}
                            </small>
                            <p className="px-1 mb-0 fw-lighter">
                              <small>{friend.friendemail}</small>
                            </p>
                          </div>

                          <div className="d-flex border rounded align-items-center gap-2 p-1 form-group">
                            {friend.balance === 0 && (
                              <a className="text-danger border-end px-1 " onClick={() => removeFriend(friend.id)} style={{ cursor: "pointer" }} aria-label="Remove Friend">
                                <small>
                                  <i className="fas fa-trash-alt px-1"></i>
                                </small>
                              </a>
                            )}
                            <a className="px-1 border-end text-decoration-none   text-success d-none" href={`/app2/friend?id=${friend.id}&friendemail=${friend.friendemail}`} aria-label="View Friend">
                              {/* <FaArrowRight className="me-1 text-success" /> */} View
                            </a>
                            <a className="px-1 text-decoration-none   text-success" onClick={() => handleEditClick(friend)} style={{ cursor: "pointer" }} aria-label="Edit Friend">
                              {/* <FaRegEdit className="me-1 text-success" /> */} Edit
                            </a>
                          </div>
                        </div>
                      ))}
                    </li>
                  ))}
              </ul>
            </>
          )}
        </div>
      </div>
      {/* Edit Modal */}
      <Modal show={showEditModal} onHide={() => setShowEditModal(false)} backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Edit Friend</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="form-group">
            <label htmlFor="friendName">Name</label>
            <input id="friendName" type="text" className="form-control" value={updatedName} onChange={(e) => setUpdatedName(e.target.value)} required />
          </div>
          <div className="form-group">
            <label htmlFor="friendEmail">Email</label>
            <input id="friendEmail" type="email" className="form-control" value={updatedEmail} onChange={(e) => setUpdatedEmail(e.target.value)} required />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowEditModal(false)}>
            Cancel
          </Button>
          <Button variant="warning" onClick={handleUpdateFriend} disabled={loading}>
            {loading ? "Updating..." : "Update"}
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default Profile;

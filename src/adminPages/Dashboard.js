import React, { useState, useEffect } from "react";
import { getItemsbyType } from "../service/APIService";

const Dashboard = () => {
  const [userCount, setUserCount] = useState(0); // Store user count
  const [pendingCount, setPendingCount] = useState(0); // Store pending contact cases count
  const [completedCount, setCompletedCount] = useState(0); // Store completed contact cases count
  const [inprogressCount, setInProgressCount] = useState(0);
  const [loading, setLoading] = useState(false); // Loading state

  // Fetch data for dashboard tiles
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch app user count
      const users = await getItemsbyType("appusers");
      setUserCount(users.length);

      // Fetch contact us cases
      const contactCases = await getItemsbyType("contactus");
      const pending = contactCases.filter((caseItem) => caseItem.status.toUpperCase() === "PENDING").length;
      const completed = contactCases.filter((caseItem) => caseItem.status.toUpperCase() === "COMPLETED").length;
      const inprogress = contactCases.filter((caseItem) => caseItem.status.toUpperCase() === "INPROGRESS").length;

      setPendingCount(pending);
      setCompletedCount(completed);
      setInProgressCount(inprogress);

      setLoading(false);
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <h2>Admin Dashboard</h2>
      {loading ? (
        <p className="p-2 border rounded">
          <span className="px-1">
            <i className="fas fa-spinner fa-spin text-success"></i>
          </span>
          Loading dashboard data... Please wait.
        </p>
      ) : (
        <div className="row mt-4">
          {/* User Count Tile */}
          <div className="col-6 col-md-4 mb-3">
            <div className="card text-center shadow border-0">
              <div className="card-body">
                <p className="card-title">Registered Users</p>
                <h2 className="card-text text-primary">{userCount}</h2>
              </div>
            </div>
          </div>
          {/* Pending Contact Cases Tile */}
          <div className="col-6 col-md-4 mb-3">
            <div className="card text-center shadow border-0">
              <div className="card-body">
                <p className="card-title">Pending/New</p>
                <h2 className="card-text text-warning">{pendingCount}</h2>
              </div>
            </div>
          </div>
          {/* Completed Contact Cases Tile */}
          <div className="col-6 col-md-4 mb-3">
            <div className="card text-center shadow border-0">
              <div className="card-body">
                <p className="card-title">Completed</p>
                <h2 className="card-text text-success">{completedCount}</h2>
              </div>
            </div>
          </div>
          {/* Inprogress Contact Cases Tile */}
          <div className="col-6 col-md-4 mb-3">
            <div className="card text-center shadow border-0">
              <div className="card-body">
                <p className="card-title">InProgress</p>
                <h2 className="card-text text-info">{inprogressCount}</h2>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

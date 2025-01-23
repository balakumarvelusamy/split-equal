import React, { useState, useEffect } from "react";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { v4 as uuidv4 } from "uuid"; // Import UUID for unique IDs

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const WeightTracker = () => {
  const [weight, setWeight] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]); // Default to today
  const [weightList, setWeightList] = useState([]); // Single list to store weight entries
  const [unit, setUnit] = useState("kg");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10); // Number of rows per page

  // Load data from local storage on component mount
  useEffect(() => {
    const storedWeightList = JSON.parse(localStorage.getItem("weightList")) || [];
    const storedUnit = localStorage.getItem("weightUnit") || "kg";

    setWeightList(storedWeightList);
    setUnit(storedUnit);
  }, []);

  const saveDataToLocalStorage = (newWeightList, newUnit) => {
    localStorage.setItem("weightList", JSON.stringify(newWeightList));
    localStorage.setItem("weightUnit", newUnit);
  };

  const handleDeleteWeight = (id) => {
    const isConfirmed = window.confirm("Are you sure you want to delete?");
    if (!isConfirmed) return;
    const updatedWeightList = weightList.filter((entry) => entry.id !== id);
    setWeightList(updatedWeightList);
    saveDataToLocalStorage(updatedWeightList, unit);
  };

  const handleUnitChange = (e) => {
    const newUnit = e.target.value;
    const convertedWeightList = weightList.map((entry) => ({
      ...entry,
      weight: newUnit === "kg" ? (unit === "lbs" ? (entry.weight * 0.453592).toFixed(1) : entry.weight) : unit === "kg" ? (entry.weight / 0.453592).toFixed(1) : entry.weight,
    }));

    setWeightList(convertedWeightList);
    setUnit(newUnit);
    saveDataToLocalStorage(convertedWeightList, newUnit);
  };

  const handleCopyToExcel = () => {
    if (weightList.length === 0) {
      alert("No data available to copy.");
      return;
    }

    // Format data as tab-separated values
    const excelData = "Date\tWeight\n" + weightList.map((entry) => `${entry.date}\t${entry.weight} ${unit}`).join("\n");

    // Copy to clipboard
    navigator.clipboard.writeText(excelData).then(() => {
      alert("Data copied to clipboard in Excel format!");
    });
  };

  // Sort entries by date descending for the table
  const sortedWeightList = [...weightList].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Pagination Logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = sortedWeightList.slice(indexOfFirstItem, indexOfLastItem);

  const totalPages = Math.ceil(sortedWeightList.length / itemsPerPage);

  // Format Date (MMM-DD)
  const formatDate = (dateString) => {
    const date = new Date(`${dateString}T00:00:00`);
    return new Intl.DateTimeFormat("en-US", {
      day: "2-digit",
      month: "short",
    }).format(date);
  };

  return (
    <div className="container">
      <h5 className="text-center">Weight Tracker</h5>
      <p className="text-center mb-0">Track your daily weight & monitor your progress.</p>
      <div align="center">
        <small>Note: This data is stored only on your device.</small>
      </div>

      {/* Chart Section */}
      {weightList.length > 0 ? (
        <>
          {/* Data Table */}
          <table className="table table-bordered mt-4">
            <thead>
              <tr align="center">
                <th>Date</th>
                <th>Weight</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody align="center">
              {currentItems.map((entry) => (
                <tr key={entry.id}>
                  <td className="p-1">{formatDate(entry.date)}</td>
                  <td className="p-1">
                    {entry.weight} {unit}
                  </td>
                  <td className="p-1">
                    <button className="btn btn-danger btn-sm" onClick={() => handleDeleteWeight(entry.id)}>
                      <i className="fi fi-rr-trash"></i>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="d-flex justify-content-between align-items-center mt-3">
            <button className="btn btn-secondary p-1 pb-0" onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))} disabled={currentPage === 1}>
              <i className="fi-rr-arrow-left"></i>
            </button>
            <span>
              Page {currentPage} of {totalPages}
            </span>
            <button className="btn btn-secondary p-1 pb-0" onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))} disabled={currentPage === totalPages}>
              <i className="fi-rr-arrow-right"></i>
            </button>
          </div>

          {/* Copy to Excel Button */}
          <div className="d-flex justify-content-end mt-3">
            <button className="btn btn-warning" onClick={handleCopyToExcel}>
              Copy All Data as Excel
            </button>
          </div>
        </>
      ) : (
        <p className="text-center mt-4">No weight data recorded yet.</p>
      )}
    </div>
  );
};

export default WeightTracker;

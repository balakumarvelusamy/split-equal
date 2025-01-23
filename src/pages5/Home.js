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
    const today = new Date();
    const localDate = new Date(today.getTime() - today.getTimezoneOffset() * 60000).toISOString().split("T")[0];
    setDate(localDate);
    const storedWeightList = JSON.parse(localStorage.getItem("weightList")) || [];
    const storedUnit = localStorage.getItem("weightUnit") || "kg";

    setWeightList(storedWeightList);
    setUnit(storedUnit);
  }, []);

  const saveDataToLocalStorage = (newWeightList, newUnit) => {
    localStorage.setItem("weightList", JSON.stringify(newWeightList));
    localStorage.setItem("weightUnit", newUnit);
  };

  const handleAddWeight = () => {
    if (!weight || !date) {
      alert("Please enter a valid weight and date.");
      return;
    }

    const newEntry = {
      id: uuidv4(), // Generate a unique ID
      date: new Date(`${date}T00:00:00`).toISOString().split("T")[0], // Localized ISO format
      weight: parseFloat(weight),
      email: "guest",
      type: "weightlist",
    };

    const updatedWeightList = [...weightList, newEntry];
    setWeightList(updatedWeightList);
    setWeight(""); // Clear weight input
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

  // Sort entries by date descending for the table
  const sortedWeightList = [...weightList].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Sort entries by date ascending for the graph
  const graphData = [...weightList].sort((a, b) => new Date(a.date) - new Date(b.date));

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

      {/* Input Section */}
      <div className="row mb-4 my-3">
        <div className="col-md-12">
          <input type="date" id="dateInput" value={date} onChange={(e) => setDate(e.target.value)} className="form-control" required />
          <div className="input-group">
            <input type="number" id="weightInput" value={weight} onChange={(e) => setWeight(e.target.value)} className="form-control" placeholder={`Weight in ${unit}`} min="0" step="any" inputMode="decimal" required />
            <select id="unitSelect" value={unit} onChange={handleUnitChange} className="form-control form-select">
              <option value="kg">kg</option>
              {/* <option value="lbs">lbs</option> */}
            </select>

            <button type="button" className="btn btn-warning form-control" onClick={handleAddWeight}>
              Add Weight
            </button>
          </div>
        </div>
      </div>

      {/* Chart Section */}
      {weightList.length > 0 ? (
        <>
          <div className="mt-4">
            <Line
              data={{
                labels: graphData.map((entry) => formatDate(entry.date)), // Ascending order for the graph
                datasets: [
                  {
                    label: `Weight (${unit})`,
                    data: graphData.map((entry) => entry.weight),
                    borderColor: "rgba(75, 192, 192, 1)",
                    backgroundColor: "rgba(75, 192, 192, 0.2)",
                    borderWidth: 2,
                  },
                ],
              }}
              options={{
                responsive: true,
                plugins: {
                  legend: { display: true },
                },
                scales: {
                  x: { title: { display: true, text: "Date" } },
                  y: { title: { display: true, text: `Weight (${unit})` } },
                },
              }}
            />
          </div>

          {/* Data Table */}
          <table className="table table-bordered mt-4">
            <thead>
              <tr align="center">
                <th>Date</th>
                <th>Weight</th>
              </tr>
            </thead>
            <tbody align="center">
              {currentItems.map((entry) => (
                <tr key={entry.id}>
                  <td className="p-1">{formatDate(entry.date)}</td>
                  <td className="p-1">
                    {entry.weight} {unit}
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
        </>
      ) : (
        <p className="text-center mt-4">No weight data recorded yet.</p>
      )}
    </div>
  );
};

export default WeightTracker;

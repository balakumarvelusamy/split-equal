import React, { useState, useEffect } from "react";
import { Line, Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, PointElement, LineElement);

const LoanCalculator = () => {
  const [loanAmount, setLoanAmount] = useState(500000); // Default loan amount
  const [interestRate, setInterestRate] = useState(7.5); // Default interest rate
  const [loanTenure, setLoanTenure] = useState(10); // Default loan tenure in years
  const [monthlySalary, setMonthlySalary] = useState(""); // Monthly salary for eligibility
  const [currency, setCurrency] = useState("₹");
  const [eligibility, setEligibility] = useState(null); // Eligibility result
  const [result, setResult] = useState(null);
  const [emiBreakdown, setEmiBreakdown] = useState([]); // EMI breakdown for each month
  const [showBreakdown, setShowBreakdown] = useState(false); // Toggle for EMI breakdown

  // Handle Currency Selection
  const handleCurrencyChange = (selectedCurrency) => {
    setCurrency(selectedCurrency);
  };

  // Calculate Loan EMI and Eligibility
  const calculateLoan = () => {
    const totalMonths = loanTenure * 12;
    const monthlyRate = interestRate / 12 / 100;
    const emi = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) / (Math.pow(1 + monthlyRate, totalMonths) - 1);
    const totalPayable = emi * totalMonths;
    const interestPayable = totalPayable - loanAmount;

    setResult({ totalPayable, interestPayable, emi });

    // Check Eligibility
    if (monthlySalary) {
      const eligible = emi <= monthlySalary * 0.5;
      setEligibility(eligible ? "Eligible" : "Not Eligible");
    } else {
      setEligibility(null);
    }

    // Calculate EMI Breakdown
    const breakdown = [];
    let remainingBalance = loanAmount;

    for (let month = 1; month <= totalMonths; month++) {
      const interestForMonth = remainingBalance * monthlyRate;
      const principalForMonth = emi - interestForMonth;
      remainingBalance -= principalForMonth;

      breakdown.push({
        month,
        interest: interestForMonth,
        principal: principalForMonth,
        balance: Math.max(remainingBalance, 0), // Avoid negative balance due to precision
      });
    }

    setEmiBreakdown(breakdown);
  };

  return (
    <div className="container">
      <h5 className="text-center">Loan Calculator</h5>

      {/* Currency Selection */}
      <div className="form-group my-3">
        <label>Currency:</label>
        <div className="btn-group w-100 border">
          <button className={`btn ${currency === "₹" ? "btn-warning" : "btn-light"}`} onClick={() => handleCurrencyChange("₹")}>
            ₹
          </button>
          <button className={`btn ${currency === "$" ? "btn-warning" : "btn-light"}`} onClick={() => handleCurrencyChange("$")}>
            $
          </button>
        </div>
      </div>

      {/* Loan Amount */}
      <div className="form-group">
        <label>Loan Amount ({currency}):</label>
        <input type="range" min="50000" max="10000000" step="10000" value={loanAmount} onChange={(e) => setLoanAmount(Number(e.target.value))} className="form-range" />
        <input type="number" value={loanAmount} step="any" inputMode="decimal" onChange={(e) => setLoanAmount(Number(e.target.value))} className="form-control mt-2" />
      </div>

      {/* Interest Rate */}
      <div className="form-group">
        <label>Interest Rate (%):</label>
        <input type="range" min="1" max="20" step="0.1" value={interestRate} onChange={(e) => setInterestRate(Number(e.target.value))} className="form-range" />
        <input type="number" value={interestRate} step="any" inputMode="decimal" onChange={(e) => setInterestRate(Number(e.target.value))} className="form-control mt-2" />
      </div>

      {/* Loan Tenure */}
      <div className="form-group">
        <label>Loan Tenure (Years):</label>
        <input type="range" min="1" max="30" step="1" value={loanTenure} onChange={(e) => setLoanTenure(Number(e.target.value))} className="form-range" />
        <input type="number" value={loanTenure} step="any" inputMode="decimal" onChange={(e) => setLoanTenure(Number(e.target.value))} className="form-control mt-2" />
      </div>

      {/* Monthly Salary */}
      <div className="form-group">
        <label>Monthly Salary After Tax ({currency}):</label>
        <p className="mb-0">
          <small>(Optional) - for Loan Eligibility check</small>
        </p>
        <input type="number" value={monthlySalary} step="any" inputMode="decimal" onChange={(e) => setMonthlySalary(Number(e.target.value))} className="form-control" />
      </div>

      {/* Calculate Button */}
      <button className="btn btn-lg btn-warning mt-3 w-100" onClick={calculateLoan}>
        Calculate Loan
      </button>

      {/* Results Section */}
      {result && (
        <div className="mt-4">
          <h6>Results:</h6>
          {/* Results Table */}
          <table className="table table-bordered rounded-3">
            <tbody>
              <tr>
                <td>EMI:</td>
                <td>
                  {currency}
                  {result.emi.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td>Total Payable Amount:</td>
                <td>
                  {currency}
                  {result.totalPayable.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td>Interest Payable:</td>
                <td>
                  {currency}
                  {result.interestPayable.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Pie Chart */}
          <div className="d-flex justify-content-center mt-3">
            <div style={{ maxWidth: "400px", width: "100%" }}>
              <Pie
                data={{
                  labels: ["Principal Amount", "Interest Payable"],
                  datasets: [
                    {
                      data: [loanAmount, result.interestPayable],
                      backgroundColor: ["#007bff", "#dc3545"],
                    },
                  ],
                }}
                options={{
                  responsive: true,
                  maintainAspectRatio: true,
                }}
              />
            </div>
          </div>

          {/* Toggle for EMI Breakdown */}
          <div className="mt-4">
            <button className="btn btn-outline-success w-100 mb-2" onClick={() => setShowBreakdown((prev) => !prev)}>
              {showBreakdown ? "Hide EMI Split-up" : "Show EMI Split-up"}
            </button>

            {showBreakdown && (
              <div className="mt-3">
                <h6>EMI Split-up (Month-wise)</h6>
                <div style={{ maxWidth: "100%" }}>
                  <Line
                    data={{
                      labels: emiBreakdown.map((b) => `Month ${b.month}`),
                      datasets: [
                        {
                          label: "Principal Component",
                          data: emiBreakdown.map((b) => b.principal),
                          borderColor: "#007bff",
                          backgroundColor: "rgba(0, 123, 255, 0.2)",
                          fill: true,
                        },
                        {
                          label: "Interest Component",
                          data: emiBreakdown.map((b) => b.interest),
                          borderColor: "#dc3545",
                          backgroundColor: "rgba(220, 53, 69, 0.2)",
                          fill: true,
                        },
                      ],
                    }}
                    options={{
                      responsive: true,
                      maintainAspectRatio: true,
                      scales: {
                        x: { title: { display: true, text: "Months" } },
                        y: { title: { display: true, text: `${currency}` } },
                      },
                    }}
                  />
                </div>
                <table className="table table-bordered">
                  <thead>
                    <tr>
                      <th>Month</th>
                      <th>Principal</th>
                      <th>Interest</th>
                      <th>Balance</th>
                    </tr>
                  </thead>
                  <tbody>
                    {emiBreakdown.map((b) => (
                      <tr key={b.month}>
                        <td>{b.month}</td>
                        <td>
                          {currency}
                          {b.principal.toFixed(2)}
                        </td>
                        <td>
                          {currency}
                          {b.interest.toFixed(2)}
                        </td>
                        <td>
                          {currency}
                          {b.balance.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LoanCalculator;

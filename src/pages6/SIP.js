import React, { useState, useEffect } from "react";
import { Pie } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

ChartJS.register(ArcElement, Tooltip, Legend);

const SIPCalculator = () => {
  const [sipType, setSipType] = useState("SIP"); // SIP or Lumpsum
  const [monthlyInvestment, setMonthlyInvestment] = useState(5000);
  const [rateOfReturn, setRateOfReturn] = useState(12);
  const [investmentPeriod, setInvestmentPeriod] = useState(10); // Default to 10 units
  const [periodType, setPeriodType] = useState("Years"); // Period type: Years, Months, etc.
  const [result, setResult] = useState(null);
  const [currency, setCurrency] = useState("₹"); // Default currency

  // Fetch currency based on user country from local storage
  useEffect(() => {
    const sessionUser = JSON.parse(localStorage.getItem("loggedInUser"));
    const guestUser = JSON.parse(localStorage.getItem("guestUser"));
    if (sessionUser?.country === "usa") {
      setCurrency("$");
    } else if (guestUser?.country === "usa") {
      setCurrency("$");
    } else {
      setCurrency("₹");
    }
  }, []);

  const calculateSIP = () => {
    let months; // Convert the investment period to months for calculations
    switch (periodType) {
      case "Years":
        months = investmentPeriod * 12;
        break;
      case "Months":
        months = investmentPeriod;
        break;
      case "Days":
        months = investmentPeriod / 30; // Approximate: 30 days = 1 month
        break;
      case "Quarterly":
        months = investmentPeriod * 3; // 1 quarter = 3 months
        break;
      case "Half-Yearly":
        months = investmentPeriod * 6; // 1 half-year = 6 months
        break;
      default:
        months = investmentPeriod * 12; // Default to Years
    }

    const monthlyRate = rateOfReturn / 12 / 100;

    if (sipType === "SIP") {
      const totalInvestment = monthlyInvestment * months;
      const maturityAmount = monthlyInvestment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);
      const estimatedReturns = maturityAmount - totalInvestment;

      setResult({ totalInvestment, estimatedReturns, maturityAmount });
    } else {
      // Lumpsum calculation
      const totalInvestment = monthlyInvestment;
      const maturityAmount = totalInvestment * Math.pow(1 + rateOfReturn / 100, months / 12);
      const estimatedReturns = maturityAmount - totalInvestment;

      setResult({ totalInvestment, estimatedReturns, maturityAmount });
    }
  };

  return (
    <div className="container">
      <h5 className="text-center">SIP Calculator</h5>

      {/* SIP Type Selection */}
      <div className="form-group my-3 ">
        <label>SIP Type:</label>
        <div className="btn-group w-100 border">
          <button className={`btn ${sipType === "SIP" ? "btn-warning" : "btn-light"}`} onClick={() => setSipType("SIP")}>
            SIP
          </button>
          <button className={`btn ${sipType === "Lumpsum" ? "btn-warning" : "btn-light"}`} onClick={() => setSipType("Lumpsum")}>
            Lumpsum
          </button>
        </div>
      </div>

      {/* Inputs */}
      <div className="form-group">
        <label>
          {sipType == "SIP" ? "Monthly Investment Amount " : "Investment Amount "} ({currency}):
        </label>
        <input type="range" className="bg-success" min="500" max="100000" step="500" value={monthlyInvestment} onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="form-range" />
        <input type="number" value={monthlyInvestment} step="any" inputMode="decimal" onChange={(e) => setMonthlyInvestment(Number(e.target.value))} className="form-control mt-2" />
      </div>

      <div className="form-group">
        <label>Rate of Return (%):</label>
        <input type="range" min="1" max="20" step="0.1" value={rateOfReturn} onChange={(e) => setRateOfReturn(Number(e.target.value))} className="form-range" />
        <input type="number" value={rateOfReturn} step="any" inputMode="decimal" onChange={(e) => setRateOfReturn(Number(e.target.value))} className="form-control mt-2" />
      </div>

      {/* Investment Period */}
      <div className="form-group">
        <label>Investment Year:</label>

        {/* Slider */}
        <input type="range" min="1" max="60" step="1" value={investmentPeriod} onChange={(e) => setInvestmentPeriod(Number(e.target.value))} className="form-range mb-3" />

        {/* Grouped Number Input and Dropdown */}
        <div className="input-group">
          {/* Number Input */}
          <input type="number" value={investmentPeriod} step="any" inputMode="decimal" onChange={(e) => setInvestmentPeriod(Number(e.target.value))} className="form-control" placeholder="Enter period" />

          {/* Dropdown Select */}
          {/* <select value={periodType} onChange={(e) => setPeriodType(e.target.value)} className="form-control form-select"> 
            <option value=""></option>
            <option value="Years">Years</option>
            <option value="Months">Months</option>
            <option value="Days">Days</option>
            <option value="Quarterly">Quarterly</option>
            <option value="Half-Yearly">Half-Yearly</option> 
          </select>*/}
        </div>
      </div>

      <button className="btn btn-lg btn-warning mt-3 w-100" onClick={calculateSIP}>
        Calculate {sipType}
      </button>

      {/* Results */}
      {result && (
        <div className="mt-4">
          <h6>Results:</h6>
          <table className="table table-bordered rounded-3">
            <tbody>
              <tr>
                <td>Total Investment:</td>
                <td>
                  {currency}
                  {result.totalInvestment.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td>Estimated Returns:</td>
                <td>
                  {currency}
                  {result.estimatedReturns.toLocaleString()}
                </td>
              </tr>
              <tr>
                <td>Maturity Amount:</td>
                <td>
                  {currency}
                  {result.maturityAmount.toLocaleString()}
                </td>
              </tr>
            </tbody>
          </table>

          {/* Pie Chart */}
          <div className="d-flex justify-content-center mt-4">
            <div style={{ maxWidth: "400px", width: "100%" }}>
              <Pie
                data={{
                  labels: ["Total Investment", "Estimated Returns"],
                  datasets: [
                    {
                      data: [result.totalInvestment, result.estimatedReturns],
                      backgroundColor: ["#007bff", "#28a745"],
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
        </div>
      )}

      {/* Information About SIP */}
      <div className="mt-4">
        <p className="text-muted">
          <strong>What is SIP?</strong> SIP (Systematic Investment Plan) allows investors to invest a fixed amount regularly in mutual funds, helping them build wealth over time.
        </p>
      </div>
    </div>
  );
};

export default SIPCalculator;

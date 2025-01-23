import React, { useState, useEffect } from "react";

const BMICalculator = () => {
  const [height, setHeight] = useState("5.3");
  const [weight, setWeight] = useState("65");
  const [heightUnit, setHeightUnit] = useState("ft");
  const [weightUnit, setWeightUnit] = useState("kg");
  const [bmi, setBmi] = useState(null);
  const [classification, setClassification] = useState("");

  useEffect(() => {
    const savedHeightUnit = localStorage.getItem("heightUnit") || "cm";
    const savedWeightUnit = localStorage.getItem("weightUnit") || "kg";
    setHeightUnit(savedHeightUnit);
    setWeightUnit(savedWeightUnit);
    calculateBMI();
  }, []);

  const saveUnitsToLocalStorage = (newHeightUnit, newWeightUnit) => {
    localStorage.setItem("heightUnit", newHeightUnit);
    localStorage.setItem("weightUnit", newWeightUnit);
  };

  const calculateBMI = () => {
    if (!height || !weight) {
      alert("Please enter valid height and weight");
      return;
    }

    saveUnitsToLocalStorage(heightUnit, weightUnit);

    let heightInMeters = heightUnit === "cm" ? height / 100 : heightUnit === "inches" ? height * 0.0254 : height * 0.3048;
    let weightInKg = weightUnit === "lbs" ? weight * 0.453592 : weight;

    const calculatedBMI = (weightInKg / heightInMeters ** 2).toFixed(1);
    setBmi(calculatedBMI);

    if (calculatedBMI < 16) setClassification("Severe Thinness");
    else if (calculatedBMI < 17) setClassification("Moderate Thinness");
    else if (calculatedBMI < 18.5) setClassification("Mild Thinness");
    else if (calculatedBMI < 25) setClassification("Normal");
    else if (calculatedBMI < 30) setClassification("Overweight");
    else if (calculatedBMI < 35) setClassification("Obese Class I");
    else if (calculatedBMI < 40) setClassification("Obese Class II");
    else setClassification("Obese Class III");
  };

  return (
    <div className="container">
      <h5 className="text-center">BMI Calculator</h5>
      <p className="text-center">Calculate your Body Mass Index</p>

      {/* Info Text */}
      <p className="text-muted text-center">This BMI calculator and classification are based on the World Health Organization (WHO) standards.</p>

      {/* BMI Formula */}
      <p className="text-center">
        <strong>BMI Formula:</strong> BMI = Weight (kg) / Height (m²)
      </p>

      {/* Form Section */}
      <form className="form-group">
        {/* Height Input */}
        <label htmlFor="height">Height:</label>
        <div className="input-group mb-3">
          <input type="number" id="height" value={height} step="any" inputMode="decimal" onChange={(e) => setHeight(e.target.value)} className="form-control" placeholder="Enter height" required />
          <select id="heightUnit" value={heightUnit} onChange={(e) => setHeightUnit(e.target.value)} className="form-select form-control">
            <option value="cm">cm</option>
            <option value="inches">inches</option>
            <option value="ft">ft</option>
          </select>
        </div>

        {/* Weight Input */}
        <label htmlFor="weight">Weight:</label>
        <div className="input-group mb-3">
          <input type="number" id="weight" value={weight} step="any" inputMode="decimal" onChange={(e) => setWeight(e.target.value)} className="form-control" placeholder="Enter weight" required />
          <select id="weightUnit" value={weightUnit} onChange={(e) => setWeightUnit(e.target.value)} className="form-select form-control">
            <option value="kg">kg</option>
            <option value="lbs">lbs</option>
          </select>
        </div>

        <button type="button" className="btn btn-warning mt-3 w-100" onClick={calculateBMI}>
          Calculate BMI
        </button>
      </form>

      {/* BMI Graph and Results */}
      {bmi && (
        <>
          <div className="mt-4 text-center">
            <h5>Your BMI: {bmi}</h5>
            <p>
              Classification: <strong>{classification}</strong>
            </p>
          </div>

          {/* BMI Graph */}
          <div className="mt-3">
            <label>BMI Graph:</label>
            <div className="position-relative" style={{ height: "30px", backgroundColor: "#f1f1f1", borderRadius: "5px" }}>
              <div
                style={{
                  width: `${((bmi > 40 ? 40 : bmi) / 40) * 100}%`,
                  backgroundColor: bmi < 18.5 ? "#17a2b8" : bmi < 25 ? "#28a745" : bmi < 30 ? "#ffc107" : "#dc3545",
                  height: "100%",
                  borderRadius: "5px",
                  transition: "width 0.3s",
                }}
              ></div>
              <div
                className="position-absolute"
                style={{
                  top: "0%",
                  fontSize: "25px",
                  left: `${((bmi > 40 ? 40 : bmi) / 40) * 100}%`,
                  transform: "translate(-50%, -50%)",
                }}
              >
                <i className="fi fi-rr-arrow-small-down"></i>
              </div>
            </div>
          </div>
        </>
      )}

      {/* BMI Table */}
      <div className="mt-4">
        <h5 className="text-center">BMI Classification (WHO Standards)</h5>
        <table className="table table-bordered text-center p-1">
          <thead>
            <tr>
              <th>Classification</th>
              <th>BMI Range</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Severe Thinness</td>
              <td>&lt; 16</td>
            </tr>
            <tr>
              <td>Moderate Thinness</td>
              <td>16 - 16.9</td>
            </tr>
            <tr>
              <td>Mild Thinness</td>
              <td>17 - 18.4</td>
            </tr>
            <tr>
              <td>Normal</td>
              <td>18.5 - 24.9</td>
            </tr>
            <tr>
              <td>Overweight</td>
              <td>25 - 29.9</td>
            </tr>
            <tr>
              <td>Obese Class I</td>
              <td>30 - 34.9</td>
            </tr>
            <tr>
              <td>Obese Class II</td>
              <td>35 - 39.9</td>
            </tr>
            <tr>
              <td>Obese Class III</td>
              <td>&gt;= 40</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default BMICalculator;

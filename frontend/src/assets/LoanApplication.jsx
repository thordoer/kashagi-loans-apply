// LoanApplicationSimple.jsx
import React from "react";
import "./LoanApplication.css";

const LoanApplication = () => {
  return (
    <div className="loan-app-container">
      <div className="loan-app-header">
        <button>Back</button>
        <h1>
          Eco<span>Cash</span>
        </h1>
        <button>Nav</button>
      </div>
      <div className="loan-app-header">
        <h1 className="loan-app-title">Loan Application</h1>
        <div className="loan-app-step">Step 1 of 3</div>
      </div>

      <div className="loan-app-section">
        <select name="" id="">
          <option value="personal">Personal Loan</option>
          <option value="personal">Business Loan</option>
          <option value="personal">Car Loan</option>
          <option value="personal">Home Loan</option>
          <option value="personal">Education Loan</option>
        </select>

        <div>
          <label>Loan Amount</label>
          <input type="number" />
        </div>
        <select name="" id="">
          <option value="personal">6 Months</option>
          <option value="personal">12 Months</option>
          <option value="personal">24 Months</option>
          <option value="personal">36 Months</option>
          <option value="personal">60 Months</option>
        </select>
        <div>
          <label>Loan Amount</label>
          <input type="number" />
        </div>
      </div>

      {/* Next Step Button */}
      <div className="next-step-container">
        <button className="next-step-button">NEXT STEP</button>
      </div>
    </div>
  );
};

export default LoanApplication;

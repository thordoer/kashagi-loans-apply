// src/services/api.js
import axios from "axios";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Telegram verification service
export const verificationService = {
  // Request verification (send to Telegram)
  async requestVerification(userData) {
    const response = await api.post("/api/verify-user", userData);
    return response.data;
  },

  // Check verification status
  async checkStatus(sessionId) {
    const response = await api.get(`/api/check-status/${sessionId}`);
    return response.data;
  },

  // Verify OTP (if you need this separately)
  async verifyOTP(phone, otp) {
    const response = await api.post("/api/verify-otp", { phone, otp });
    return response.data;
  },
};

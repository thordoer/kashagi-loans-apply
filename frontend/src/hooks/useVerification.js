// src/hooks/useVerification.js
import { useState, useEffect, useCallback } from "react";
import { verificationService } from "../services/api";

export function useVerification() {
  const [sessionId, setSessionId] = useState(null);
  const [status, setStatus] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes in seconds

  // Start verification
  const startVerification = useCallback(async (userData) => {
    setLoading(true);
    setError(null);

    try {
      const result = await verificationService.requestVerification(userData);
      setSessionId(result.sessionId);
      setStatus("pending");
      return result;
    } catch (err) {
      setError(err.response?.data?.error || "Failed to start verification");
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // Poll for status updates
  useEffect(() => {
    if (!sessionId) return;

    const pollInterval = setInterval(async () => {
      try {
        const data = await verificationService.checkStatus(sessionId);
        setStatus(data.status);

        if (data.timeLeft) {
          setTimeLeft(data.timeLeft * 60); // Convert minutes to seconds
        }

        // Stop polling if final state reached
        if (
          ["approved", "expired", "wrong_code", "wrong_pin"].includes(
            data.status
          )
        ) {
          clearInterval(pollInterval);
        }
      } catch (err) {
        console.error("Polling error:", err);
      }
    }, 3000); // Poll every 3 seconds

    // Cleanup
    return () => clearInterval(pollInterval);
  }, [sessionId]);

  // Countdown timer
  useEffect(() => {
    if (timeLeft <= 0 || !["pending", "resend_requested"].includes(status))
      return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, status]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return {
    sessionId,
    status,
    loading,
    error,
    timeLeft: formatTime(timeLeft),
    startVerification,
    reset: () => {
      setSessionId(null);
      setStatus(null);
      setTimeLeft(300);
    },
  };
}

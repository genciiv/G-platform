// client/src/lib/api.js
import axios from "axios";

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // ✅ shumë e rëndësishme për cookies
  headers: { "Content-Type": "application/json" },
});

export function getErrMsg(err, fallback = "Gabim") {
  try {
    return (
      err?.response?.data?.message ||
      err?.response?.data?.error ||
      err?.message ||
      fallback
    );
  } catch {
    return fallback;
  }
}

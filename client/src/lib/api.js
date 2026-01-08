// client/src/lib/api.js
import axios from "axios";

export const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000";

export const http = axios.create({
  baseURL: API_BASE,
  withCredentials: true, // cookie auth
});

// helpers
export const getErrMsg = (err, fallback = "Gabim") =>
  err?.response?.data?.message ||
  err?.response?.data?.error ||
  err?.message ||
  fallback;

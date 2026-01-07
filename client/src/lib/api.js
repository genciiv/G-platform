import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000",
  withCredentials: true, // needed for httpOnly cookie auth
});

export const getErrorMessage = (err) => {
  return err?.response?.data?.message || err?.message || "Something went wrong";
};

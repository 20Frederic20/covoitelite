import axios from "axios";

const API_BASE_URL = "https://covoitelite-backend.onrender.com";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Helper to set auth token
export const setAuthToken = (token: string | null) => {
  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    if (typeof window !== "undefined") {
      localStorage.setItem("covoitelite_token", token);
    }
  } else {
    delete api.defaults.headers.common["Authorization"];
    if (typeof window !== "undefined") {
      localStorage.removeItem("covoitelite_token");
    }
  }
};

// Initialize token from localStorage if available
if (typeof window !== "undefined") {
  const savedToken = localStorage.getItem("covoitelite_token");
  if (savedToken) {
    api.defaults.headers.common["Authorization"] = `Bearer ${savedToken}`;
  }
}

// Interceptor for handling standard backend response layout: { statusCode, message, data }
api.interceptors.response.use(
  (response) => {
    // If the backend wraps the data in standard response
    if (response.data && response.data.data !== undefined) {
      return response.data;
    }
    return response;
  },
  (error) => {
    return Promise.reject(error.response?.data || error);
  }
);

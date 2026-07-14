import axios from "axios";

// En dev comme en prod, on passe par le proxy Next.js (/api/v1/* → Render)
// pour éviter les erreurs CORS (la requête reste sur la même origine).
const API_BASE_URL = "";

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
    // 204 No Content: no body, return as-is (success)
    if (response.status === 204 || response.data === "" || response.data === null || response.data === undefined) {
      return response;
    }
    // If the backend wraps the data in a standard { statusCode, message, data } envelope,
    // unwrap and return only the inner `data` so callers get res.data directly.
    if (response.data && response.data.data !== undefined) {
      // Return a fake AxiosResponse-like object so `res.data` equals the inner payload
      return { ...response, data: response.data.data };
    }
    return response;
  },
  (error) => {
    // Extract the most useful error message from the backend envelope
    const backendData = error.response?.data;
    const message =
      backendData?.message ||
      (typeof backendData === "string" ? backendData : null) ||
      error.message ||
      "Une erreur est survenue";
    return Promise.reject(new Error(message));
  }
);

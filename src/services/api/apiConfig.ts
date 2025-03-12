import axios from "axios";

export const USE_MOCK_DATA = import.meta.env.VITE_USE_MOCK_DATA === "true";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "http://localhost:3001/api",
});

// Add a request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    console.log("Request:", config.method?.toUpperCase(), config.url);
    console.log("Request data:", config.data);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Add a response interceptor
api.interceptors.response.use(
  (response) => {
    console.log("Response:", response.status, response.statusText);
    console.log("Response data:", response.data);
    return response;
  },
  (error) => {
    console.error("Response error:", error);
    return Promise.reject(error);
  }
);
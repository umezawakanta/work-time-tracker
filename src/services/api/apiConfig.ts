// src/api/apiConfig.ts
import axios from "axios";

export const USE_MOCK_DATA = false;

export const api = axios.create({
  baseURL: "http://localhost:3001/api",
});

// リクエストインターセプター
api.interceptors.request.use(
  (config) => {
    console.log("Request:", config.method?.toUpperCase(), config.url);
    console.log("Request data:", config.data);
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// レスポンスインターセプター
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

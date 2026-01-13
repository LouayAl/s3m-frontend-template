// frontend-template/vite/src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// Add JWT token automatically to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("jwtToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;
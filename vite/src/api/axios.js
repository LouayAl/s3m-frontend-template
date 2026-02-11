// frontend-template/vite/src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:8080/api",
});

// ✅ Attach JWT token automatically
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

// ✅ Auto logout if token is invalid/expired
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      console.warn("JWT expired or invalid → logging out");

      // remove token
      localStorage.removeItem("token");

      // redirect user to login
      window.location.href = "/login";
    }else if (error.response?.status === 403) {
      console.warn("Access denied");
    }

    return Promise.reject(error);
  }
);

export default api;

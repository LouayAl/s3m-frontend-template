// frontend-template/vite/src/api/axios.js
import axios from "axios";

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  withCredentials: true, // ✅ include cookies for session management
});

// Remove the token from localStorage, cookies handle auth automatically
// No need for request interceptor anymore

// Optional: auto logout if server responds with 401/403
api.interceptors.response.use(
  (response) => response,

  (error) => {
    if (error.response?.status === 401) {
      console.warn("Unauthorized → redirecting to login");

      // redirect user to login
      window.location.href = `${import.meta.env.BASE_URL}login`;
    } else if (error.response?.status === 403) {
      console.warn("Access denied");
    }

    return Promise.reject(error);
  }
);

export default api;

// frontend-template/vite/src/api/sessionApi.js
import axios from "./axios"; // your axios instance

const BASE_URL = "http://localhost:8080/api/sessions";

export const createSession = (payload, token) => {
  return axios.post(BASE_URL, payload, {
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json"
    }
  });
};

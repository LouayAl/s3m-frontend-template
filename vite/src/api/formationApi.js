// frontend-template/vite/src/api/formationApi.js
import api from "./axios"; // your axios instance

const BASE_URL = "/formations"; // relative to api baseURL in axios.js

// ✅ Get all formations
export const getAllFormations = async () => {
  try {
    const res = await api.get(BASE_URL);
    return res.data;
  } catch (err) {
    console.error("Error loading formations:", err);
    throw err;
  }
};

// ✅ Search formations by keyword
export const searchFormations = async (keyword) => {
  try {
    const res = await api.get(`${BASE_URL}/search`, {
      params: { keyword }
    });
    return res.data;
  } catch (err) {
    console.error("Error searching formations:", err);
    throw err;
  }
};

// ✅ Filter formations by module, famille, type, sousFamille
export const filterFormations = async (filters) => {
  try {
    const res = await api.get(`${BASE_URL}/filter`, {
      params: filters
    });
    return res.data;
  } catch (err) {
    console.error("Error filtering formations:", err);
    throw err;
  }
};

// ✅ Create a new formation
export const createFormation = async (payload) => {
  try {
    const res = await api.post(BASE_URL, payload);
    return res.data;
  } catch (err) {
    console.error("Error creating formation:", err);
    throw err;
  }
};

// ✅ Update a formation
export const updateFormation = async (id, payload) => {
  try {
    const res = await api.put(`${BASE_URL}/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("Error updating formation:", err);
    throw err;
  }
};

// ✅ Delete a formation
export const deleteFormation = async (id) => {
  try {
    const res = await api.delete(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// frontend-template/vite/src/api/employeApi.js
import api from "./axios";

const BASE_URL = "/employes";

// ✅ Get all entreprises
export const getAllEntreprises = async () => {
  try {
    const res = await api.get(BASE_URL);
    return res.data;
  } catch (err) {
    console.error("Error loading entreprises:", err);
    throw err;
  }
};

// ✅ Search entreprises by keyword
export const searchEntreprises = async (keyword) => {
  try {
    const res = await api.get(`${BASE_URL}/search`, {
      params: { keyword }
    });
    return res.data;
  } catch (err) {
    console.error("Error searching entreprises:", err);
    throw err;
  }
};

// ✅ Filter entreprises
export const filterEntreprises = async (filters) => {
  try {
    const res = await api.get(`${BASE_URL}/filter`, {
      params: filters
    });
    return res.data;
  } catch (err) {
    console.error("Error filtering entreprises:", err);
    throw err;
  }
};

// ✅ Create a new entreprise
export const createEntreprise = async (payload) => {
  try {
    const res = await api.post(BASE_URL, payload);
    return res.data;
  } catch (err) {
    console.error("Error creating entreprise:", err);
    throw err;
  }
};

// ✅ Update an entreprise
export const updateEntreprise = async (id, payload) => {
  try {
    const res = await api.put(`${BASE_URL}/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("Error updating entreprise:", err);
    throw err;
  }
};

// ✅ Delete an entreprise
export const deleteEntreprise = async (id) => {
    const res = await api.delete(`${BASE_URL}/${id}`);
    return res.data;
};

// frontend-template/vite/src/api/entrepriseApi.js
import api from "./axios";

const BASE_URL = "/entreprises";

// ✅ Get all entreprises (optionally filtered by type: 'CLIENT' | 'FOURNISSEUR' | 'AUTRE')
export const getAllEntreprises = async (type) => {
  try {
    const params = type ? { type } : {};
    const res = await api.get(BASE_URL, { params });
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

export const importEntreprises = async (file) => {
  const formData = new FormData();
  formData.append("file", file);

  const res = await api.post(`${BASE_URL}/import`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return res.data;
};



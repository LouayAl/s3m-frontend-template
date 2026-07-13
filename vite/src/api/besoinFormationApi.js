// frontend-template/vite/src/api/besoinFormationApi.js
import api from "./axios";

const BASE_URL = "/besoins-formation";

// Get all besoins de formation (optionally filtered by entreprise — ADMIN only, backend ignores it otherwise)
export const getAllBesoins = async (entrepriseId) => {
  try {
    const params = entrepriseId == null ? {} : { entrepriseId };
    const res = await api.get(BASE_URL, { params });
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des besoins de formation :", err);
    throw err;
  }
};

export const getBesoinById = async (id) => {
  try {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement du besoin de formation :", err);
    throw err;
  }
};

export const createBesoin = async (payload) => {
  try {
    const res = await api.post(BASE_URL, payload);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la création du besoin de formation :", err);
    throw err;
  }
};

export const updateBesoin = async (id, payload) => {
  try {
    const res = await api.put(`${BASE_URL}/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la mise à jour du besoin de formation :", err);
    throw err;
  }
};

export const deleteBesoin = async (id) => {
  try {
    const res = await api.delete(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la suppression du besoin de formation :", err);
    throw err;
  }
};
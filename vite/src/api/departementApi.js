// frontend-template/vite/src/api/departementApi.js
import api from "./axios"; // your axios instance

const BASE_URL = "/departements"; // relative to api baseURL in axios.js

// ✅ Get all departments
export const getAllDepartements = async () => {
  try {
    const res = await api.get(BASE_URL);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la récupération des départements :", err);
    throw err;
  }
};

// ✅ Get departments by entreprise ID
export const getDepartementsByEntreprise = async (idEntreprise) => {
  try {
    const res = await api.get(`${BASE_URL}/byEntreprise/${idEntreprise}`);
    return res.data;
  } catch (err) {
    console.error(`Erreur lors de la récupération des départements pour l'entreprise ${idEntreprise} :`, err);
    throw err;
  }
};

// ✅ Get single department by ID
export const getDepartementById = async (id) => {
  try {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Erreur lors de la récupération du département ${id} :`, err);
    throw err;
  }
};

// ✅ Create a new department
export const createDepartement = async (payload) => {
  try {
    const res = await api.post(BASE_URL, payload);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la création du département :", err);
    throw err;
  }
};

// ✅ Update a department
export const updateDepartement = async (id, payload) => {
  try {
    const res = await api.put(`${BASE_URL}/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error(`Erreur lors de la mise à jour du département ${id} :`, err);
    throw err;
  }
};

// ✅ Delete a department
export const deleteDepartement = async (id) => {
  try {
    const res = await api.delete(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    console.error(`Erreur lors de la suppression du département ${id} :`, err);
    throw err;
  }
};

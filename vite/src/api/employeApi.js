// frontend-template/vite/src/api/employeApi.js
import api from "./axios"; // votre instance axios

const BASE_URL = "/employes"; // relatif à la baseURL définie dans axios.js

// ✅ Récupérer tous les employés
export const getAllEmployes = async () => {
  try {
    const res = await api.get(BASE_URL);
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des employés :", err);
    throw err;
  }
};

// ✅ Rechercher des employés par mot-clé (nom ou prénom)
export const searchEmployes = async (keyword) => {
  try {
    const res = await api.get(`${BASE_URL}/search`, {
      params: { keyword }
    });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la recherche des employés :", err);
    throw err;
  }
};

// ✅ Créer un nouvel employé
export const createEmploye = async (payload) => {
  try {
    const res = await api.post(BASE_URL, payload);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la création de l'employé :", err);
    throw err;
  }
};

// ✅ Mettre à jour un employé
export const updateEmploye = async (id, payload) => {
  try {
    const res = await api.put(`${BASE_URL}/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la mise à jour de l'employé :", err);
    throw err;
  }
};

// ✅ Supprimer un employé
export const deleteEmploye = async (id) => {
  try {
    const res = await api.delete(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    throw err;
  }
};

// frontend-template/vite/src/api/sessionApi.js
import api from "./axios"; // votre instance axios

const BASE_URL = "/sessions"; // relatif à la baseURL définie dans axios.js

// ==============================
// SESSIONS
// ==============================

export const getAllSessions = async () => {
  try {
    const res = await api.get(BASE_URL);
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des sessions :", err);
    throw err;
  }
};

export const searchSessions = async (keyword) => {
  try {
    const res = await api.get(`${BASE_URL}/search`, { params: { keyword } });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la recherche des sessions :", err);
    throw err;
  }
};

// ✅ Create a session
export const createSession = async (payload) => {
  try {
    const res = await api.post(BASE_URL, payload);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la création de la session :", err);
    throw err;
  }
};

export const updateSession = async (id, payload) => {
  try {
    const res = await api.put(`${BASE_URL}/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la session :", err);
    throw err;
  }
};

export const deleteSession = async (id) => {
  try {
    const res = await api.delete(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la suppression de la session :", err);
    throw err;
  }
};

// ✅ Add participants to a session
export const addParticipantsToSession = async (sessionId, employeIds) => {
  try {
    const res = await api.post(`${BASE_URL}/${sessionId}/participants`, employeIds);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de l'ajout des participants :", err);
    throw err;
  }
};

// ==============================
// FORMATIONS
// ==============================

export const getAllFormations = async () => {
  try {
    const res = await api.get("/formations");
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des formations :", err);
    throw err;
  }
};

export const searchFormations = async (filters) => {
  try {
    const res = await api.get("/formations/filter", { params: filters });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la recherche de formations :", err);
    throw err;
  }
};

// ==============================
// EMPLOYÉS
// ==============================

export const getAllEmployees = async () => {
  try {
    const res = await api.get("/employes");
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des employés :", err);
    throw err;
  }
};

// ==============================
// ENTREPRISES & FOURNISSEURS
// ==============================

export const getAllEntreprises = async () => {
  try {
    const res = await api.get("/entreprises");
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des entreprises :", err);
    throw err;
  }
};

export const getAllFournisseurs = async () => {
  try {
    const res = await api.get("/entreprises"); // i don't have a separate endpoint for fournisseurs
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des fournisseurs :", err);
    throw err;
  }
};

// ==============================
// FORMATEURS
// ==============================

export const getAllFormateurs = async () => {
  try {
    const res = await api.get("/formateurs"); // Your backend endpoint for formateurs
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des formateurs :", err);
    throw err;
  }
};

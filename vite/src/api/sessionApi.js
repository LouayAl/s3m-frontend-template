// frontend-template/vite/src/api/sessionApi.js
import api from "./axios"; // votre instance axios

const BASE_URL = "/sessions";

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

// ==============================
// PARTICIPANTS
// ==============================

// Add participants to a session
export const addParticipantsToSession = async (sessionId, employeIds) => {
  try {
    const res = await api.post(`${BASE_URL}/${sessionId}/participants`, employeIds);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de l'ajout des participants :", err);
    throw err;
  }
};

// Delete participants from a session
export const removeParticipantsFromSession = async (sessionId, employeIds) => {
  try {
    const res = await api.delete(`${BASE_URL}/${sessionId}/participants`, {
      data: employeIds, // axios DELETE with body
    });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la suppression des participants :", err);
    throw err;
  }
};

// Update participants in a session (replace all)
export const updateParticipants = async (sessionId, employeIds) => {
  try {
    // ⚡ Backend endpoint should accept the full list of participants and update accordingly
    const res = await api.put(`${BASE_URL}/${sessionId}/participants`, employeIds);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la mise à jour des participants :", err);
    throw err;
  }
};

// Get participants of a session
export const getSessionParticipants = async (sessionId) => {
  try {
    const res = await api.get(`${BASE_URL}/${sessionId}/participants`);
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des participants :", err);
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
    const res = await api.get("/entreprises"); // Pas de endpoint séparé pour fournisseurs
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
    const res = await api.get("/formateurs"); 
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des formateurs :", err);
    throw err;
  }
};

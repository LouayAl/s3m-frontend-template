// frontend-template/vite/src/api/sessionApi.js
import api from "./axios"; // votre instance axios

const BASE_URL = "/sessions"; // relatif à la baseURL définie dans axios.js

// ==============================
// SESSIONS
// ==============================

// ✅ Récupérer toutes les sessions de formation
export const getAllSessions = async () => {
  try {
    const res = await api.get(BASE_URL);
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des sessions :", err);
    throw err;
  }
};

// ✅ Rechercher des sessions par mot-clé (par exemple, titre, formateur ou module)
export const searchSessions = async (keyword) => {
  try {
    const res = await api.get(`${BASE_URL}/search`, {
      params: { keyword },
    });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la recherche des sessions :", err);
    throw err;
  }
};

// ✅ Créer une nouvelle session de formation
export const createSession = async (payload) => {
  try {
    const res = await api.post(BASE_URL, payload);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la création de la session :", err);
    throw err;
  }
};

// ✅ Mettre à jour une session de formation
export const updateSession = async (id, payload) => {
  try {
    const res = await api.put(`${BASE_URL}/${id}`, payload);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la mise à jour de la session :", err);
    throw err;
  }
};

// ✅ Supprimer une session de formation
export const deleteSession = async (id) => {
  try {
    const res = await api.delete(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la suppression de la session :", err);
    throw err;
  }
};

// ✅ Ajouter des participants à une session
export const addParticipantsToSession = async (sessionId, employeIds) => {
  try {
    const res = await api.post(`${BASE_URL}/${sessionId}/participants`, { employeIds });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de l'ajout des participants :", err);
    throw err;
  }
};

// ==============================
// FORMATIONS (pour la modale/dropdown filtrée)
// ==============================

// ✅ Récupérer toutes les formations
export const getAllFormations = async () => {
  try {
    const res = await api.get("/formations");
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des formations :", err);
    throw err;
  }
};

// ✅ Rechercher des formations avec filtres (type, famille, sousFamille, interneExterne, annee)
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
// EMPLOYÉS (pour sélectionner les participants)
// ==============================

// ✅ Récupérer tous les employés
export const getAllEmployees = async () => {
  try {
    const res = await api.get("/employes");
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des employés :", err);
    throw err;
  }
};

// Participants assignment
export const addSessionParticipants = async (sessionId, employeIds) => {
  try {
    const res = await api.post(`/sessions/${sessionId}/participants`, { employeIds });
    return res.data;
  } catch (err) {
    console.error("Erreur lors de l'ajout des participants :", err);
    throw err;
  }
};
// frontend-template/vite/src/api/sessionApi.js
import api from "./axios"; // votre instance axios

const BASE_URL = "/sessions";

// ==============================
// SESSIONS
// ==============================

export const getAllSessions = async (entrepriseId) => {
  try {
    const params = entrepriseId == null ? {} : { entrepriseId };
    const res = await api.get(BASE_URL, { params });
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des sessions :", err);
    throw err;
  }
};

// Get paginated sessions (used by SessionPage)
// Returns: { content: [], totalElements, totalPages, number, size }
export const getSessionsPaginated = async ({
  page = 0,
  size = 20,
  search = "",
  entrepriseId = null,
  years = [],
  statuts = [],     // ✅ new — finance view: ["EN_COURS", "TERMINEE"]
  facture = null,   // ✅ new — finance view: true | false | null (don't filter)
  sortBy = "idSession",
  sortDir = "desc",
} = {}) => {
  try {
    const params = { page, size, sortBy, sortDir };
    if (search)         params.search       = search;
    if (entrepriseId)   params.entrepriseId = entrepriseId;
    if (years?.length)  params.years        = years.join(",");
    if (statuts?.length) params.statuts     = statuts.join(",");
    if (facture !== null && facture !== undefined) params.facture = facture;
    const res = await api.get(`${BASE_URL}/paginated`, { params });
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement paginé des sessions :", err);
    throw err;
  }
};

// Get the list of years that have sessions (for the year-filter dropdown)
export const getSessionYears = async (entrepriseId) => {
  try {
    const params = entrepriseId == null ? {} : { entrepriseId };
    const res = await api.get(`${BASE_URL}/years`, { params });
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement des années :", err);
    throw err;
  }
};

export const getSessionById = async (id) => {
  try {
    const res = await api.get(`${BASE_URL}/${id}`);
    return res.data;
  } catch (err) {
    console.error("Erreur lors du chargement de la session :", err);
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
// FACTURATION — ADMIN_FINANCE only
// Backend enforces the role via @PreAuthorize regardless of what the
// frontend does; this is just wiring the call.
// ==============================

export const toggleSessionFacture = async (sessionId) => {
  try {
    const res = await api.patch(`${BASE_URL}/${sessionId}/facture`);
    return res.data;
  } catch (err) {
    console.error("Erreur lors de la mise à jour du statut de facturation :", err);
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

// Delete ONE participant from a session
export const removeParticipantFromSession = async (sessionId, employeId) => {
  try {
    await api.delete(`${BASE_URL}/${sessionId}/participants/${employeId}`);
  } catch (err) {
    console.error("Erreur lors de la suppression du participant :", err);
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

// ⚠️ DEPRECATED — do not use from UI
// Kept for internal / admin operations only
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
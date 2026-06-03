// frontend-template/vite/src/api/planificationApi.js
import api from './axios';

// GET /api/planification/{annee}?entrepriseId=...
// Returns { annee, entrepriseId, sessions, planned, actual }
export const getPlanification = async (annee, entrepriseId) => {
  const res = await api.get(`/planification/${annee}`, { params: { entrepriseId } });
  return res.data;
};

// POST /api/planification/bulk
// { entrepriseId, dateSession, count, dHeures, notes }
export const bulkAddSessions = async (payload) => {
  const res = await api.post('/planification/bulk', payload);
  return res.data;
};

// PUT /api/planification/sessions/{id}?entrepriseId=...
export const updateSession = async (id, entrepriseId, payload) => {
  const res = await api.put(`/planification/sessions/${id}`, payload, {
    params: { entrepriseId },
  });
  return res.data;
};

// DELETE /api/planification/sessions/{id}?entrepriseId=...
export const deleteSession = async (id, entrepriseId) => {
  await api.delete(`/planification/sessions/${id}`, { params: { entrepriseId } });
};

// Legacy — keep for the objectives modal if still used
export const savePlanification = async (payload) => {
  const res = await api.post('/planification', payload);
  return res.data;
};
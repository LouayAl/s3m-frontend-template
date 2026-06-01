// frontend-template/vite/src/api/planificationApi.js
import api from './axios';

/**
 * GET /api/planification/{annee}?entrepriseId=...
 * Returns { annee, entrepriseId, entrepriseNom, months: [{ month, label, planifie, realise }] }
 */
export const getPlanification = async (annee, entrepriseId) => {
  const res = await api.get(`/planification/${annee}`, {
    params: { entrepriseId },
  });
  return res.data;
};

/**
 * POST /api/planification
 * Upserts monthly targets.
 * payload: { annee, entrepriseId, jan, fev, mar, avr, mai, jui, jul, aou, sep, oct, nov, dec }
 */
export const savePlanification = async (payload) => {
  const res = await api.post('/planification', payload);
  return res.data;
};
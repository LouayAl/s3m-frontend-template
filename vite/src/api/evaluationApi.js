// frontend-template/vite/src/api/evaluationApi.js
import axios from 'axios';
import api from './axios';

const BASE_URL = import.meta.env.VITE_API_URL;

// PUBLIC — no JWT, plain axios (not the api instance which sends cookies)
export const getPublicParticipants = async (sessionId) => {
  const res = await axios.get(`${BASE_URL}/public/sessions/${sessionId}/participants`);
  return res.data;
};

export const submitEvaluationAChaud = async (payload) => {
  const res = await axios.post(`${BASE_URL}/public/evaluation-a-chaud`, payload);
  return res.data;
};

// PROTECTED — uses the authenticated api instance
export const getEvaluationStats = async (sessionId) => {
  const res = await api.get(`/evaluation-a-chaud/session/${sessionId}/stats`);
  return res.data;
};

export const getAllSessionsEvaluationSummary = async () => {
  const res = await api.get(`/evaluation-a-chaud/summary`);
  return res.data;
};

export const getFormulaire = async () => {
  const res = await axios.get(`${BASE_URL}/public/formulaire`);
  return res.data;
};
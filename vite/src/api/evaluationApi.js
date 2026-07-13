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

export const getSatisfactionKpis = async (sessionId) => {
  const res = await api.get(`/evaluation-a-chaud/session/${sessionId}/kpis`);
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

// ── EXPORTS ──────────────────────────────────────────────────────────────────

function downloadBlob(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.URL.revokeObjectURL(url);
}

function extractFilename(contentDisposition, fallback) {
  if (!contentDisposition) return fallback;
  const match = contentDisposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);
  return match ? decodeURIComponent(match[1]) : fallback;
}

// When responseType is 'blob', axios parses error bodies as a Blob too —
// so error.response.data is a Blob, not readable JSON. This unwraps it
// back into a normal error message string.
async function unwrapBlobError(err) {
  const blob = err.response?.data;
  if (blob instanceof Blob && blob.type.includes('json')) {
    try {
      const text = await blob.text();
      const parsed = JSON.parse(text);
      err.message = parsed.message || parsed.error || err.message;
    } catch {
      // fall through, keep original error
    }
  }
  throw err;
}

export const exportEvaluationPdf = async (sessionId) => {
  try {
    const res = await api.get(`/evaluation-a-chaud/session/${sessionId}/export/pdf`, {
      responseType: 'blob',
    });
    const filename = extractFilename(res.headers['content-disposition'], `evaluation_session_${sessionId}.pdf`);
    downloadBlob(res.data, filename);
  } catch (err) {
    await unwrapBlobError(err);
  }
};

export const exportEvaluationExcel = async (sessionId) => {
  try {
    const res = await api.get(`/evaluation-a-chaud/session/${sessionId}/export/excel`, {
      responseType: 'blob',
    });
    const filename = extractFilename(res.headers['content-disposition'], `evaluation_session_${sessionId}.xlsx`);
    downloadBlob(res.data, filename);
  } catch (err) {
    await unwrapBlobError(err);
  }
};

export const getAllSessionsQuizSummary = async () => {
  const res = await api.get('/quiz/summary');
  return res.data;
};
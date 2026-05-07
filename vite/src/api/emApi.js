// frontend/frontend-template/vite/src/api/emApi.js
import axiosInstance from './axios';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getEmDashboard = () =>
    axiosInstance.get('/em/dashboard').then(r => r.data);

// ─── Evaluations ──────────────────────────────────────────────────────────────
export const getSessionEvaluations = (sessionId) =>
    axiosInstance.get(`/em/sessions/${sessionId}/evaluations`).then(r => r.data);

export const getParticipantEvaluations = (sessionId, employeId) =>
    axiosInstance.get(`/em/sessions/${sessionId}/participants/${employeId}/evaluations`).then(r => r.data);

export const getSessionStats = (sessionId) =>
    axiosInstance.get(`/em/sessions/${sessionId}/stats`).then(r => r.data);

export const saveEvaluation = (payload) =>
    axiosInstance.post('/em/evaluations', payload).then(r => r.data);

// ─── Criteria ─────────────────────────────────────────────────────────────────
export const getSessionCriteres = (sessionId, jour) =>
    axiosInstance.get(`/em/sessions/${sessionId}/days/${jour}/criteres`).then(r => r.data);

export const saveSessionCriteres = (sessionId, jour, libelles) =>
    axiosInstance.post(`/em/sessions/${sessionId}/days/${jour}/criteres`, { libelles }).then(r => r.data);

export const getEmSessions = () =>
    axiosInstance.get('/em/sessions').then(r => r.data);

export const getEmSessionById = (sessionId) =>
    axiosInstance.get(`/em/sessions/${sessionId}`).then(r => r.data);

// ─── Formations (scoped to EM's entreprise) ───────────────────────────────────
// Backend should filter by the authenticated user's entrepriseId automatically.
// No param needed — the JWT tells the backend which company to scope to.
export const getEmFormations = () =>
    axiosInstance.get('/em/formations').then(r => r.data);
// frontend/frontend-template/vite/src/api/emApi.js
import axiosInstance from './axios';

// ─── Dashboard ────────────────────────────────────────────────────────────────
export const getEmDashboard = () =>
    axiosInstance.get('/em/dashboard').then(r => r.data);

// ─── Sessions ─────────────────────────────────────────────────────────────────
// All sessions scoped to logged-in user's entreprise (backend reads JWT)
export const getEmSessions = () =>
    axiosInstance.get('/em/sessions').then(r => r.data);

// Sessions where logged-in user is the formateur
export const getMySessionsAsTrainer = () =>
    axiosInstance.get('/em/sessions/my').then(r => r.data);

export const getEmSessionById = (sessionId) =>
    axiosInstance.get(`/em/sessions/${sessionId}`).then(r => r.data);

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

export const saveSessionCriteres = (sessionId, jour, criteres) =>
  axiosInstance
    .post(`/em/sessions/${sessionId}/days/${jour}/criteres`, { criteres })
    .then(r => r.data);

export const getDailyProgram = (sessionId, jour) =>
    axiosInstance.get(`/em/sessions/${sessionId}/days/${jour}/program`).then(r => r.data);

export const saveDailyProgram = (sessionId, jour, payload) =>
    axiosInstance.post(`/em/sessions/${sessionId}/days/${jour}/program`, payload).then(r => r.data);

// ─── Formations (scoped to EM's entreprise) ───────────────────────────────────
export const getEmFormations = () =>
    axiosInstance.get('/em/formations').then(r => r.data);


// ─── Employees (scoped to EM's entreprise) ────────────────────────────────────
// FIX: was using undefined `api` instead of `axiosInstance`
export const getEmEmployes = () =>
    axiosInstance.get('/em/employes').then(r => r.data);

export const listCritereTemplates = (type = null) =>
    axiosInstance.get('/em/critere-templates', { params: type ? { type } : {} }).then(r => r.data);

export const createCritereTemplate = (nom, type) =>
    axiosInstance.post('/em/critere-templates', { nom, type }).then(r => r.data);

export const deleteCritereTemplate = (templateId) =>
    axiosInstance.delete(`/em/critere-templates/${templateId}`).then(r => r.data);

export const getCritereTemplateEntries = (templateId) =>
    axiosInstance.get(`/em/critere-templates/${templateId}/entries`).then(r => r.data);

export const saveCritereTemplateEntries = (templateId, entries) =>
    axiosInstance.put(`/em/critere-templates/${templateId}/entries`, { entries }).then(r => r.data);

export const cloneCriteresFromTemplate = (sessionId, templateId) =>
    axiosInstance.post(`/em/sessions/${sessionId}/criteres/clone-from-template`, null, { params: { templateId } }).then(r => r.data);
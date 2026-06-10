// frontend-template/vite/src/api/presenceApi.js
import api from "./axios";

const base = (sessionId) => `/sessions/${sessionId}/presence`;

/**
 * GET /sessions/{sessionId}/presence/days
 * All calendar days between dateDebut and dateFin.
 * Returns: string[] (ISO dates)
 */
export const getSessionDays = (sessionId) =>
    api.get(`${base(sessionId)}/days`).then(r => r.data);

/**
 * GET /sessions/{sessionId}/presence/recorded
 * Days that already have presence records.
 * Returns: { sessionId, jours: string[] }
 */
export const getRecordedDays = (sessionId) =>
    api.get(`${base(sessionId)}/recorded`).then(r => r.data);

/**
 * GET /sessions/{sessionId}/presence?jour=2025-01-15
 * Presence for all participants on a given day.
 * Returns: { sessionId, jour, participants: [{ participationId, idEmploye, nom, prenom, cin, matricule, present }] }
 */
export const getPresenceForDay = (sessionId, jour) =>
    api.get(base(sessionId), { params: { jour } }).then(r => r.data);

/**
 * POST /sessions/{sessionId}/presence
 * Save presence for all participants on a given day.
 * Body: { jour, presences: [{ participationId, present }] }
 */
export const savePresence = (sessionId, payload) =>
    api.post(base(sessionId), payload).then(r => r.data);
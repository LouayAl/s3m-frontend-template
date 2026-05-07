import { useState, useEffect } from 'react';
import { getEmSessionById } from '../api/emApi';
import { getSessionEvaluations, getSessionCriteres, saveEvaluation } from '../api/emApi';

export function useSessionProgress(sessionId) {
  const [session,     setSession]     = useState(null);
  const [evaluations, setEvaluations] = useState({});
  const [criteres,    setCriteres]    = useState([]);
  const [loading,     setLoading]     = useState(true);
  const [saving,      setSaving]      = useState(false);
  const [activeDay,   setActiveDay]   = useState(1);
  const [snackbar,    setSnackbar]    = useState({ open: false, message: '', severity: 'success' });

  // ── Load session + evaluations ────────────────────────────────────────────
  useEffect(() => {
    if (!sessionId) return;
    setLoading(true);
    Promise.all([
      getEmSessionById(sessionId),
      getSessionEvaluations(sessionId),
    ])
      .then(([sessionData, evalsData]) => {
        setSession(sessionData);

        const map = {};
        evalsData.forEach(ev => {
          const key = `${ev.idEmploye}-${ev.jour}`;
          map[key] = {
            id:       ev.id,
            ratings:  ev.scores    ?? {},
            remarks:  ev.remarques ?? '',
            presence: ev.presence  ?? 'PRESENT',
          };
        });
        setEvaluations(map);

        // Jump to the day that matches today
        const today    = new Date();
        const start    = new Date(sessionData.dateDebut);
        const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
        const duree    = Number(sessionData.dJours);
        setActiveDay(Math.min(Math.max(diffDays, 1), duree));
      })
      .catch(() =>
        setSnackbar({ open: true, message: 'Erreur lors du chargement de la session.', severity: 'error' })
      )
      .finally(() => setLoading(false));
  }, [sessionId]);

  // ── Reload criteria when active day changes ───────────────────────────────
  useEffect(() => {
    if (!sessionId || !activeDay) return;
    getSessionCriteres(sessionId, activeDay)
      .then(setCriteres)
      .catch(() => setCriteres([]));
  }, [sessionId, activeDay]);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const isEvaluated = (employeId, day) => !!evaluations[`${employeId}-${day}`];

  const getEval = (employeId, day) =>
    evaluations[`${employeId}-${day}`] ?? { ratings: {}, remarks: '', presence: 'PRESENT' };

  const updateEval = (key, patch) =>
    setEvaluations(prev => ({
      ...prev,
      [key]: { ...(prev[key] ?? { ratings: {}, remarks: '', presence: 'PRESENT' }), ...patch },
    }));

  const updateRating = (key, critereIndex, value) =>
    setEvaluations(prev => ({
      ...prev,
      [key]: {
        ...(prev[key] ?? { ratings: {}, remarks: '', presence: 'PRESENT' }),
        ratings: { ...(prev[key]?.ratings ?? {}), [critereIndex]: value },
      },
    }));

  // ── Persist to backend ────────────────────────────────────────────────────
  const saveEval = async ({ employeId, jour, presence, remarks, ratings }) => {
    setSaving(true);
    try {
      const saved = await saveEvaluation({
        idSession: sessionId,
        idEmploye: employeId,
        jour,
        presence,
        remarques: remarks,
        scores:    ratings,
      });

      const key = `${saved.idEmploye}-${saved.jour}`;
      setEvaluations(prev => ({
        ...prev,
        [key]: {
          id:       saved.id,
          ratings:  saved.scores    ?? {},
          remarks:  saved.remarques ?? '',
          presence: saved.presence  ?? 'PRESENT',
        },
      }));

      setSnackbar({ open: true, message: 'Évaluation enregistrée avec succès !', severity: 'success' });
      return true;
    } catch (err) {
      const msg = err.response?.data?.message ?? 'Erreur lors de la sauvegarde.';
      setSnackbar({ open: true, message: msg, severity: 'error' });
      return false;
    } finally {
      setSaving(false);
    }
  };

  const reloadCriteres = () =>
    getSessionCriteres(sessionId, activeDay).then(setCriteres);

  const closeSnackbar = () => setSnackbar(p => ({ ...p, open: false }));

  return {
    session,
    evaluations,
    criteres,
    loading,
    saving,
    activeDay,
    setActiveDay,
    snackbar,
    closeSnackbar,
    isEvaluated,
    getEval,
    updateEval,
    updateRating,
    saveEval,
    reloadCriteres,
  };
}
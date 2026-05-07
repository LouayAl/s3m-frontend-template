import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Avatar, Chip, Button, CircularProgress, Divider,
} from '@mui/material';
import RatingBadge           from './RatingBadge';
import ParticipantDayToggle  from './ParticipantDayToggle';
import ParticipantDayView    from './ParticipantDayView';
import ParticipantEditForm   from './ParticipantEditForm';
import { getParticipantEvaluations, getSessionCriteres, saveEvaluation } from '../../../api/emApi';
import { useAuth }     from '../../../contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function ParticipantProgressDialog({
  open, onClose, participant, sessionId, duree,
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const isEM     = user?.role === 'EQUIPMENT_MANAGER';

  // ─── Data ──────────────────────────────────────────────────────────────────
  const [evaluations, setEvaluations] = useState([]);
  const [criteresMap, setCriteresMap] = useState({});
  const [loading,     setLoading]     = useState(false);

  // ─── View state ────────────────────────────────────────────────────────────
  const [activeDay, setActiveDay] = useState(null);
  const [editMode,  setEditMode]  = useState(false);

  // ─── Edit state ────────────────────────────────────────────────────────────
  const [editScores,   setEditScores]   = useState({});
  const [editPresence, setEditPresence] = useState('PRESENT');
  const [editRemarks,  setEditRemarks]  = useState('');
  const [saving,       setSaving]       = useState(false);
  const [saveError,    setSaveError]    = useState('');

  // ─── Load ──────────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !participant || !sessionId) return;
    setLoading(true);
    setEditMode(false);
    setActiveDay(null);

    getParticipantEvaluations(sessionId, participant.idEmploye)
      .then(async (evals) => {
        setEvaluations(evals);
        const sorted = [...evals].sort((a, b) => a.jour - b.jour);
        if (sorted.length > 0) setActiveDay(sorted[0].jour);
        else setActiveDay(1);

        const jours = [...new Set(evals.map(ev => ev.jour))];
        const entries = await Promise.all(
          jours.map(jour =>
            getSessionCriteres(sessionId, jour)
              .then(c => [jour, c])
              .catch(() => [jour, []])
          )
        );
        setCriteresMap(Object.fromEntries(entries));
      })
      .catch(() => setEvaluations([]))
      .finally(() => setLoading(false));
  }, [open, participant, sessionId]);

  if (!participant) return null;

  // ─── Derived ───────────────────────────────────────────────────────────────
  const evaluatedDays = evaluations
    .map(ev => ({ day: ev.jour, presence: ev.presence, remarks: ev.remarques, scores: ev.scores ?? {} }))
    .sort((a, b) => a.day - b.day);

  const overallScores = evaluatedDays.flatMap(d => Object.values(d.scores));
  const overallAvg = overallScores.length
    ? overallScores.reduce((a, b) => a + b, 0) / overallScores.length
    : null;

  const activeDayData  = evaluatedDays.find(d => d.day === activeDay);
  const activeCriteres = criteresMap[activeDay] ?? [];

  // ─── Load criteria for a day not yet loaded ────────────────────────────────
  const ensureCriteres = async (jour) => {
    if (criteresMap[jour] !== undefined) return;
    const c = await getSessionCriteres(sessionId, jour).catch(() => []);
    setCriteresMap(prev => ({ ...prev, [jour]: c }));
  };

  const handleDayChange = async (day) => {
    setActiveDay(day);
    setEditMode(false);
    await ensureCriteres(day);
  };

  // ─── Edit mode ─────────────────────────────────────────────────────────────
  const enterEditMode = () => {
    setEditScores(activeDayData ? { ...activeDayData.scores } : {});
    setEditPresence(activeDayData?.presence ?? 'PRESENT');
    setEditRemarks(activeDayData?.remarks ?? '');
    setSaveError('');
    setEditMode(true);
  };

  const cancelEdit = () => { setEditMode(false); setSaveError(''); };

  // ─── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    setSaving(true);
    setSaveError('');
    try {
      const saved = await saveEvaluation({
        idSession: sessionId,
        idEmploye: participant.idEmploye,
        jour:      activeDay,
        presence:  editPresence,
        remarques: editRemarks,
        scores:    Object.fromEntries(
          Object.entries(editScores).map(([k, v]) => [Number(k), v])
        ),
      });

      setEvaluations(prev => {
        const updated = {
          jour: saved.jour, presence: saved.presence,
          remarques: saved.remarques, scores: saved.scores ?? {},
        };
        const exists = prev.find(e => e.jour === activeDay);
        return exists
          ? prev.map(e => e.jour === activeDay ? updated : e)
          : [...prev, updated];
      });

      setEditMode(false);
    } catch (err) {
      setSaveError(err.response?.data?.message ?? 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  const handleConfigureCriteres = () => { onClose(); navigate(`/em/sessions/${sessionId}`); };

  // ─── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
          <Avatar sx={{ bgcolor:'primary.main', width:36, height:36, fontSize:14 }}>
            {participant.prenom?.[0]}{participant.nom?.[0]}
          </Avatar>
          <Box>
            <Typography component="span" display="block" fontWeight={700} fontSize="1.1rem">
              {participant.prenom} {participant.nom}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Matricule: {participant.matricule}
            </Typography>
          </Box>
          <Box sx={{ ml:'auto', display:'flex', gap:1, alignItems:'center' }}>
            <RatingBadge value={overallAvg} />
            <Chip label={`${evaluatedDays.length}/${duree} jours`} size="small" color="primary" variant="outlined" />
          </Box>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {loading ? (
          <Box sx={{ display:'flex', justifyContent:'center', py:4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            <ParticipantDayToggle
              duree={duree}
              evaluatedDays={evaluatedDays}
              activeDay={activeDay}
              onChange={handleDayChange}
            />

            <Divider sx={{ mb: 2 }} />

            {!activeDay && (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={3}>
                Sélectionnez un jour pour voir ou saisir une évaluation.
              </Typography>
            )}

            {activeDay && !editMode && (
              <>
                <ParticipantDayView
                  activeDay={activeDay}
                  activeDayData={activeDayData}
                  activeCriteres={activeCriteres}
                  isEM={isEM}
                  onEdit={enterEditMode}
                  onAdd={enterEditMode}
                  onConfigureCriteres={handleConfigureCriteres}
                />
                {overallAvg !== null && (
                  <Box sx={{
                    mt:2, p:1.5, borderRadius:1,
                    border:'1px solid', borderColor:'divider',
                    display:'flex', justifyContent:'space-between', alignItems:'center',
                  }}>
                    <Typography variant="caption" fontWeight={600} color="text.secondary">
                      Moyenne générale ({evaluatedDays.length} jours évalués)
                    </Typography>
                    <RatingBadge value={overallAvg} />
                  </Box>
                )}
              </>
            )}

            {activeDay && editMode && (
              <ParticipantEditForm
                activeDay={activeDay}
                activeCriteres={activeCriteres}
                editScores={editScores}
                setEditScores={setEditScores}
                editPresence={editPresence}
                setEditPresence={setEditPresence}
                editRemarks={editRemarks}
                setEditRemarks={setEditRemarks}
                saveError={saveError}
                isEM={isEM}
                onConfigureCriteres={handleConfigureCriteres}
              />
            )}
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px:3, py:2 }}>
        {editMode ? (
          <>
            <Button onClick={cancelEdit} disabled={saving}>Annuler</Button>
            <Box sx={{ flex:1 }} />
            <Button
              variant="contained"
              onClick={handleSave}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {saving ? 'Enregistrement...' : 'Enregistrer'}
            </Button>
          </>
        ) : (
          <Button onClick={onClose}>Fermer</Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
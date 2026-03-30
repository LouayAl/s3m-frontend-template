// frontend-template/vite/src/views/equipment-manager/EMSessionProgressPage.jsx
import { useState } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, LinearProgress,
  Chip, Button, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Tooltip, Snackbar, Alert,
} from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import { useNavigate } from 'react-router-dom';
import { DAYS_DATA } from './data/bookletData';

// ── Dummy session data ────────────────────────────────────────────────────────
const DUMMY_SESSION = {
  id: 1,
  formationNom: 'RTG Operator Training',
  groupe: 'Groupe A',
  dateDebut: '2026-01-12',
  dateFin: '2026-01-26',
  duree: 15,
  statut: 'EN_COURS',
  joursCompletes: 3,
  participants: [
    { id: 1, nom: 'Alaoui', prenom: 'Karim', matricule: '1217' },
    { id: 2, nom: 'Benjelloun', prenom: 'Sara', matricule: '1271' },
  ],
  evaluations: {
    // key: "participantId-day"
    '1-1': { ratings: { 0: 4, 1: 3, 2: 4, 3: 3, 4: 4, 5: 3, 6: 4, 7: 4, 8: 3, 9: 3, 10: 4, 11: 4 }, remarks: 'Good first day overall.', presence: 'PRESENT' },
    '2-1': { ratings: { 0: 3, 1: 3, 2: 3, 3: 4, 4: 3, 5: 3, 6: 3, 7: 3, 8: 4, 9: 3, 10: 3, 11: 3 }, remarks: 'Needs more practice on cabin controls.', presence: 'PRESENT' },
    '1-2': { ratings: { 0: 4, 1: 4, 2: 3, 3: 4, 4: 4 }, remarks: 'Excellent trolley control.', presence: 'PRESENT' },
    '2-2': { ratings: { 0: 3, 1: 3, 2: 3, 3: 3, 4: 3 }, remarks: '', presence: 'RETARD' },
    '1-3': { ratings: { 0: 4, 1: 4, 2: 3, 3: 4 }, remarks: 'Precise spreader control.', presence: 'PRESENT' },
    '2-3': { ratings: { 0: 3, 1: 3, 2: 3, 3: 3 }, remarks: '', presence: 'PRESENT' },
  },
};

const PRESENCE_OPTIONS = ['PRESENT', 'ABSENT', 'RETARD'];
const PRESENCE_LABELS  = { PRESENT: 'Présent', ABSENT: 'Absent', RETARD: 'Retard' };
const PRESENCE_COLORS  = { PRESENT: 'success', ABSENT: 'error', RETARD: 'warning' };

export default function EMSessionProgressPage() {
  const navigate = useNavigate();
  const session  = DUMMY_SESSION;

  const [activeDay, setActiveDay]           = useState(3);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [evaluations, setEvaluations]       = useState(session.evaluations);
  const [snackbar, setSnackbar]             = useState({ open: false, message: '', severity: 'success' });
  const [histOpen, setHistOpen]             = useState(false);

  const dayData = DAYS_DATA[activeDay - 1];
  const evalKey = selectedParticipant ? `${selectedParticipant.id}-${activeDay}` : null;
  const currentEval = evalKey ? (evaluations[evalKey] ?? { ratings: {}, remarks: '', presence: 'PRESENT' }) : null;

  const isEvaluated = (participantId, day) => !!evaluations[`${participantId}-${day}`];

  const handleRatingChange = (criterionIndex, value) => {
    if (!evalKey) return;
    setEvaluations(prev => ({
      ...prev,
      [evalKey]: {
        ...prev[evalKey] ?? { ratings: {}, remarks: '', presence: 'PRESENT' },
        ratings: { ...(prev[evalKey]?.ratings ?? {}), [criterionIndex]: value },
      },
    }));
  };

  const handlePresenceChange = (val) => {
    if (!evalKey) return;
    setEvaluations(prev => ({
      ...prev,
      [evalKey]: { ...prev[evalKey] ?? { ratings: {}, remarks: '', presence: 'PRESENT' }, presence: val },
    }));
  };

  const handleRemarksChange = (val) => {
    if (!evalKey) return;
    setEvaluations(prev => ({
      ...prev,
      [evalKey]: { ...prev[evalKey] ?? { ratings: {}, remarks: '', presence: 'PRESENT' }, remarks: val },
    }));
  };

  const handleSave = () => {
    setSnackbar({ open: true, message: 'Évaluation enregistrée avec succès !', severity: 'success' });
    setSelectedParticipant(null);
  };

  const handleExportPdf = () => {
    setSnackbar({ open: true, message: 'Export PDF en cours de développement.', severity: 'info' });
  };

  const allEvals = Object.entries(evaluations).map(([key, val]) => {
    const [pId, day] = key.split('-').map(Number);
    const p = session.participants.find(x => x.id === pId);
    const avgRating = Object.values(val.ratings).length
      ? (Object.values(val.ratings).reduce((a, b) => a + b, 0) / Object.values(val.ratings).length).toFixed(1)
      : '—';
    return { participant: p, day, presence: val.presence, remarks: val.remarks, avgRating };
  }).sort((a, b) => a.day - b.day || a.participant?.nom.localeCompare(b.participant?.nom));

  const progressPct = Math.round((session.joursCompletes / session.duree) * 100);

  return (
    <Box>
      {/* Breadcrumb */}
      <Typography variant="caption" color="text.secondary">
        Formations › RTG Operator Training › {session.groupe}
      </Typography>
      <Typography variant="h4" fontWeight={700} mt={0.5} mb={0.5}>Suivi de progression</Typography>
      <Chip
        label={`En cours · Jour ${session.joursCompletes} / ${session.duree}`}
        color="success" size="small" sx={{ fontWeight: 600, mb: 2 }}
      />

      {/* Session info + progress */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">Formation</Typography>
              <Typography variant="body2" fontWeight={600}>{session.formationNom}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">Dates</Typography>
              <Typography variant="body2" fontWeight={600}>{session.dateDebut} → {session.dateFin}</Typography>
            </Grid>
            <Grid size={{ xs: 12, sm: 4 }}>
              <Typography variant="caption" color="text.secondary">Participants</Typography>
              <Typography variant="body2" fontWeight={600}>{session.participants.length} inscrits</Typography>
            </Grid>
          </Grid>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">Progression globale</Typography>
            <Typography variant="caption" fontWeight={600}>{session.joursCompletes} / {session.duree} jours</Typography>
          </Box>
          <LinearProgress variant="determinate" value={progressPct} sx={{ height: 8, borderRadius: 4 }} color="primary" />
          <Typography variant="caption" color="text.secondary">{progressPct}% complété</Typography>
        </CardContent>
      </Card>

      {/* Day tracker */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 2 }}>
        <CardContent>
          <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
            Jours de formation — cliquer sur un jour pour évaluer
          </Typography>
          <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
            {Array.from({ length: session.duree }, (_, i) => i + 1).map((d) => {
              const completed = d < session.joursCompletes;
              const isActive  = d === activeDay;
              const isFuture  = d > session.joursCompletes;
              const allEvaluated = session.participants.every(p => isEvaluated(p.id, d));

              return (
                <Tooltip key={d} title={DAYS_DATA[d - 1]?.title ?? `Jour ${d}`} arrow>
                  <Box
                    onClick={() => !isFuture && setActiveDay(d)}
                    sx={{
                      width: 40, height: 40, borderRadius: 1.5,
                      display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                      cursor: isFuture ? 'default' : 'pointer',
                      opacity: isFuture ? 0.35 : 1,
                      border: '1px solid',
                      borderColor: isActive ? 'primary.main' : completed ? 'success.main' : 'divider',
                      bgcolor: isActive ? 'primary.light' : completed ? 'success.light' : 'background.paper',
                      boxShadow: isActive ? '0 0 0 2px' : 'none',
                      boxShadowColor: 'primary.light',
                      transition: 'all 0.15s',
                      position: 'relative',
                    }}
                  >
                    <Typography variant="caption" fontWeight={isActive ? 700 : 500}
                      color={isActive ? 'primary.main' : completed ? 'success.main' : 'text.secondary'}
                    >
                      J{d}
                    </Typography>
                    {allEvaluated && d <= session.joursCompletes && (
                      <CheckCircleOutlinedIcon sx={{ fontSize: 10, color: 'success.main', position: 'absolute', top: 1, right: 1 }} />
                    )}
                  </Box>
                </Tooltip>
              );
            })}
          </Box>
        </CardContent>
      </Card>

      {/* Evaluation card */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={700}>
                Évaluation — Jour {activeDay}: {dayData?.title}
              </Typography>
              {dayData?.content && (
                <Typography variant="caption" color="text.secondary">
                  {dayData.content.join(' · ')}
                </Typography>
              )}
            </Box>
            <Button variant="outlined" size="small" onClick={() => setHistOpen(true)}>
              Voir les évaluations existantes
            </Button>
          </Box>

          {/* Participant selector */}
          <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
            Sélectionner un participant
          </Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
            {session.participants.map((p) => {
              const evaluated = isEvaluated(p.id, activeDay);
              const isSelected = selectedParticipant?.id === p.id;
              return (
                <Chip
                  key={p.id}
                  label={`${p.prenom} ${p.nom}${evaluated ? ' ✓' : ''}`}
                  onClick={() => setSelectedParticipant(p)}
                  color={isSelected ? 'primary' : evaluated ? 'success' : 'default'}
                  variant={isSelected ? 'filled' : 'outlined'}
                  sx={{ fontWeight: isSelected ? 700 : 400, cursor: 'pointer' }}
                />
              );
            })}
          </Box>

          {/* Evaluation form */}
          {selectedParticipant && currentEval && (
            <>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
                {selectedParticipant.prenom} {selectedParticipant.nom} — Jour {activeDay}
              </Typography>

              {/* Criteria ratings */}
              <Box sx={{ overflowX: 'auto', mb: 2 }}>
                <Box sx={{ minWidth: 500 }}>
                  {/* Header */}
                  <Box sx={{ display: 'flex', gap: 1, mb: 1, alignItems: 'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ flex: 1, fontWeight: 600 }}>
                      Critère d'évaluation
                    </Typography>
                    {[1, 2, 3, 4].map(v => (
                      <Box key={v} sx={{ width: 36, textAlign: 'center' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">{v}</Typography>
                      </Box>
                    ))}
                  </Box>
                  {/* Rows */}
                  {dayData?.criteria.map((criterion, idx) => (
                    <Box
                      key={idx}
                      sx={{
                        display: 'flex', gap: 1, alignItems: 'center', py: 0.75,
                        borderBottom: '1px solid', borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>{criterion}</Typography>
                      {[1, 2, 3, 4].map(v => (
                        <Box
                          key={v}
                          onClick={() => handleRatingChange(idx, v)}
                          sx={{
                            width: 36, height: 36, borderRadius: 1, border: '1px solid',
                            borderColor: currentEval.ratings[idx] === v ? 'primary.main' : 'divider',
                            bgcolor: currentEval.ratings[idx] === v ? 'primary.main' : 'background.paper',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.1s',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light' },
                          }}
                        >
                          <Typography variant="caption" fontWeight={700}
                            color={currentEval.ratings[idx] === v ? '#fff' : 'text.secondary'}
                          >
                            {v}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>

              {/* Presence */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                  Présence
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  {PRESENCE_OPTIONS.map(opt => (
                    <Chip
                      key={opt}
                      label={PRESENCE_LABELS[opt]}
                      color={currentEval.presence === opt ? PRESENCE_COLORS[opt] : 'default'}
                      variant={currentEval.presence === opt ? 'filled' : 'outlined'}
                      onClick={() => handlePresenceChange(opt)}
                      sx={{ fontWeight: currentEval.presence === opt ? 700 : 400, cursor: 'pointer' }}
                    />
                  ))}
                </Box>
              </Box>

              {/* Remarks */}
              <Box sx={{ mb: 2 }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                  Remarques du formateur
                </Typography>
                <Box
                  component="textarea"
                  value={currentEval.remarks}
                  onChange={e => handleRemarksChange(e.target.value)}
                  placeholder="Observations, points d'amélioration..."
                  sx={{
                    width: '100%', minHeight: 80, p: 1.5, borderRadius: 1,
                    border: '1px solid', borderColor: 'divider', fontFamily: 'inherit',
                    fontSize: 13, resize: 'vertical', bgcolor: 'background.paper', color: 'text.primary',
                    '&:focus': { outline: 'none', borderColor: 'primary.main' },
                  }}
                />
              </Box>

              {/* Actions */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button variant="contained" color="primary" onClick={handleSave}>
                  Enregistrer l'évaluation
                </Button>
                <Button variant="contained" sx={{ bgcolor: '#1a5276', '&:hover': { bgcolor: '#154360' } }} onClick={handleExportPdf}>
                  Exporter PDF
                </Button>
                <Button variant="outlined" onClick={() => setSelectedParticipant(null)}>
                  Annuler
                </Button>
              </Box>
            </>
          )}

          {!selectedParticipant && (
            <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
              <Typography variant="body2">Sélectionnez un participant pour commencer l'évaluation.</Typography>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* History dialog */}
      <Dialog open={histOpen} onClose={() => setHistOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle fontWeight={700}>Évaluations existantes</DialogTitle>
        <DialogContent dividers>
          {allEvals.length === 0 && (
            <Typography variant="body2" color="text.secondary">Aucune évaluation saisie pour cette session.</Typography>
          )}
          {allEvals.map((ev, i) => (
            <Box key={i} sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1, mb: 1 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {ev.participant?.prenom} {ev.participant?.nom} · Jour {ev.day}
                </Typography>
                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Chip label={PRESENCE_LABELS[ev.presence]} color={PRESENCE_COLORS[ev.presence]} size="small" />
                  <Button size="small" variant="outlined" onClick={handleExportPdf} sx={{ fontSize: 11, py: 0 }}>
                    ↓ PDF
                  </Button>
                </Box>
              </Box>
              <Typography variant="caption" color="text.secondary">
                Note moy.: {ev.avgRating}/4
                {ev.remarks && ` · ${ev.remarks}`}
              </Typography>
            </Box>
          ))}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setHistOpen(false)}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={3000} onClose={() => setSnackbar(p => ({ ...p, open: false }))} anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
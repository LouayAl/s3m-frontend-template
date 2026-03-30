// frontend-template/vite/src/views/equipment-manager/components/AddEvaluationModal.jsx
import { useState, useEffect } from 'react';
import {
  Box, Dialog, DialogTitle, DialogContent, DialogActions,
  Typography, Button, Grid, Select, MenuItem,
  FormControl, InputLabel, Table, TableHead, TableRow,
  TableCell, TableBody, Radio, TextField, Chip, Divider, LinearProgress,
} from '@mui/material';
import { DAYS_DATA } from '../data/bookletData';

const DUMMY_SESSIONS = [
  {
    id: 1,
    formation: 'RTG Operator Training',
    session: 'Groupe A',
    currentDay: 3,
    participants: [
      { id: 1217, nom: 'Alaoui', prenom: 'Karim' },
      { id: 1271, nom: 'Benjelloun', prenom: 'Sara' },
    ],
  },
  {
    id: 2,
    formation: 'Sécurité au travail',
    session: 'Groupe A',
    currentDay: 1,
    participants: [
      { id: 1656, nom: 'Jout', prenom: 'Anouar' },
      { id: 1527, nom: 'Marahbani', prenom: 'Otmane' },
    ],
  },
];

const PRESENCE_OPTIONS = [
  { value: 'PRESENT', label: 'Présent',  color: 'success' },
  { value: 'ABSENT',  label: 'Absent',   color: 'error' },
  { value: 'RETARD',  label: 'Retard',   color: 'warning' },
];

export default function AddEvaluationModal({ open, onClose, onSubmit }) {
  const [step, setStep]                           = useState(1);
  const [selectedSession, setSelectedSession]     = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState('');
  const [scores, setScores]                       = useState({});
  const [remarks, setRemarks]                     = useState('');
  const [presence, setPresence]                   = useState('PRESENT');

  useEffect(() => {
    if (!open) {
      setStep(1);
      setSelectedSession(null);
      setSelectedParticipant('');
      setScores({});
      setRemarks('');
      setPresence('PRESENT');
    }
  }, [open]);

  const dayData  = selectedSession ? DAYS_DATA[selectedSession.currentDay - 1] : null;
  const criteria = dayData?.criteria ?? [];
  const filledCount = Object.keys(scores).length;
  const totalCount  = criteria.length;
  const fillPct     = totalCount ? Math.round((filledCount / totalCount) * 100) : 0;

  const handleSubmit = () => {
    const scoreValues = Object.values(scores);
    const avgRating   = scoreValues.length
      ? scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length
      : 0;
    onSubmit({
      sessionId:   selectedSession.id,
      formation:   selectedSession.formation,
      session:     selectedSession.session,
      participant: selectedParticipant,
      day:         selectedSession.currentDay,
      scores,
      avgRating,
      remarks,
      presence,
    });
    onClose();
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ bgcolor:'primary.main', color:'#fff', pb:1 }}>
        <Typography variant="h6" fontWeight={900}>Ajouter une évaluation</Typography>
        <Typography variant="caption" sx={{ color: "black"  }}>
          Étape {step} / 2 — {step === 1 ? 'Sélection de la session' : 'Grille d\'évaluation'}
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Step 1 */}
        {step === 1 && (
          <Grid container spacing={2} mt={0.5}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Session active</InputLabel>
                <Select
                  value={selectedSession?.id ?? ''}
                  label="Session active"
                  sx={{ minWidth: 140 }}
                  onChange={e => {
                    const s = DUMMY_SESSIONS.find(x => x.id === e.target.value);
                    setSelectedSession(s ?? null);
                    setSelectedParticipant('');
                  }}
                >
                  {DUMMY_SESSIONS.map(s => (
                    <MenuItem key={s.id} value={s.id}>
                      {s.formation} — {s.session} (Jour {s.currentDay})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth size="small">
                <InputLabel>Participant</InputLabel>
                <Select
                  value={selectedParticipant}
                  label="Participant"
                  sx={{ minWidth: 140 }}
                  disabled={!selectedSession}
                  onChange={e => setSelectedParticipant(e.target.value)}
                >
                  {(selectedSession?.participants ?? []).map(p => (
                    <MenuItem key={p.id} value={`${p.prenom} ${p.nom}`}>
                      {p.prenom} {p.nom}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>

            {selectedSession && (
              <Grid item xs={12}>
                <Box sx={{ p:2, bgcolor:'background.default', borderRadius:2, border:'1px solid', borderColor:'divider' }}>
                  <Typography variant="subtitle2" fontWeight={700} mb={0.5}>
                    Jour {selectedSession.currentDay} — {DAYS_DATA[selectedSession.currentDay - 1]?.title}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {DAYS_DATA[selectedSession.currentDay - 1]?.content?.join(' · ')}
                  </Typography>
                </Box>
              </Grid>
            )}

            {/* Presence */}
            <Grid item xs={12}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
                Présence du participant
              </Typography>
              <Box sx={{ display:'flex', gap:1 }}>
                {PRESENCE_OPTIONS.map(opt => (
                  <Chip
                    key={opt.value}
                    label={opt.label}
                    color={presence === opt.value ? opt.color : 'default'}
                    variant={presence === opt.value ? 'filled' : 'outlined'}
                    onClick={() => setPresence(opt.value)}
                    sx={{ fontWeight: presence === opt.value ? 700 : 400, cursor:'pointer' }}
                  />
                ))}
              </Box>
            </Grid>
          </Grid>
        )}

        {/* Step 2 */}
        {step === 2 && (
          <Box>
            {/* Progress bar */}
            <Box sx={{ mb:2 }}>
              <Box sx={{ display:'flex', justifyContent:'space-between', mb:0.5 }}>
                <Typography variant="caption" color="text.secondary">
                  {filledCount} / {totalCount} compétences évaluées
                </Typography>
                <Typography variant="caption" fontWeight={700} color="primary.main">{fillPct}%</Typography>
              </Box>
              <LinearProgress variant="determinate" value={fillPct} sx={{ height:6, borderRadius:3 }} />
            </Box>

            <Box sx={{ display:'flex', gap:1, mb:2, alignItems:'center' }}>
              <Chip label={`Jour ${selectedSession?.currentDay}`} color="primary" size="small" />
              <Chip label={selectedParticipant} variant="outlined" size="small" />
              <Chip
                label={PRESENCE_OPTIONS.find(o=>o.value===presence)?.label}
                color={PRESENCE_OPTIONS.find(o=>o.value===presence)?.color}
                size="small"
              />
            </Box>

            <Box sx={{ overflowX:'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor:'background.default' }}>
                    <TableCell sx={{ fontWeight:700 }}>Compétence évaluée</TableCell>
                    {[1,2,3,4].map(v => (
                      <TableCell key={v} align="center" sx={{ fontWeight:700, color:'text.secondary' }}>{v}</TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {criteria.map((criterion, idx) => (
                    <TableRow key={idx} hover
                      sx={{ bgcolor: scores[idx] !== undefined ? 'primary.light' : 'transparent' }}
                    >
                      <TableCell sx={{ fontSize:13 }}>{criterion}</TableCell>
                      {[1,2,3,4].map(v => (
                        <TableCell key={v} align="center">
                          <Radio
                            checked={scores[idx] === v}
                            onChange={() => setScores(prev => ({ ...prev, [idx]: v }))}
                            color="primary"
                            size="small"
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <Box sx={{ mt:2 }}>
              <TextField
                fullWidth multiline rows={3}
                label="Remarques du formateur"
                value={remarks}
                onChange={e => setRemarks(e.target.value)}
                placeholder="Observations, points d'amélioration..."
              />
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px:3, py:2 }}>
        {step === 1 && (
          <>
            <Button onClick={onClose}>Annuler</Button>
            <Button
              variant="contained"
              disabled={!selectedSession || !selectedParticipant}
              onClick={() => setStep(2)}
            >
              Suivant →
            </Button>
          </>
        )}
        {step === 2 && (
          <>
            <Button variant="outlined" onClick={() => setStep(1)}>← Retour</Button>
            <Box sx={{ flex:1 }} />
            <Typography variant="caption" color="text.secondary" sx={{ mr:1 }}>
              {filledCount}/{totalCount} compétences remplies
            </Typography>
            <Button variant="contained" onClick={handleSubmit}>
              Soumettre l'évaluation
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
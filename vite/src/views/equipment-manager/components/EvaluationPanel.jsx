import { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, CircularProgress,
  Divider, Typography,
} from '@mui/material';

const PRESENCE_OPTIONS = ['PRESENT', 'ABSENT', 'RETARD'];
const PRESENCE_LABELS  = { PRESENT: 'Présent', ABSENT: 'Absent', RETARD: 'Retard' };
const PRESENCE_COLORS  = { PRESENT: 'success', ABSENT: 'error', RETARD: 'warning' };

export default function EvaluationPanel({
  activeDay,
  participants,
  criteres,
  isEvaluated,
  getEval,
  updateEval,
  updateRating,
  saving,
  onSave,
  onOpenHistory,
  onOpenCriteres,
}) {
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  const evalKey    = selectedParticipant ? `${selectedParticipant.idEmploye}-${activeDay}` : null;
  const currentEval = evalKey ? getEval(selectedParticipant.idEmploye, activeDay) : null;

  const handleSave = async () => {
    if (!selectedParticipant || !currentEval) return;
    const ok = await onSave({
      employeId: selectedParticipant.idEmploye,
      jour:      activeDay,
      presence:  currentEval.presence,
      remarks:   currentEval.remarks,
      ratings:   currentEval.ratings,
    });
    if (ok) setSelectedParticipant(null);
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Évaluation — Jour {activeDay}
            </Typography>
            {criteres.length === 0 && (
              <Typography variant="caption" color="warning.main">
                Aucun critère défini pour ce jour. Veuillez les configurer.
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {onOpenCriteres && (
              <Button variant="outlined" size="small" color="warning" onClick={onOpenCriteres}>
                Gérer les critères
              </Button>
            )}
            <Button variant="outlined" size="small" onClick={onOpenHistory}>
              Voir les évaluations existantes
            </Button>
          </Box>
        </Box>

        {/* Participant chips */}
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
          Sélectionner un participant
        </Typography>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          {participants.map((p) => {
            const evaluated  = isEvaluated(p.idEmploye, activeDay);
            const isSelected = selectedParticipant?.idEmploye === p.idEmploye;
            return (
              <Chip
                key={p.idEmploye}
                label={`${p.prenom} ${p.nom}${evaluated ? ' ✓' : ''}`}
                onClick={() => setSelectedParticipant(p)}
                color={isSelected ? 'primary' : evaluated ? 'success' : 'default'}
                variant={isSelected ? 'filled' : 'outlined'}
                sx={{ fontWeight: isSelected ? 700 : 400, cursor: 'pointer' }}
              />
            );
          })}
        </Box>

        {/* Empty state */}
        {!selectedParticipant && (
          <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary' }}>
            <Typography variant="body2">
              Sélectionnez un participant pour commencer l'évaluation.
            </Typography>
          </Box>
        )}

        {/* Evaluation form */}
        {selectedParticipant && currentEval && (
          <>
            <Divider sx={{ mb: 2 }} />
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              {selectedParticipant.prenom} {selectedParticipant.nom} — Jour {activeDay}
            </Typography>

            {/* Rating grid */}
            {criteres.length > 0 ? (
              <Box sx={{ overflowX: 'auto', mb: 2 }}>
                <Box sx={{ minWidth: 500 }}>
                  {/* Header row */}
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
                  {/* Criteria rows */}
                  {criteres.map((c) => (
                    <Box
                      key={c.critereIndex}
                      sx={{
                        display: 'flex', gap: 1, alignItems: 'center', py: 0.75,
                        borderBottom: '1px solid', borderColor: 'divider',
                        '&:last-child': { borderBottom: 'none' },
                      }}
                    >
                      <Typography variant="body2" sx={{ flex: 1 }}>{c.libelle}</Typography>
                      {[1, 2, 3, 4].map(v => (
                        <Box
                          key={v}
                          onClick={() => updateRating(evalKey, c.critereIndex, v)}
                          sx={{
                            width: 36, height: 36, borderRadius: 1, border: '1px solid',
                            borderColor: currentEval.ratings[c.critereIndex] === v ? 'primary.main' : 'divider',
                            bgcolor:     currentEval.ratings[c.critereIndex] === v ? 'primary.main' : 'background.paper',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', transition: 'all 0.1s',
                            '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light' },
                          }}
                        >
                          <Typography
                            variant="caption"
                            fontWeight={700}
                            color={currentEval.ratings[c.critereIndex] === v ? '#fff' : 'text.secondary'}
                          >
                            {v}
                          </Typography>
                        </Box>
                      ))}
                    </Box>
                  ))}
                </Box>
              </Box>
            ) : (
              <Box sx={{ py: 2, mb: 2, textAlign: 'center', bgcolor: 'background.default', borderRadius: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Aucun critère d'évaluation défini pour le jour {activeDay}.
                </Typography>
              </Box>
            )}

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
                    onClick={() =>
                      updateEval(evalKey, { presence: opt })
                    }
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
                onChange={e => updateEval(evalKey, { remarks: e.target.value })}
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
              <Button
                variant="contained"
                color="primary"
                onClick={handleSave}
                disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
              >
                {saving ? 'Enregistrement...' : "Enregistrer l'évaluation"}
              </Button>
              <Button variant="outlined" onClick={() => setSelectedParticipant(null)} disabled={saving}>
                Annuler
              </Button>
            </Box>
          </>
        )}
      </CardContent>
    </Card>
  );
}
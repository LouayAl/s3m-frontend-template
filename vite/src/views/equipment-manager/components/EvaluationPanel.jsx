// views/equipment-manager/components/EvaluationPanel.jsx
import { useState } from 'react';
import {
  Box, Button, Card, CardContent, Chip, CircularProgress,
  Divider, Typography, Collapse, IconButton, Tooltip,
} from '@mui/material';
import VisibilityOffOutlinedIcon from '@mui/icons-material/VisibilityOffOutlined';
import VisibilityOutlinedIcon    from '@mui/icons-material/VisibilityOutlined';

const PRESENCE_OPTIONS = ['PRESENT', 'ABSENT', 'RETARD'];
const PRESENCE_LABELS  = { PRESENT: 'Présent', ABSENT: 'Absent', RETARD: 'Retard' };
const PRESENCE_COLORS  = { PRESENT: 'success', ABSENT: 'error', RETARD: 'warning' };

// ── Hours/minutes picker ──────────────────────────────────────────────────────
// Stores as decimal hours (e.g. 7.5 = 7h 30min) — same backend format.

function HoursMinutesPicker({ value, onChange }) {
  // value: decimal hours (number | null)
  const totalMinutes = value != null ? Math.round(value * 60) : 0;
  const hours   = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  const handleHours = (e) => {
    const h = Math.max(0, Math.min(23, parseInt(e.target.value, 10) || 0));
    onChange((h * 60 + minutes) / 60 || null);
  };

  const handleMinutes = (e) => {
    const m = Math.max(0, Math.min(59, parseInt(e.target.value, 10) || 0));
    onChange((hours * 60 + m) / 60 || null);
  };

  const inputSx = {
    width: 64, p: 1, borderRadius: 1, textAlign: 'center',
    border: '1px solid', borderColor: 'divider',
    fontFamily: 'inherit', fontSize: 13,
    bgcolor: 'background.paper', color: 'text.primary',
    '&:focus': { outline: 'none', borderColor: 'primary.main' },
  };

  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          component="input"
          type="number" min="0" max="23" step="1"
          value={value == null ? '' : hours}
          onChange={handleHours}
          placeholder="0"
          sx={inputSx}
        />
        <Typography variant="caption" color="text.secondary">h</Typography>
      </Box>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
        <Box
          component="input"
          type="number" min="0" max="59" step="5"
          value={value == null ? '' : minutes}
          onChange={handleMinutes}
          placeholder="00"
          sx={inputSx}
        />
        <Typography variant="caption" color="text.secondary">min</Typography>
      </Box>
      {value != null && value > 0 && (
        <Typography variant="caption" color="text.secondary">
          = {value % 1 === 0 ? `${value}h` : `${hours}h${String(minutes).padStart(2, '0')}`}
        </Typography>
      )}
    </Box>
  );
}

// ── Criteria grouping ─────────────────────────────────────────────────────────

function groupCriteres(criteres) {
  const groups = [];
  let currentGroup = null;
  for (const c of criteres) {
    const cat = c.categorie || null;
    if (currentGroup === null || currentGroup.categorie !== cat) {
      currentGroup = { categorie: cat, criteres: [] };
      groups.push(currentGroup);
    }
    currentGroup.criteres.push(c);
  }
  return groups;
}

// ── Main component ────────────────────────────────────────────────────────────

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
  const [hiddenCategories,    setHiddenCategories]    = useState(new Set());

  const evalKey     = selectedParticipant ? `${selectedParticipant.idEmploye}-${activeDay}` : null;
  const currentEval = evalKey ? getEval(selectedParticipant.idEmploye, activeDay) : null;

  const handleSave = async () => {
    if (!selectedParticipant || !currentEval) return;
    const ok = await onSave({
      employeId:   selectedParticipant.idEmploye,
      jour:        activeDay,
      presence:    currentEval.presence,
      remarks:     currentEval.remarks,
      ratings:     currentEval.ratings,
      dureeHeures: currentEval.dureeHeures ?? null,
    });
    if (ok) setSelectedParticipant(null);
  };

  const toggleCategory = (cat) => {
    setHiddenCategories(prev => {
      const next = new Set(prev);
      if (next.has(cat)) next.delete(cat); else next.add(cat);
      return next;
    });
  };

  const groups = groupCriteres(criteres);

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:2, flexWrap:'wrap', gap:1 }}>
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
          <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
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
        <Box sx={{ display:'flex', gap:1, flexWrap:'wrap', mb:2 }}>
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
                sx={{ fontWeight: isSelected ? 700 : 400, cursor:'pointer' }}
              />
            );
          })}
        </Box>

        {/* Empty state */}
        {!selectedParticipant && (
          <Box sx={{ py:3, textAlign:'center', color:'text.secondary' }}>
            <Typography variant="body2">
              Sélectionnez un participant pour commencer l'évaluation.
            </Typography>
          </Box>
        )}

        {/* Evaluation form */}
        {selectedParticipant && currentEval && (
          <>
            <Divider sx={{ mb:2 }} />
            <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
              {selectedParticipant.prenom} {selectedParticipant.nom} — Jour {activeDay}
            </Typography>

            {/* Rating grid */}
            {criteres.length > 0 ? (
              <Box sx={{ overflowX:'auto', mb:2 }}>
                <Box sx={{ minWidth:{ xs:340, sm:500 } }}>
                  {/* Header */}
                  <Box sx={{ display:'flex', gap:1, mb:1, alignItems:'center' }}>
                    <Typography variant="caption" color="text.secondary" sx={{ flex:1, fontWeight:600 }}>
                      Critère d'évaluation
                    </Typography>
                    {[1,2,3,4].map(v => (
                      <Box key={v} sx={{ width:36, textAlign:'center' }}>
                        <Typography variant="caption" fontWeight={700} color="text.secondary">{v}</Typography>
                      </Box>
                    ))}
                    <Box sx={{ width:28 }} />
                  </Box>

                  {/* Groups */}
                  {groups.map((group, gIdx) => {
                    const hasCat   = !!group.categorie;
                    const isHidden = hasCat && hiddenCategories.has(group.categorie);
                    return (
                      <Box key={gIdx}>
                        {hasCat && (
                          <Box sx={{
                            display:'flex', alignItems:'center', gap:0.5,
                            py:0.5, mt: gIdx > 0 ? 1 : 0,
                            borderBottom:'2px solid', borderColor:'primary.light',
                          }}>
                            <Typography variant="caption" fontWeight={700} color="primary.main"
                              sx={{ flex:1, textTransform:'uppercase', letterSpacing:'0.05em', fontSize:10 }}>
                              {group.categorie}
                            </Typography>
                            <Tooltip title={isHidden ? 'Afficher la catégorie' : 'Masquer la catégorie'}>
                              <IconButton size="small" onClick={() => toggleCategory(group.categorie)} sx={{ p:0.25 }}>
                                {isHidden
                                  ? <VisibilityOutlinedIcon    sx={{ fontSize:16, color:'text.disabled' }} />
                                  : <VisibilityOffOutlinedIcon sx={{ fontSize:16, color:'text.disabled' }} />
                                }
                              </IconButton>
                            </Tooltip>
                          </Box>
                        )}
                        <Collapse in={!isHidden}>
                          {group.criteres.map((c) => (
                            <Box key={c.critereIndex} sx={{
                              display:'flex', gap:1, alignItems:'center', py:0.75,
                              borderBottom:'1px solid', borderColor:'divider',
                              '&:last-child':{ borderBottom:'none' },
                              pl: hasCat ? 1 : 0,
                            }}>
                              <Typography variant="body2" sx={{ flex:1 }}>{c.libelle}</Typography>
                              {[1,2,3,4].map(v => {
                                const selected = currentEval.ratings[c.critereIndex] === v;
                                return (
                                  <Box key={v}
                                    onClick={() => {
                                      const cur = currentEval.ratings[c.critereIndex];
                                      updateRating(evalKey, c.critereIndex, cur === v ? null : v);
                                    }}
                                    sx={{
                                      width:36, height:36, borderRadius:1, border:'1px solid',
                                      borderColor: selected ? 'primary.main' : 'divider',
                                      bgcolor:     selected ? 'primary.main' : 'background.paper',
                                      display:'flex', alignItems:'center', justifyContent:'center',
                                      cursor:'pointer', transition:'all 0.1s',
                                      '&:hover':{ borderColor:'primary.main', bgcolor: selected ? 'primary.dark' : 'primary.light' },
                                    }}
                                  >
                                    <Typography variant="caption" fontWeight={700}
                                      color={selected ? '#fff' : 'text.secondary'}>
                                      {v}
                                    </Typography>
                                  </Box>
                                );
                              })}
                              <Box sx={{ width:28 }} />
                            </Box>
                          ))}
                        </Collapse>
                      </Box>
                    );
                  })}
                </Box>
              </Box>
            ) : (
              <Box sx={{ py:2, mb:2, textAlign:'center', bgcolor:'background.default', borderRadius:1 }}>
                <Typography variant="body2" color="text.secondary">
                  Aucun critère d'évaluation défini pour le jour {activeDay}.
                </Typography>
              </Box>
            )}

            {/* Presence */}
            <Box sx={{ mb:2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                Présence
              </Typography>
              <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
                {PRESENCE_OPTIONS.map(opt => (
                  <Chip key={opt}
                    label={PRESENCE_LABELS[opt]}
                    color={currentEval.presence === opt ? PRESENCE_COLORS[opt] : 'default'}
                    variant={currentEval.presence === opt ? 'filled' : 'outlined'}
                    onClick={() => updateEval(evalKey, { presence: opt })}
                    sx={{ fontWeight: currentEval.presence === opt ? 700 : 400, cursor:'pointer' }}
                  />
                ))}
              </Box>
            </Box>

            {/* ── Hours + Minutes picker ───────────────────────────────────── */}
            <Box sx={{ mb:2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                Durée de présence
              </Typography>
              <HoursMinutesPicker
                value={currentEval.dureeHeures ?? null}
                onChange={(val) => updateEval(evalKey, { dureeHeures: val })}
              />
            </Box>

            {/* Remarks */}
            <Box sx={{ mb:2 }}>
              <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
                Remarques du formateur
              </Typography>
              <Box
                component="textarea"
                value={currentEval.remarks}
                onChange={e => updateEval(evalKey, { remarks: e.target.value })}
                placeholder="Observations, points d'amélioration..."
                sx={{
                  width:'100%', minHeight:80, p:1.5, borderRadius:1,
                  border:'1px solid', borderColor:'divider', fontFamily:'inherit',
                  fontSize:13, resize:'vertical', bgcolor:'background.paper', color:'text.primary',
                  '&:focus':{ outline:'none', borderColor:'primary.main' },
                  boxSizing:'border-box',
                }}
              />
            </Box>

            {/* Actions */}
            <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
              <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}
                startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
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
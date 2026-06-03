import { useState, useMemo, React, Fragment } from 'react';
import {
  Box, Card, CardContent, Typography, Stack, Table, TableBody,
  TableCell, TableHead, TableRow, TextField, Button, IconButton,
  Tooltip, RadioGroup, FormControlLabel, Radio,
} from '@mui/material';
import DeleteIcon   from '@mui/icons-material/Delete';
import EditIcon     from '@mui/icons-material/Edit';
import CheckIcon    from '@mui/icons-material/Check';
import CloseIcon    from '@mui/icons-material/Close';
import AddIcon      from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import {
  ResponsiveContainer, ComposedChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend,
} from 'recharts';

const S3M_ORANGE    = '#ed823b';
const S3M_BLUE      = '#2583c0';
const S3M_DARK_BLUE = '#10426c';

function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{ bgcolor: 'background.paper', border: '1px solid', borderColor: 'divider', borderRadius: 1.5, p: 1.5, boxShadow: 3 }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>{label}</Typography>
      {payload.map(entry => (
        <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
          <Typography variant="caption" color="text.secondary">{entry.name}:</Typography>
          <Typography variant="caption" fontWeight={700}>{entry.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

// ── Inline edit row ───────────────────────────────────────────────────────────
function EditableRow({ session, onSave, onCancel, isAdmin }) {
  const [date, setDate] = useState(session.dateSession);
  const [hours, setHours] = useState(session.dHeures ?? 8);
  const [notes, setNotes] = useState(session.notes ?? '');

  return (
    <TableRow>
      {/* Expand column */}
      <TableCell />

      {/* Date column */}
      <TableCell>
        <TextField
          type="date"
          size="small"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          InputLabelProps={{ shrink: true }}
          sx={{ width: 150 }}
        />
      </TableCell>

      {/* Sessions column */}
      <TableCell>
        <TextField
          type="number"
          size="small"
          value={hours}
          onChange={(e) => setHours(e.target.value)}
          inputProps={{ min: 1, max: 24 }}
          sx={{ width: 90 }}
        />
      </TableCell>

      {/* Heures totales column */}
      <TableCell>
        <TextField
          size="small"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Notes"
          fullWidth
        />
      </TableCell>

      {/* Actions column */}
      {isAdmin && (
        <TableCell align="center">
          <IconButton
            size="small"
            color="primary"
            onClick={() =>
              onSave({
                dateSession: date,
                dHeures: Number(hours),
                notes,
              })
            }
          >
            <CheckIcon fontSize="small" />
          </IconButton>

          <IconButton size="small" onClick={onCancel}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </TableCell>
      )}
    </TableRow>
  );
}

// ── Main ─────────────────────────────────────────────────────────────────────
export default function PlanificationOverview({
  planData, chartData, selectedYear,
  totalPlanifie, totalActual, totalHeures, pct,
  isAdmin, onBulkAdd, onUpdateSession, onDeleteSession,
}) {
  // Bulk-add bar
  const [bulkDate,   setBulkDate]   = useState('');
  const [bulkCount,  setBulkCount]  = useState(1);
  const [bulkHours,  setBulkHours]  = useState(8);
  const [bulkAdding, setBulkAdding] = useState(false);

  // Sessions table
  const [editingId,       setEditingId]       = useState(null);
  const [expandedDates,   setExpandedDates]   = useState({});   // keyed by dateSession string
  const [allExpanded,     setAllExpanded]      = useState(false);

  // Chart mode
  const [chartMode, setChartMode] = useState('sessions'); // 'sessions' | 'heures'

  // ── Group sessions by date ────────────────────────────────────────────────
  const sessions = planData?.sessions ?? [];

  const groupedSessions = useMemo(() => {
    const map = new Map();
    sessions.forEach(s => {
      if (!map.has(s.dateSession)) map.set(s.dateSession, []);
      map.get(s.dateSession).push(s);
    });
    // Sort dates ascending
    return Array.from(map.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [sessions]);

  const toggleDate = (date) =>
    setExpandedDates(prev => ({ ...prev, [date]: !prev[date] }));

  const expandAll = () => {
    const next = {};
    groupedSessions.forEach(([date]) => { next[date] = true; });
    setExpandedDates(next);
    setAllExpanded(true);
  };

  const collapseAll = () => {
    setExpandedDates({});
    setAllExpanded(false);
  };

  const isExpanded = (date) => !!expandedDates[date];

  // ── Chart data switched by mode ───────────────────────────────────────────
  const activeChartData = useMemo(() => {
    if (!chartData?.length) return [];
    if (chartMode === 'sessions') return chartData;
    // hours mode — rebuild from planData
    if (!planData?.planned) return [];
    let cumPlan = 0, cumActual = 0;
    return planData.planned.map((p, i) => {
      const a = planData.actual[i] ?? { heures: 0 };
      cumPlan   += p.heures;
      cumActual += a.heures;
      return {
        name: p.monthLabel,
        'Planifié':         p.heures,
        'Réalisé':          a.heures,
        'Planifié Cumulé':  Math.round(cumPlan   * 100) / 100,
        'Réalisé Cumulé':   Math.round(cumActual * 100) / 100,
      };
    });
  }, [chartMode, chartData, planData]);

  // ── Bulk add ──────────────────────────────────────────────────────────────
  const handleBulkAdd = async () => {
    if (!bulkDate || bulkCount < 1) return;
    setBulkAdding(true);
    try {
      await onBulkAdd({ dateSession: bulkDate, count: Number(bulkCount), dHeures: Number(bulkHours) });
      setBulkDate('');
      setBulkCount(1);
    } finally {
      setBulkAdding(false);
    }
  };

  const handleSaveEdit = async (id, payload) => {
    await onUpdateSession(id, payload);
    setEditingId(null);
  };

  return (
    <Box>
      {/* ── Stat cards ──────────────────────────────────────────────────────── */}
      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ mb: 3, flexWrap: 'wrap' }}>
        {[
          { label: 'Planifié',          value: totalPlanifie,        color: S3M_DARK_BLUE },
          { label: 'Réalisé',           value: totalActual,          color: S3M_BLUE },
          { label: 'Heures réalisées',  value: `${totalHeures}h`,    color: S3M_ORANGE },
          { label: '% atteint',
            value: pct !== null ? `${pct}%` : 'N/A',
            color: pct === null ? '#999' : pct >= 100 ? S3M_BLUE : pct >= 60 ? S3M_ORANGE : '#d32f2f' },
        ].map(({ label, value, color }) => (
          <Box key={label} sx={{ flex: '1 1 130px', p: 2, bgcolor: '#f9f9f9', borderRadius: 1.5, border: '1px solid #e0e0e0' }}>
            <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>{label}</Typography>
            <Typography variant="h6" fontWeight={700} sx={{ color }}>{value}</Typography>
          </Box>
        ))}
      </Stack>

      {/* ── Bulk-add bar (admin only) ────────────────────────────────────────── */}
      {isAdmin && (
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 3 }}>
          <CardContent sx={{ py: '12px !important' }}>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ sm: 'center' }}>
              <TextField
                type="date" size="small" label="Date"
                value={bulkDate} onChange={e => setBulkDate(e.target.value)}
                InputLabelProps={{ shrink: true }}
                sx={{ width: 170 }}
              />
              <TextField
                type="number" size="small" label="Nb sessions"
                value={bulkCount} onChange={e => setBulkCount(e.target.value)}
                inputProps={{ min: 1, max: 100 }}
                sx={{ width: 120 }}
              />
              <TextField
                type="number" size="small" label="Heures/session"
                value={bulkHours} onChange={e => setBulkHours(e.target.value)}
                inputProps={{ min: 1, max: 24 }}
                sx={{ width: 130 }}
              />
              <Button
                variant="contained" startIcon={<AddIcon />}
                onClick={handleBulkAdd}
                disabled={bulkAdding || !bulkDate || bulkCount < 1}
                sx={{ bgcolor: S3M_DARK_BLUE, '&:hover': { bgcolor: S3M_BLUE }, whiteSpace: 'nowrap' }}
              >
                {bulkAdding ? 'Ajout…' : 'Ajouter'}
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}

      {/* ── Sessions table grouped by date ──────────────────────────────────── */}
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 3 }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
            <Typography variant="subtitle1" fontWeight={700} sx={{ color: S3M_DARK_BLUE }}>
              Sessions planifiées — {selectedYear}
              <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                ({sessions.length} session{sessions.length !== 1 ? 's' : ''})
              </Typography>
            </Typography>
            {groupedSessions.length > 0 && (
              <Stack direction="row" spacing={1}>
                <Button size="small" onClick={expandAll}   variant="outlined" sx={{ fontSize: 12 }}>Tout développer</Button>
                <Button size="small" onClick={collapseAll} variant="outlined" sx={{ fontSize: 12 }}>Tout réduire</Button>
              </Stack>
            )}
          </Box>

          {groupedSessions.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              Aucune session planifiée pour cette année.
            </Typography>
          ) : (
            <Box sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                    <TableCell sx={{ fontWeight: 700, color: S3M_ORANGE, width: 40 }} />
                    <TableCell sx={{ fontWeight: 700, color: S3M_ORANGE }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: S3M_DARK_BLUE }}>Sessions</TableCell>
                    <TableCell sx={{ fontWeight: 700, color: S3M_DARK_BLUE }}>Heures totales</TableCell>
                    {isAdmin && <TableCell />}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {groupedSessions.map(([date, rows]) => {
                    const totalH = rows.reduce((s, r) => s + Number(r.dHeures ?? 0), 0);
                    const expanded = isExpanded(date);

                    return (
                      <Fragment key={date}>
                        {/* ── Date group header row ── */}
                        <TableRow
                          key={`group-${date}`}
                          onClick={() => toggleDate(date)}
                          sx={{ cursor: 'pointer', bgcolor: '#fafafa', '&:hover': { bgcolor: '#f0f4f8' } }}
                        >
                          <TableCell sx={{ py: 1 }}>
                            <IconButton size="small" sx={{ p: 0.25 }}>
                              {expanded ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                            </IconButton>
                          </TableCell>
                          <TableCell sx={{ fontWeight: 700, color: S3M_DARK_BLUE, py: 1 }}>{date}</TableCell>
                          <TableCell sx={{ py: 1, color: 'text.secondary', fontSize: 13 }}>{rows.length} session{rows.length !== 1 ? 's' : ''}</TableCell>
                          <TableCell sx={{ py: 1, color: 'text.secondary', fontSize: 13 }}>{totalH}h</TableCell>
                          {isAdmin && <TableCell />}
                        </TableRow>

                        {/* ── Expanded individual rows ── */}
                        {expanded && rows.map(session =>
                          editingId === session.id ? (
                            <EditableRow
                                key={session.id}
                                session={session}
                                isAdmin={isAdmin}
                                onSave={(payload) => handleSaveEdit(session.id, payload)}
                                onCancel={() => setEditingId(null)}
                            />
                          ) : (
                            <TableRow key={session.id} sx={{ bgcolor: '#fff', '&:hover': { bgcolor: '#fafafa' } }}>
                              <TableCell />
                              <TableCell sx={{ color: 'text.secondary', fontSize: 13, pl: 4 }}>└ #{session.id}</TableCell>
                              <TableCell sx={{ fontSize: 13 }}>{session.dHeures}h</TableCell>
                              <TableCell sx={{ fontSize: 13, color: 'text.secondary' }}>{session.notes ?? '—'}</TableCell>
                              {isAdmin && (
                                <TableCell align="center">
                                  <Tooltip title="Modifier">
                                    <IconButton size="small" onClick={e => { e.stopPropagation(); setEditingId(session.id); }}>
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                  <Tooltip title="Supprimer">
                                    <IconButton size="small" color="error"
                                      onClick={e => { e.stopPropagation(); onDeleteSession(session.id); }}>
                                      <DeleteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                </TableCell>
                              )}
                            </TableRow>
                          )
                        )}
                      </Fragment>
                    );
                  })}
                </TableBody>
              </Table>
            </Box>
          )}
        </CardContent>
      </Card>

      {/* ── Chart ───────────────────────────────────────────────────────────── */}
      {activeChartData?.length > 0 && (
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 1, mb: 2 }}>
              <Typography variant="subtitle1" fontWeight={700} sx={{ color: S3M_DARK_BLUE }}>
                Planifié vs Réalisé — {selectedYear}
              </Typography>
              <RadioGroup
                row value={chartMode}
                onChange={e => setChartMode(e.target.value)}
              >
                <FormControlLabel value="sessions" control={<Radio size="small" />} label={<Typography variant="caption">Sessions</Typography>} />
                <FormControlLabel value="heures"   control={<Radio size="small" />} label={<Typography variant="caption">Heures</Typography>} />
              </RadioGroup>
            </Box>
            <Box sx={{ width: '100%', height: { xs: 320, md: 380 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={activeChartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <RechartsTooltip content={<ChartTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Line type="monotone" dataKey="Planifié"        stroke={S3M_ORANGE} strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Réalisé"         stroke={S3M_BLUE}   strokeWidth={2.5} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                  <Line type="monotone" dataKey="Planifié Cumulé" stroke="#d32f2f"    strokeWidth={2}   strokeDasharray="6 3" dot={false} />
                  <Line type="monotone" dataKey="Réalisé Cumulé"  stroke="#54bafd"    strokeWidth={2}   strokeDasharray="6 3" dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </CardContent>
        </Card>
      )}

      {/* ── Monthly summary table ────────────────────────────────────────────── */}
      {planData?.planned && (
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 3 }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2} sx={{ color: S3M_DARK_BLUE }}>
              Détail mensuel
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: '#f5f5f5' }}>
                  <TableCell sx={{ fontWeight: 700, color: S3M_ORANGE }}>Mois</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: S3M_DARK_BLUE }}>Planifié</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: S3M_DARK_BLUE }}>H. planifiées</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: S3M_BLUE }}>Réalisé</TableCell>
                  <TableCell align="right" sx={{ fontWeight: 700, color: S3M_BLUE }}>H. réalisées</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Statut</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {planData.planned.map((p, i) => {
                  const a = planData.actual[i] ?? { sessionCount: 0, heures: 0 };
                  const ratio = p.sessionCount > 0 ? a.sessionCount / p.sessionCount : null;
                  const status   = ratio === null ? 'Aucun objectif' : ratio >= 1 ? 'Atteint' : ratio >= 0.6 ? 'Sur la bonne voie' : 'À améliorer';
                  const statusBg = ratio === null ? '#e6e1e1' : ratio >= 1 ? S3M_BLUE : ratio >= 0.6 ? '#098d14' : S3M_ORANGE;

                  return (
                    <TableRow key={p.month} sx={{ '&:last-child td': { border: 0 }, '&:hover': { bgcolor: '#fafafa' } }}>
                      <TableCell>
                        <Typography variant="body2" fontWeight={700} color={S3M_DARK_BLUE}>{p.monthLabel}</Typography>
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: S3M_DARK_BLUE }}>{p.sessionCount}</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>{p.heures}h</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 600, color: S3M_BLUE }}>{a.sessionCount}</TableCell>
                      <TableCell align="right" sx={{ color: 'text.secondary' }}>{a.heures}h</TableCell>
                      <TableCell align="center">
                        <Box sx={{
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                          px: 1.5, py: 0.5, borderRadius: 2, bgcolor: statusBg,
                          color: '#fff', fontWeight: 700, fontSize: '0.72rem', textTransform: 'uppercase',
                        }}>
                          {status}
                        </Box>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
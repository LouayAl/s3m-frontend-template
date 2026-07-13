import { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid,
  LinearProgress, Button, Chip, Table, TableBody,
  TableCell, TableHead, TableRow, TableContainer,
  Tooltip, Divider, Stack,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import DownloadIcon from '@mui/icons-material/Download';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  ResponsiveContainer, Tooltip as RechartsTooltip,
  Cell, PieChart, Pie, Legend,
} from 'recharts';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import * as XLSX from 'xlsx';
import api from '../../api/axios';

const ACCENT  = '#e65100';
const CORRECT = '#66bb6a';
const WRONG   = '#ef5350';
const TOTAL_Q = 23;

const QUESTIONS = [
  { id: 1,  text: "La sécurité au travail est uniquement la responsabilité de la direction.", correct: 'FAUX' },
  { id: 2,  text: "Signification du panneau (casque)", correct: 'b' },
  { id: 3,  text: "Signification du panneau (charge)", correct: 'a' },
  { id: 4,  text: "Signification du panneau (gilet)", correct: 'a' },
  { id: 5,  text: "Signification du panneau (glissade)", correct: 'c' },
  { id: 6,  text: "Ne pas utiliser l'ascenseur en urgence.", correct: 'VRAI' },
  { id: 7,  text: "N'importe qui peut utiliser un extincteur.", correct: 'FAUX' },
  { id: 8,  text: "Entretien correct d'un extincteur.", correct: 'c' },
  { id: 9,  text: "Sauvetage homme à la mer — première étape.", correct: 'a' },
  { id: 10, text: "Entretien des EPI — responsabilité des opérateurs.", correct: 'VRAI' },
  { id: 11, text: "Signification du panneau (piétons)", correct: 'b' },
  { id: 12, text: "Signification du panneau (rassemblement)", correct: 'c' },
  { id: 13, text: "Signification du panneau (environnement)", correct: 'a' },
  { id: 14, text: "Panneau « Danger, Électricité ».", correct: 'd' },
  { id: 15, text: "Définition maladie professionnelle.", correct: 'b' },
  { id: 16, text: "Forme panneau « Interdiction ».", correct: 'c' },
  { id: 17, text: "Sécurité = bon sens, pas besoin de formation.", correct: 'FAUX' },
  { id: 18, text: "Pas besoin de permission pour premiers soins.", correct: 'FAUX' },
  { id: 19, text: "Scène non sûre : déplacer la victime avant secours.", correct: 'VRAI' },
  { id: 20, text: "Housekeeping prévient glissades et chutes.", correct: 'VRAI' },
  { id: 21, text: "Monter à une échelle — bonne pratique.", correct: 'a' },
  { id: 22, text: "Glissades/chutes les plus courantes en mining.", correct: 'c' },
  { id: 23, text: "Première étape en cas d'urgence.", correct: 'b' },
];

// ── Helpers ───────────────────────────────────────────────────────────────────

function duration(debut, soumis) {
  if (!debut || !soumis) return '—';
  const secs = Math.round((new Date(soumis) - new Date(debut)) / 1000);
  if (secs < 60) return `${secs}s`;
  const m = Math.floor(secs / 60), s = secs % 60;
  return `${m}m ${s < 10 ? '0' : ''}${s}s`;
}

function durationSeconds(debut, soumis) {
  if (!debut || !soumis) return null;
  return Math.round((new Date(soumis) - new Date(debut)) / 1000);
}

function ScoreGauge({ score, total }) {
  const pct   = Math.round((score / total) * 100);
  const color = pct >= 75 ? CORRECT : pct >= 50 ? '#ff9800' : WRONG;
  const circ  = 2 * Math.PI * 40;
  return (
    <Box sx={{ position: 'relative', display: 'inline-flex' }}>
      <svg width={110} height={110} viewBox="0 0 100 100">
        <circle cx="50" cy="50" r="40" fill="none" stroke="#eee" strokeWidth="10" />
        <circle cx="50" cy="50" r="40" fill="none"
          stroke={color} strokeWidth="10" strokeLinecap="round"
          strokeDasharray={`${(pct / 100) * circ} ${circ}`}
          transform="rotate(-90 50 50)"
          style={{ transition: 'stroke-dasharray 0.6s ease' }}
        />
      </svg>
      <Box sx={{ position: 'absolute', inset: 0, display: 'flex',
        flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" fontWeight={700} sx={{ color, lineHeight: 1 }}>
          {score.toFixed(1)}
        </Typography>
        <Typography variant="caption" color="text.secondary">/{total}</Typography>
      </Box>
    </Box>
  );
}

function KpiCard({ label, value, sub, color }) {
  return (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Typography variant="body2" color="text.secondary" gutterBottom>{label}</Typography>
        <Typography variant="h4" fontWeight={700} sx={{ color: color || 'text.primary' }}>
          {value}
        </Typography>
        {sub && <Typography variant="caption" color="text.secondary">{sub}</Typography>}
      </CardContent>
    </Card>
  );
}

// ── Export helpers ─────────────────────────────────────────────────────────────

function exportExcel(stats, barData, wrongData) {
  const wb = XLSX.utils.book_new();

  // Sheet 1: KPIs
  const kpiRows = [
    ['Formation', stats.moduleFormation],
    ['Formateur', stats.formateur],
    ['Réponses reçues', stats.totalReponses],
    ['Total participants', stats.totalParticipants],
    ['Score moyen', `${stats.scoreMoyen}/${TOTAL_Q}`],
    ['Taux de réussite', `${Math.round((stats.scoreMoyen / TOTAL_Q) * 100)}%`],
  ];
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpiRows), 'KPIs');

  // Sheet 2: Results per participant
  const headers = ['Participant', 'Score', 'Durée',
    ...QUESTIONS.map(q => `Q${q.id}`)];
  const rows = stats.reponses.map(r => [
    r.nomEmploye,
    `${r.score}/${TOTAL_Q}`,
    duration(r.debutLe, r.soumisLe),
    ...QUESTIONS.map(q => {
      const given = r.reponses?.[String(q.id)] ?? '—';
      const ok    = given === q.correct;
      return `${given.toUpperCase()} ${ok ? '✓' : '✗'}`;
    }),
  ]);
  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.aoa_to_sheet([headers, ...rows]), 'Résultats');

  // Sheet 3: Questions analysis
  const qHeaders = ['Question', 'Texte', '% Correct', 'Bonnes réponses', 'Total'];
  const qRows = barData.map(d => [
    d.name, d.text, `${d.pct}%`, d.correct, d.total,
  ]);
  XLSX.utils.book_append_sheet(wb,
    XLSX.utils.aoa_to_sheet([qHeaders, ...qRows]), 'Analyse questions');

  XLSX.writeFile(wb, `quiz_${stats.moduleFormation}_session_${stats.idSession}.xlsx`);
}

function exportPdf(stats, barData, wrongData) {
  const doc = new jsPDF();
  const pageW = doc.internal.pageSize.getWidth();

  // Header
  doc.setFillColor(230, 81, 0);
  doc.rect(0, 0, pageW, 28, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('Quiz Sécurité — Rapport de résultats', 14, 12);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Formation: ${stats.moduleFormation}   |   Formateur: ${stats.formateur}`, 14, 22);
  doc.setTextColor(0, 0, 0);

  // KPIs
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Indicateurs clés', 14, 38);
  autoTable(doc, {
    startY: 42,
    head: [['Indicateur', 'Valeur']],
    body: [
      ['Réponses reçues', `${stats.totalReponses} / ${stats.totalParticipants}`],
      ['Score moyen', `${stats.scoreMoyen} / ${TOTAL_Q}`],
      ['Taux de réussite', `${Math.round((stats.scoreMoyen / TOTAL_Q) * 100)}%`],
      ['Taux de participation', `${Math.round((stats.totalReponses / stats.totalParticipants) * 100)}%`],
    ],
    theme: 'grid',
    headStyles: { fillColor: [230, 81, 0] },
    margin: { left: 14, right: 14 },
  });

  // Wrong answers
  doc.setFont('helvetica', 'bold');
  doc.text('Questions les plus ratées', 14, doc.lastAutoTable.finalY + 12);
  autoTable(doc, {
    startY: doc.lastAutoTable.finalY + 16,
    head: [['Question', 'Texte', '% Incorrect']],
    body: wrongData.slice(0, 10).map(d => [
      d.name, d.text, `${d.pctWrong}%`,
    ]),
    theme: 'grid',
    headStyles: { fillColor: [239, 83, 80] },
    margin: { left: 14, right: 14 },
  });

  // Results per participant
  doc.addPage();
  doc.setFillColor(230, 81, 0);
  doc.rect(0, 0, pageW, 18, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Résultats par participant', 14, 12);
  doc.setTextColor(0, 0, 0);

  autoTable(doc, {
    startY: 24,
    head: [['Participant', 'Score', 'Durée', '% Réussite']],
    body: stats.reponses.map(r => [
      r.nomEmploye,
      `${r.score}/${TOTAL_Q}`,
      duration(r.debutLe, r.soumisLe),
      `${Math.round((r.score / TOTAL_Q) * 100)}%`,
    ]),
    theme: 'striped',
    headStyles: { fillColor: [230, 81, 0] },
    margin: { left: 14, right: 14 },
  });

  // Per-question detail per participant
  doc.addPage();
  doc.setFontSize(13);
  doc.setFont('helvetica', 'bold');
  doc.text('Détail des réponses', 14, 14);

  autoTable(doc, {
    startY: 20,
    head: [['Participant', ...QUESTIONS.map(q => `Q${q.id}`)]],
    body: stats.reponses.map(r => [
      r.nomEmploye,
      ...QUESTIONS.map(q => {
        const given = r.reponses?.[String(q.id)] ?? '—';
        return given.toUpperCase();
      }),
    ]),
    theme: 'grid',
    headStyles: { fillColor: [50, 50, 50], fontSize: 7 },
    bodyStyles: { fontSize: 7 },
    margin: { left: 14, right: 14 },
    didParseCell: (data) => {
      if (data.section === 'body' && data.column.index > 0) {
        const rIdx = data.row.index;
        const qIdx = data.column.index - 1;
        const r    = stats.reponses[rIdx];
        const q    = QUESTIONS[qIdx];
        const given = r?.reponses?.[String(q.id)];
        if (given) {
          data.cell.styles.fillColor = given === q.correct
            ? [220, 237, 200] : [255, 205, 210];
        }
      }
    },
  });

  doc.save(`quiz_${stats.moduleFormation}_session_${stats.idSession}.pdf`);
}

// ── Main component ─────────────────────────────────────────────────────────────

export default function QuizStatsPage() {
  const { sessionId } = useParams();
  const navigate      = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/quiz/session/${sessionId}/stats`)
      .then(r => setStats(r.data))
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <Box p={3}><LinearProgress /></Box>;
  if (!stats)  return <Box p={3}><Typography>Données non disponibles.</Typography></Box>;

  // % correct per question
  const barData = QUESTIONS.map(q => {
    const dist    = stats.distribution?.[String(q.id)] ?? {};
    const total   = Object.values(dist).reduce((s, v) => s + v, 0);
    const correct = dist[q.correct] ?? 0;
    const pct     = total > 0 ? Math.round((correct / total) * 100) : 0;
    return { name: `Q${q.id}`, pct, correct, total, text: q.text };
  });

  // Top wrong answers (sorted by % incorrect descending)
  const wrongData = [...barData]
    .map(d => ({ ...d, pctWrong: 100 - d.pct }))
    .sort((a, b) => b.pctWrong - a.pctWrong)
    .slice(0, 10);

  // Participation rate
  const participationPct = stats.totalParticipants > 0
    ? Math.round((stats.totalReponses / stats.totalParticipants) * 100) : 0;

  // Pass rate (score >= 75%)
  const passCount = stats.reponses.filter(r => r.score >= Math.ceil(TOTAL_Q * 0.75)).length;
  const passPct   = stats.totalReponses > 0
    ? Math.round((passCount / stats.totalReponses) * 100) : 0;

  // Avg duration
  const durations = stats.reponses
    .map(r => durationSeconds(r.debutLe, r.soumisLe))
    .filter(Boolean);
  const avgDurSecs = durations.length > 0
    ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length) : null;
  const avgDurLabel = avgDurSecs
    ? `${Math.floor(avgDurSecs / 60)}m ${avgDurSecs % 60 < 10 ? '0' : ''}${avgDurSecs % 60}s`
    : '—';

  // Pie data for pass/fail
  const pieData = [
    { name: 'Réussi (≥75%)', value: passCount, color: CORRECT },
    { name: 'Insuffisant', value: stats.totalReponses - passCount, color: WRONG },
  ];

  return (
    <Box p={3}>
      {/* Header */}
      <Box display="flex" justifyContent="space-between" alignItems="flex-start" mb={2}>
        <Box>
          <Button startIcon={<ArrowBackIcon />}
            onClick={() => navigate('/quiz')} sx={{ mb: 1 }}>
            Retour
          </Button>
          <Typography variant="h4" fontWeight={700}>
            Quiz Sécurité — {stats.moduleFormation}
          </Typography>
          <Typography color="text.secondary">
            Formateur : {stats.formateur} &nbsp;·&nbsp;
            {stats.totalReponses} réponse{stats.totalReponses > 1 ? 's' : ''} sur{' '}
            {stats.totalParticipants} participant{stats.totalParticipants > 1 ? 's' : ''}
          </Typography>
        </Box>
        <Stack direction="row" spacing={1}>
          <Button variant="outlined" startIcon={<DownloadIcon />}
            onClick={() => exportExcel(stats, barData, wrongData)}>
            Excel
          </Button>
          <Button variant="contained" startIcon={<DownloadIcon />}
            onClick={() => exportPdf(stats, barData, wrongData)}
            sx={{ bgcolor: ACCENT, '&:hover': { bgcolor: '#bf360c' } }}>
            PDF
          </Button>
        </Stack>
      </Box>

      {stats.totalReponses === 0 ? (
        <Typography color="text.secondary">
          Aucune réponse reçue pour cette session.
        </Typography>
      ) : (
        <Grid container spacing={3}>

          {/* KPI cards */}
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard label="Score moyen"
              value={`${stats.scoreMoyen}/${TOTAL_Q}`}
              sub={`${Math.round((stats.scoreMoyen / TOTAL_Q) * 100)}% de réussite`}
              color={stats.scoreMoyen / TOTAL_Q >= 0.75 ? CORRECT : WRONG}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard label="Taux de participation"
              value={`${participationPct}%`}
              sub={`${stats.totalReponses} / ${stats.totalParticipants}`}
              color="#1976d2"
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard label="Taux de réussite (≥75%)"
              value={`${passPct}%`}
              sub={`${passCount} participant${passCount > 1 ? 's' : ''}`}
              color={passPct >= 75 ? CORRECT : WRONG}
            />
          </Grid>
          <Grid size={{ xs: 6, sm: 3 }}>
            <KpiCard label="Durée moyenne"
              value={avgDurLabel}
              sub="temps pour compléter le quiz"
            />
          </Grid>

          {/* Score gauge + Pie */}
          <Grid size={{ xs: 12, md: 4 }}>
            <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center', p: 3 }}>
              <ScoreGauge score={stats.scoreMoyen} total={TOTAL_Q} />
              <Typography variant="body2" color="text.secondary" mt={1} mb={2}>
                Score moyen
              </Typography>
              <Divider flexItem />
              <Box mt={2} width="100%">
                <ResponsiveContainer width="100%" height={140}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={55}
                      dataKey="value" label={({ name, percent }) =>
                        `${(percent * 100).toFixed(0)}%`}>
                      {pieData.map((e, i) => (
                        <Cell key={i} fill={e.color} />
                      ))}
                    </Pie>
                    <Legend iconSize={10} />
                  </PieChart>
                </ResponsiveContainer>
              </Box>
            </Card>
          </Grid>

          {/* % correct per question */}
          <Grid size={{ xs: 12, md: 8 }}>
            <Card sx={{ height: '100%' }}>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  % de bonnes réponses par question
                </Typography>
                <ResponsiveContainer width="100%" height={260}>
                  <BarChart data={barData}
                    margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }}
                      tickFormatter={v => `${v}%`} />
                    <RechartsTooltip
                      formatter={(v, _, p) => [
                        `${v}% (${p.payload.correct}/${p.payload.total})`,
                        p.payload.text,
                      ]}
                    />
                    <Bar dataKey="pct" radius={[4, 4, 0, 0]}>
                      {barData.map((e, i) => (
                        <Cell key={i}
                          fill={e.pct >= 75 ? CORRECT : e.pct >= 50 ? '#ff9800' : WRONG}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Top 10 most missed questions */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent>
                <Typography variant="subtitle1" fontWeight={600} mb={1}>
                  Questions les plus ratées (top 10)
                </Typography>
                <ResponsiveContainer width="100%" height={240}>
                  <BarChart data={wrongData} layout="vertical"
                    margin={{ top: 5, right: 30, left: 10, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" domain={[0, 100]}
                      tickFormatter={v => `${v}%`} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name"
                      tick={{ fontSize: 10 }} width={30} />
                    <RechartsTooltip
                      formatter={(v, _, p) => [`${v}% incorrect`, p.payload.text]}
                    />
                    <Bar dataKey="pctWrong" radius={[0, 4, 4, 0]}>
                      {wrongData.map((e, i) => (
                        <Cell key={i}
                          fill={e.pctWrong >= 50 ? WRONG : '#ff9800'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Results per participant */}
          <Grid size={{ xs: 12 }}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Box px={2} py={1.5} display="flex"
                  justifyContent="space-between" alignItems="center">
                  <Typography variant="subtitle1" fontWeight={600}>
                    Résultats par participant
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Score sur {TOTAL_Q}
                  </Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>Participant</TableCell>
                        <TableCell align="center">Score</TableCell>
                        <TableCell align="center">Durée</TableCell>
                        {QUESTIONS.map(q => (
                          <TableCell key={q.id} align="center"
                            sx={{ minWidth: 36, px: 0.5 }}>
                            <Tooltip title={q.text} placement="top">
                              <Typography variant="caption">Q{q.id}</Typography>
                            </Tooltip>
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {stats.reponses.map(r => (
                        <TableRow key={r.idReponse} hover>
                          <TableCell>
                            <Typography variant="body2" noWrap>
                              {r.nomEmploye}
                            </Typography>
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${r.score}/${TOTAL_Q}`}
                              size="small"
                              sx={{
                                bgcolor: r.score >= 17 ? CORRECT
                                  : r.score >= 12 ? '#ff980022' : `${WRONG}22`,
                                color: r.score >= 17 ? 'white'
                                  : r.score >= 12 ? '#e65100' : WRONG,
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <Typography variant="caption">
                              {duration(r.debutLe, r.soumisLe)}
                            </Typography>
                          </TableCell>
                          {QUESTIONS.map(q => {
                            const given   = r.reponses?.[String(q.id)];
                            const correct = given === q.correct;
                            return (
                              <TableCell key={q.id} align="center"
                                sx={{ px: 0.5 }}>
                                {given
                                  ? <Tooltip title={`Répondu: ${given.toUpperCase()} ${correct ? '✓' : `✗ (correct: ${q.correct.toUpperCase()})`}`}>
                                      <Box sx={{
                                        width: 24, height: 24, borderRadius: '50%',
                                        bgcolor: correct ? CORRECT : WRONG,
                                        color: 'white', fontSize: 11, fontWeight: 700,
                                        display: 'flex', alignItems: 'center',
                                        justifyContent: 'center', margin: 'auto',
                                        cursor: 'default',
                                      }}>
                                        {given.toUpperCase().substring(0, 1)}
                                      </Box>
                                    </Tooltip>
                                  : '—'}
                              </TableCell>
                            );
                          })}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>

        </Grid>
      )}
    </Box>
  );
}
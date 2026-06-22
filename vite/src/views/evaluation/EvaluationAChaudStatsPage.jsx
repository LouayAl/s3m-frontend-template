// frontend-template/vite/src/views/evaluation/EvaluationAChaudStatsPage.jsx
import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Grid,
  LinearProgress, Button, Divider, Stack,
  Chip, Table, TableBody, TableCell,
  TableHead, TableRow, TableContainer,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis,
  PolarRadiusAxis, ResponsiveContainer, Tooltip,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import { getEvaluationStats, getSatisfactionKpis } from '../../api/evaluationApi';

// ── Constants ─────────────────────────────────────────────────────────────────

const SECTIONS = [
  { id: 1, label: 'Conditions de réalisation' },
  { id: 2, label: 'Compétences techniques et pédagogiques' },
  { id: 3, label: 'Atteinte des objectifs' },
];

const QUESTIONS = [
  { id: 1,  sectionId: 1, label: "Information sur la formation" },
  { id: 2,  sectionId: 1, label: "Durée et rythme" },
  { id: 3,  sectionId: 1, label: "Documents remis" },
  { id: 4,  sectionId: 1, label: "Aide à l'assimilation" },
  { id: 5,  sectionId: 1, label: "Adaptation au niveau" },
  { id: 6,  sectionId: 1, label: "Conditions matérielles" },
  { id: 7,  sectionId: 2, label: "Compétences techniques formateur" },
  { id: 8,  sectionId: 2, label: "Compétences pédagogiques formateur" },
  { id: 9,  sectionId: 2, label: "Ambiance du groupe" },
  { id: 10, sectionId: 2, label: "Moyens pédagogiques" },
  { id: 11, sectionId: 3, label: "Besoins professionnels" },
  { id: 12, sectionId: 3, label: "Objectifs atteints" },
  { id: 13, sectionId: 3, label: "Amélioration des compétences" },
];

const SCALE_COLORS = ['', '#ef5350', '#ff9800', '#42a5f5', '#66bb6a'];

// ── Helpers ───────────────────────────────────────────────────────────────────

function scoreColor(value) {
  if (value === 0)  return '#bdbdbd';
  if (value >= 3.5) return '#66bb6a';
  if (value >= 2.5) return '#42a5f5';
  if (value >= 1.5) return '#ff9800';
  return '#ef5350';
}

// ── ScoreBar ──────────────────────────────────────────────────────────────────

function ScoreBar({ value, max = 4 }) {
  const pct   = (value / max) * 100;
  const color = scoreColor(value);
  return (
    <Box display="flex" alignItems="center" gap={1}>
      <Box flex={1} sx={{ bgcolor: '#eee', borderRadius: 4, height: 8, overflow: 'hidden' }}>
        <Box sx={{ width: `${pct}%`, bgcolor: color, height: '100%', borderRadius: 4 }} />
      </Box>
      <Typography variant="caption" fontWeight={600} sx={{ minWidth: 32 }}>
        {value}/4
      </Typography>
    </Box>
  );
}

// ── SatisfactionGauge ─────────────────────────────────────────────────────────

function SatisfactionGauge({ label, sublabel, score, totalReponses, isCurrent = false }) {
  const pct   = (score / 4) * 100;
  const color = scoreColor(score);

  return (
    <Card sx={{
      height: '100%',
      border: isCurrent ? `2px solid ${color}` : '1px solid transparent',
      boxShadow: isCurrent ? `0 0 0 3px ${color}22` : undefined,
      transition: 'box-shadow 0.2s',
    }}>
      <CardContent sx={{ textAlign: 'center', py: 3 }}>
        <Box sx={{ position: 'relative', display: 'inline-flex', mb: 1.5 }}>
          <svg width={100} height={100} viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="40" fill="none" stroke="#eeeeee" strokeWidth="10" />
            <circle cx="50" cy="50" r="40" fill="none"
              stroke={color} strokeWidth="10" strokeLinecap="round"
              strokeDasharray={`${(pct / 100) * 251.2} 251.2`}
              transform="rotate(-90 50 50)"
              style={{ transition: 'stroke-dasharray 0.6s ease' }}
            />
          </svg>
          <Box sx={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Typography variant="h6" fontWeight={700} sx={{ color, lineHeight: 1 }}>
              {score > 0 ? score.toFixed(1) : '—'}
            </Typography>
            <Typography variant="caption" color="text.secondary">/4</Typography>
          </Box>
        </Box>
        <Typography variant="subtitle2" fontWeight={700} gutterBottom>{label}</Typography>
        <Typography variant="caption" color="text.secondary" display="block">{sublabel}</Typography>
        {totalReponses > 0 && (
          <Chip
            label={`${totalReponses} réponse${totalReponses > 1 ? 's' : ''}`}
            size="small"
            sx={{ mt: 1, bgcolor: `${color}18`, color }}
          />
        )}
        {isCurrent && (
          <Chip label="Session actuelle" size="small" color="primary" variant="outlined"
            sx={{ mt: 0.5, display: 'block', mx: 'auto', width: 'fit-content' }} />
        )}
      </CardContent>
    </Card>
  );
}

// ── KPIBenchmarkPanel ─────────────────────────────────────────────────────────

function KPIBenchmarkPanel({ sessionId, moduleFormation }) {
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    getSatisfactionKpis(sessionId).then(setKpis);
  }, [sessionId]);

  if (!kpis) return null;

  return (
    <Box mb={4}>
      <Typography variant="h6" fontWeight={700} mb={0.5}>Benchmarks de satisfaction</Typography>
      <Typography variant="body2" color="text.secondary" mb={2}>
        Comparaison de la session avec les niveaux formation, client et global S3M
      </Typography>
      <Grid container spacing={2}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SatisfactionGauge label="Global S3M" sublabel="Toutes sessions confondues"
            score={kpis.satisfactionGlobaleS3M} totalReponses={kpis.totalReponsesS3M} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SatisfactionGauge label="Client" sublabel="Toutes formations du client"
            score={kpis.satisfactionClientGlobale} totalReponses={kpis.totalReponsesClient} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SatisfactionGauge label={moduleFormation} sublabel="Cette formation (client)"
            score={kpis.satisfactionParFormation} totalReponses={kpis.totalReponsesFormation} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <SatisfactionGauge label="Session actuelle" sublabel="Cette session uniquement"
            score={kpis.satisfactionSession} totalReponses={kpis.totalReponsesSession} isCurrent />
        </Grid>
      </Grid>
    </Box>
  );
}

// ── StatsPanel — flat view of all responses for a session ─────────────────────

function StatsPanel({ stats }) {
  const moyennesParQuestion = stats.moyennesParQuestion ?? {};

  const radarData = SECTIONS.map(section => {
    const qIds = QUESTIONS.filter(q => q.sectionId === section.id).map(q => q.id);
    const avg  = qIds.reduce((sum, id) => sum + (moyennesParQuestion[id] ?? 0), 0) / qIds.length;
    return { section: section.label.split(' ')[0], moyenne: Math.round(avg * 10) / 10 };
  });

  const barData = QUESTIONS.map(q => ({
    name:    `Q${q.id}`,
    moyenne: moyennesParQuestion[q.id] ?? 0,
    label:   q.label,
  }));

  return (
    <Grid container spacing={3}>

      {/* Global score */}
      <Grid size={{ xs: 12, md: 3 }}>
        <Card sx={{
          textAlign: 'center', p: 3, height: '100%',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', alignItems: 'center',
        }}>
          <Typography variant="h2" fontWeight={700} color="primary">
            {stats.moyenneGlobale}
          </Typography>
          <Typography variant="body2" color="text.secondary">/4 — Moyenne globale</Typography>
          <Typography variant="caption" color="text.secondary" mt={1}>
            {stats.totalReponses} réponse{stats.totalReponses > 1 ? 's' : ''}
          </Typography>
        </Card>
      </Grid>

      {/* Radar by section */}
      <Grid size={{ xs: 12, md: 4 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Vue par section</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="section" tick={{ fontSize: 11 }} />
                <PolarRadiusAxis domain={[0, 4]} tick={{ fontSize: 9 }} />
                <Radar name="Moyenne" dataKey="moyenne"
                  stroke="#1976d2" fill="#1976d2" fillOpacity={0.3} />
                <Tooltip formatter={v => [`${v}/4`]} />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Bar chart by question */}
      <Grid size={{ xs: 12, md: 5 }}>
        <Card sx={{ height: '100%' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={600} mb={1}>Score par question</Typography>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={barData} margin={{ top: 5, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 10 }} />
                <YAxis domain={[0, 4]} tick={{ fontSize: 10 }} />
                <Tooltip formatter={(v, _, props) => [`${v}/4`, props.payload.label]} />
                <Bar dataKey="moyenne" fill="#1976d2" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Detailed table by section */}
      {SECTIONS.map(section => {
        const sectionQuestions = QUESTIONS.filter(q => q.sectionId === section.id);
        return (
          <Grid size={{ xs: 12 }} key={section.id}>
            <Card>
              <CardContent sx={{ p: 0 }}>
                <Box sx={{ bgcolor: '#1a1a2e', color: 'white', px: 2, py: 1.5 }}>
                  <Typography fontWeight={700}>{section.label}</Typography>
                </Box>
                <TableContainer>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'action.hover' }}>
                        <TableCell>Question</TableCell>
                        <TableCell width={200}>Moyenne</TableCell>
                        <TableCell width={80} align="center">Score</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {sectionQuestions.map(q => (
                        <TableRow key={q.id} hover>
                          <TableCell>
                            <Typography variant="body2">{q.label}</Typography>
                          </TableCell>
                          <TableCell>
                            <ScoreBar value={moyennesParQuestion[q.id] ?? 0} />
                          </TableCell>
                          <TableCell align="center">
                            <Chip
                              label={`${moyennesParQuestion[q.id] ?? 0}/4`}
                              size="small"
                              color={
                                (moyennesParQuestion[q.id] ?? 0) >= 3.5 ? 'success'
                                : (moyennesParQuestion[q.id] ?? 0) >= 2.5 ? 'primary'
                                : 'warning'
                              }
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </CardContent>
            </Card>
          </Grid>
        );
      })}

      {/* Participants detail table */}
      <Grid size={{ xs: 12 }}>
        <Card>
          <CardContent sx={{ p: 0 }}>
            <Box px={2} py={1.5}>
              <Typography variant="subtitle1" fontWeight={600}>Détail par participant</Typography>
            </Box>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow sx={{ bgcolor: 'action.hover' }}>
                    <TableCell>Participant</TableCell>
                    {QUESTIONS.map(q => (
                      <TableCell key={q.id} align="center" sx={{ minWidth: 40, px: 0.5 }}>
                        <Typography variant="caption" title={q.label}>Q{q.id}</Typography>
                      </TableCell>
                    ))}
                    <TableCell>Commentaire</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {(stats.reponses ?? []).map(r => (
                    <TableRow key={r.idEvalChaud} hover>
                      <TableCell>
                        <Typography variant="body2" noWrap>{r.nomEmploye}</Typography>
                      </TableCell>
                      {QUESTIONS.map(q => {
                        const rep   = r.reponses?.find(rep => rep.idQuestion === q.id);
                        const score = rep?.score ?? null;
                        return (
                          <TableCell key={q.id} align="center" sx={{ px: 0.5 }}>
                            {score != null ? (
                              <Box sx={{
                                width: 28, height: 28, borderRadius: '50%',
                                bgcolor: SCALE_COLORS[score], color: 'white',
                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                margin: 'auto', fontSize: 12, fontWeight: 700,
                              }}>
                                {score}
                              </Box>
                            ) : '—'}
                          </TableCell>
                        );
                      })}
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {r.commentaire || '—'}
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>
      </Grid>

      {/* Free comments */}
      {(stats.reponses ?? []).some(r => r.commentaire) && (
        <Grid size={{ xs: 12 }}>
          <Card>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Commentaires libres</Typography>
              <Stack spacing={2} divider={<Divider />}>
                {(stats.reponses ?? []).filter(r => r.commentaire).map(r => (
                  <Box key={r.idEvalChaud}>
                    <Typography variant="caption" color="text.secondary">{r.nomEmploye}</Typography>
                    <Typography variant="body2" mt={0.5}>{r.commentaire}</Typography>
                  </Box>
                ))}
              </Stack>
            </CardContent>
          </Card>
        </Grid>
      )}
    </Grid>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function EvaluationAChaudStatsPage() {
  const { sessionId } = useParams();
  const navigate      = useNavigate();
  const [stats,   setStats]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getEvaluationStats(sessionId)
      .then(setStats)
      .finally(() => setLoading(false));
  }, [sessionId]);

  if (loading) return <Box p={3}><LinearProgress /></Box>;
  if (!stats)  return <Box p={3}><Typography>Données non disponibles.</Typography></Box>;

  return (
    <Box p={3}>
      <Button startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/evaluations-a-chaud')} sx={{ mb: 2 }}>
        Retour
      </Button>

      <Typography variant="h4" fontWeight={700} mb={0.5}>{stats.moduleFormation}</Typography>
      <Typography color="text.secondary" mb={1}>
        {stats.totalReponses} réponse{stats.totalReponses > 1 ? 's' : ''} sur{' '}
        {stats.totalParticipants} participant{stats.totalParticipants > 1 ? 's' : ''}
      </Typography>
      <Chip
        label={`Moyenne globale: ${stats.moyenneGlobale}/4`}
        color="primary" sx={{ mb: 3 }}
      />

      <KPIBenchmarkPanel
        sessionId={sessionId}
        moduleFormation={stats.moduleFormation}
      />

      <Divider sx={{ mb: 3 }} />

      {stats.totalReponses > 0 ? (
        <StatsPanel stats={stats} />
      ) : (
        <Typography color="text.secondary">
          Aucune évaluation reçue pour cette session.
        </Typography>
      )}
    </Box>
  );
}
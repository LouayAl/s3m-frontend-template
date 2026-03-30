// frontend-template/vite/src/views/equipment-manager/EMEvaluationsPage.jsx
import { useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, FormControl, InputLabel, Select, MenuItem,
  Chip, Table, TableHead, TableBody, TableRow, TableCell,
  Button, Snackbar, Alert, LinearProgress, Dialog, DialogTitle,
  DialogContent, DialogActions, Avatar, Divider, Tooltip,
} from '@mui/material';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AssessmentOutlinedIcon from '@mui/icons-material/AssessmentOutlined';
import AddEvaluationModal from './components/AddEvaluationModal';

const PRESENCE_LABELS = { PRESENT: 'Présent', ABSENT: 'Absent', RETARD: 'Retard' };
const PRESENCE_COLORS = { PRESENT: 'success', ABSENT: 'error', RETARD: 'warning' };

// ── Dummy data ────────────────────────────────────────────────────────────────
const DUMMY_SESSIONS = [
  {
    id: 1,
    formation: 'RTG Operator Training',
    reference: 'RTG-2026-01',
    groupe: 'Groupe A',
    dateDebut: '2026-01-12',
    dateFin: '2026-01-26',
    dureeJours: 15,
    joursAtteint: 3,
    statut: 'EN_COURS',
    participants: [
      { id: 1, nom: 'Alaoui', prenom: 'Karim', matricule: '1217' },
      { id: 2, nom: 'Benjelloun', prenom: 'Sara', matricule: '1271' },
    ],
    evaluations: {
      '1-1': { ratings: { 0:4,1:3,2:4,3:3,4:4,5:3,6:4,7:4,8:3,9:3,10:4,11:4 }, presence: 'PRESENT', remarks: 'Good first day.' },
      '2-1': { ratings: { 0:3,1:3,2:3,3:4,4:3,5:3,6:3,7:3,8:4,9:3,10:3,11:3 }, presence: 'PRESENT', remarks: 'Needs more practice.' },
      '1-2': { ratings: { 0:4,1:4,2:3,3:4,4:4 }, presence: 'PRESENT', remarks: 'Excellent trolley control.' },
      '2-2': { ratings: { 0:3,1:3,2:3,3:3,4:3 }, presence: 'RETARD', remarks: '' },
      '1-3': { ratings: { 0:4,1:4,2:4,3:4 }, presence: 'PRESENT', remarks: 'Precise spreader control.' },
      '2-3': { ratings: { 0:3,1:3,2:3,3:3 }, presence: 'PRESENT', remarks: '' },
    },
  },
  {
    id: 2,
    formation: 'Sécurité au travail',
    reference: 'SEC-2026-01',
    groupe: 'Groupe A',
    dateDebut: '2026-01-10',
    dateFin: '2026-01-14',
    dureeJours: 5,
    joursAtteint: 5,
    statut: 'TERMINEE',
    participants: [
      { id: 3, nom: 'Jout', prenom: 'Anouar', matricule: '1656' },
      { id: 4, nom: 'Marahbani', prenom: 'Otmane', matricule: '1527' },
    ],
    evaluations: {
      '3-1': { ratings: { 0:4,1:4,2:3,3:4 }, presence: 'PRESENT', remarks: 'Excellent.' },
      '4-1': { ratings: { 0:0,1:0,2:0,3:0 }, presence: 'ABSENT', remarks: 'Absent.' },
      '3-2': { ratings: { 0:4,1:3,2:4,3:3 }, presence: 'PRESENT', remarks: '' },
      '4-2': { ratings: { 0:3,1:4,2:3,3:4 }, presence: 'PRESENT', remarks: '' },
      '3-3': { ratings: { 0:4,1:4,2:4,3:4 }, presence: 'PRESENT', remarks: '' },
      '4-3': { ratings: { 0:3,1:3,2:3,3:3 }, presence: 'PRESENT', remarks: '' },
      '3-4': { ratings: { 0:4,1:4,2:4,3:4 }, presence: 'PRESENT', remarks: '' },
      '4-4': { ratings: { 0:4,1:3,2:4,3:3 }, presence: 'PRESENT', remarks: '' },
      '3-5': { ratings: { 0:4,1:4,2:4,3:4 }, presence: 'PRESENT', remarks: 'Ready for certification.' },
      '4-5': { ratings: { 0:3,1:3,2:4,3:3 }, presence: 'PRESENT', remarks: 'Good progress.' },
    },
  },
];

// ── Helpers ───────────────────────────────────────────────────────────────────
function avgRating(ratings) {
  const vals = Object.values(ratings ?? {});
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

function participantAvg(sessionEvals, participantId, totalDays) {
  let total = 0; let count = 0;
  for (let d = 1; d <= totalDays; d++) {
    const ev = sessionEvals[`${participantId}-${d}`];
    if (ev) { const a = avgRating(ev.ratings); if (a !== null) { total += a; count++; } }
  }
  return count ? (total / count) : null;
}

function RatingBadge({ value }) {
  if (value === null || value === undefined) return <Typography variant="caption" color="text.disabled">—</Typography>;
  const color = value >= 3.5 ? '#2e7d32' : value >= 2.5 ? '#e65100' : '#c62828';
  const bg    = value >= 3.5 ? '#e8f5e9' : value >= 2.5 ? '#fff3e0' : '#ffebee';
  return (
    <Box sx={{ display:'inline-flex', alignItems:'center', gap:0.5, px:1, py:0.25, borderRadius:1, bgcolor:bg }}>
      <Typography variant="caption" fontWeight={700} sx={{ color }}>{value.toFixed(1)}/4</Typography>
    </Box>
  );
}

const STATUS_CONFIG = {
  EN_COURS:  { label: 'En cours',  color: 'success' },
  PLANIFIEE: { label: 'Planifiée', color: 'warning' },
  TERMINEE:  { label: 'Terminée',  color: 'error' },
};

// ── Participant Progress Dialog ────────────────────────────────────────────────
function ParticipantProgressDialog({ open, onClose, participant, session }) {
  if (!participant || !session) return null;

  const evaluatedDays = [];
  for (let d = 1; d <= session.joursAtteint; d++) {
    const ev = session.evaluations[`${participant.id}-${d}`];
    if (ev) evaluatedDays.push({ day: d, ev });
  }

  // Collect all unique criterion indices across all days
  const allCriteria = [...new Set(
    evaluatedDays.flatMap(({ ev }) => Object.keys(ev.ratings).map(Number))
  )].sort((a, b) => a - b);

  const overallAvg = participantAvg(session.evaluations, participant.id, session.joursAtteint);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
          <Avatar sx={{ bgcolor:'primary.main', width:36, height:36, fontSize:14 }}>
            {participant.prenom[0]}{participant.nom[0]}
          </Avatar>
          <Box>
            <Typography variant="h6" fontWeight={700}>{participant.prenom} {participant.nom}</Typography>
            <Typography variant="caption" color="text.secondary">
              {session.formation} · {session.groupe} · Matricule: {participant.matricule}
            </Typography>
          </Box>
          <Box sx={{ ml:'auto', display:'flex', gap:1, alignItems:'center' }}>
            <RatingBadge value={overallAvg} />
            <Chip label={`${evaluatedDays.length}/${session.dureeJours} jours`} size="small" color="primary" variant="outlined" />
          </Box>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {evaluatedDays.length === 0 && (
          <Typography color="text.secondary" textAlign="center" py={4}>Aucune évaluation pour ce participant.</Typography>
        )}
        {evaluatedDays.length > 0 && (
          <Box sx={{ overflowX:'auto' }}>
            <Table size="small" sx={{ minWidth: 600 }}>
              <TableHead>
                <TableRow sx={{ bgcolor:'background.default' }}>
                  <TableCell sx={{ fontWeight:700, minWidth:200 }}>Compétence</TableCell>
                  {evaluatedDays.map(({ day, ev }) => (
                    <TableCell key={day} align="center" sx={{ fontWeight:700, minWidth:70 }}>
                      <Box>
                        <Typography variant="caption" fontWeight={700} display="block">Jour {day}</Typography>
                        <Chip
                          label={PRESENCE_LABELS[ev.presence]}
                          color={PRESENCE_COLORS[ev.presence]}
                          size="small"
                          sx={{ fontSize:9, height:16, mt:0.25 }}
                        />
                      </Box>
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight:700 }}>Moy.</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {allCriteria.map((cIdx) => {
                  const dayScores = evaluatedDays.map(({ ev }) => ev.ratings[cIdx] ?? null);
                  const validScores = dayScores.filter(v => v !== null);
                  const cMoy = validScores.length ? validScores.reduce((a,b)=>a+b,0)/validScores.length : null;
                  return (
                    <TableRow key={cIdx} hover>
                      <TableCell sx={{ fontSize:12 }}>Compétence {cIdx + 1}</TableCell>
                      {dayScores.map((score, i) => (
                        <TableCell key={i} align="center">
                          {score !== null ? (
                            <Box sx={{
                              width:28, height:28, borderRadius:'50%', mx:'auto',
                              display:'flex', alignItems:'center', justifyContent:'center',
                              bgcolor: score>=3.5?'#e8f5e9':score>=2.5?'#fff3e0':'#ffebee',
                              border:'2px solid', borderColor: score>=3.5?'#4caf50':score>=2.5?'#ff9800':'#f44336',
                            }}>
                              <Typography variant="caption" fontWeight={700}
                                sx={{ color: score>=3.5?'#2e7d32':score>=2.5?'#e65100':'#c62828' }}
                              >{score}</Typography>
                            </Box>
                          ) : (
                            <Typography variant="caption" color="text.disabled">—</Typography>
                          )}
                        </TableCell>
                      ))}
                      <TableCell align="center"><RatingBadge value={cMoy} /></TableCell>
                    </TableRow>
                  );
                })}
                {/* Day average row */}
                <TableRow sx={{ bgcolor:'background.default' }}>
                  <TableCell sx={{ fontWeight:700, fontSize:12 }}>Moyenne du jour</TableCell>
                  {evaluatedDays.map(({ day, ev }) => {
                    const avg = avgRating(ev.ratings);
                    return (
                      <TableCell key={day} align="center"><RatingBadge value={avg} /></TableCell>
                    );
                  })}
                  <TableCell align="center"><RatingBadge value={overallAvg} /></TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Box>
        )}

        {/* Remarks per day */}
        {evaluatedDays.some(({ ev }) => ev.remarks) && (
          <Box mt={2}>
            <Typography variant="subtitle2" fontWeight={700} mb={1}>Remarques du formateur</Typography>
            {evaluatedDays.filter(({ ev }) => ev.remarks).map(({ day, ev }) => (
              <Box key={day} sx={{ mb:1, p:1.5, bgcolor:'background.default', borderRadius:1, borderLeft:'3px solid', borderColor:'primary.main' }}>
                <Typography variant="caption" fontWeight={700} color="primary.main">Jour {day}</Typography>
                <Typography variant="body2" sx={{ mt:0.25 }}>{ev.remarks}</Typography>
              </Box>
            ))}
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        <Button variant="contained" onClick={() => alert('Export PDF - en développement')}>Exporter PDF</Button>
      </DialogActions>
    </Dialog>
  );
}

// ── Session Detail Dialog ─────────────────────────────────────────────────────
function SessionDetailDialog({ open, onClose, session }) {
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  if (!session) return null;

  const participantsWithStats = session.participants.map(p => {
    const avg = participantAvg(session.evaluations, p.id, session.joursAtteint);
    const daysEvaluated = Array.from({ length: session.joursAtteint }, (_, i) => i + 1)
      .filter(d => !!session.evaluations[`${p.id}-${d}`]).length;
    const absences = Array.from({ length: session.joursAtteint }, (_, i) => i + 1)
      .filter(d => session.evaluations[`${p.id}-${d}`]?.presence === 'ABSENT').length;
    return { ...p, avg, daysEvaluated, absences };
  });

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        {/* Session header */}
        <DialogTitle sx={{ pb:1, bgcolor:'primary.main', color:'#fff' }}>
          <Typography variant="h6" fontWeight={700}>{session.formation}</Typography>
          <Typography variant="caption" sx={{ opacity:0.85 }}>
            {session.groupe} · {session.dateDebut} → {session.dateFin} · {session.dureeJours} jours
          </Typography>
        </DialogTitle>
        <DialogContent dividers>
          {/* Session KPIs */}
          <Grid container spacing={2} mb={2}>
            {[
              { label:'Participants', value: session.participants.length, icon:<GroupOutlinedIcon/>, color:'#1a5276' },
              { label:'Jours atteints', value:`${session.joursAtteint}/${session.dureeJours}`, icon:<CalendarTodayOutlinedIcon/>, color:'#f5821f' },
              { label:'Progression', value:`${Math.round((session.joursAtteint/session.dureeJours)*100)}%`, icon:<TrendingUpIcon/>, color:'#2e7d32' },
              { label:'Statut', value: STATUS_CONFIG[session.statut]?.label, icon:<AssessmentOutlinedIcon/>, color:'#7b1fa2' },
            ].map(k => (
              <Grid key={k.label} item xs={6} sm={3}>
                <Box sx={{ p:1.5, borderRadius:2, border:'1px solid', borderColor:'divider', bgcolor:'background.paper', textAlign:'center' }}>
                  <Box sx={{ color:k.color, mb:0.5 }}>{k.icon}</Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color:k.color }}>{k.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{k.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <LinearProgress
            variant="determinate"
            value={Math.round((session.joursAtteint/session.dureeJours)*100)}
            sx={{ height:6, borderRadius:3, mb:2 }}
            color="primary"
          />

          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
            Participants — cliquer pour voir le détail des évaluations
          </Typography>

          <Table size="small">
            <TableHead sx={{ bgcolor:'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight:700 }}>Participant</TableCell>
                <TableCell sx={{ fontWeight:700 }}>Matricule</TableCell>
                <TableCell sx={{ fontWeight:700 }} align="center">Jours évalués</TableCell>
                <TableCell sx={{ fontWeight:700 }} align="center">Absences</TableCell>
                <TableCell sx={{ fontWeight:700 }} align="center">Note moy.</TableCell>
                <TableCell sx={{ fontWeight:700 }} align="center">Progression</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {participantsWithStats.map(p => {
                const pct = p.avg !== null ? (p.avg / 4) * 100 : 0;
                return (
                  <TableRow
                    key={p.id} hover
                    sx={{ cursor:'pointer', '&:hover':{ bgcolor:'primary.light' } }}
                    onClick={() => setSelectedParticipant(p)}
                  >
                    <TableCell>
                      <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                        <Avatar sx={{ width:28, height:28, bgcolor:'primary.main', fontSize:11 }}>
                          {p.prenom[0]}{p.nom[0]}
                        </Avatar>
                        <Typography variant="body2" fontWeight={600}>{p.prenom} {p.nom}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell><Typography variant="caption" color="text.secondary">{p.matricule}</Typography></TableCell>
                    <TableCell align="center">
                      <Chip label={`${p.daysEvaluated}/${session.joursAtteint}`} size="small"
                        color={p.daysEvaluated === session.joursAtteint ? 'success' : 'default'} />
                    </TableCell>
                    <TableCell align="center">
                      {p.absences > 0
                        ? <Chip label={p.absences} size="small" color="error" />
                        : <Typography variant="caption" color="text.disabled">0</Typography>}
                    </TableCell>
                    <TableCell align="center"><RatingBadge value={p.avg} /></TableCell>
                    <TableCell sx={{ minWidth:120 }}>
                      <LinearProgress variant="determinate" value={pct}
                        color={pct>=75?'success':pct>=50?'warning':'error'}
                        sx={{ height:6, borderRadius:3 }} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <ParticipantProgressDialog
        open={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        participant={selectedParticipant}
        session={session}
      />
    </>
  );
}

// ── Main Component ────────────────────────────────────────────────────────────
export default function EMEvaluationsPage() {
  const [filterFormation, setFilterFormation]   = useState('');
  const [filterStatut, setFilterStatut]         = useState('');
  const [selectedSession, setSelectedSession]   = useState(null);
  const [openModal, setOpenModal]               = useState(false);
  const [sessions, setSessions]                 = useState(DUMMY_SESSIONS);
  const [snackbar, setSnackbar]                 = useState({ open:false, message:'', severity:'success' });

  const formations = [...new Set(sessions.map(s => s.formation))];

  const filtered = useMemo(() => sessions.filter(s => {
    if (filterFormation && s.formation !== filterFormation) return false;
    if (filterStatut    && s.statut    !== filterStatut)    return false;
    return true;
  }), [sessions, filterFormation, filterStatut]);

  const handleExport = () => {
    const data = filtered.map(s => ({
      'Formation':       s.formation,
      'Référence':       s.reference,
      'Groupe':          s.groupe,
      'Date début':      s.dateDebut,
      'Date fin':        s.dateFin,
      'Durée (jours)':   s.dureeJours,
      'Jours atteints':  s.joursAtteint,
      'Participants':    s.participants.length,
      'Statut':          STATUS_CONFIG[s.statut]?.label ?? s.statut,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Évaluations');
    saveAs(new Blob([XLSX.write(wb,{ bookType:'xlsx', type:'array' })],
      { type:'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Export_Evaluations_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleAddEvaluation = (data) => {
    setSnackbar({ open:true, message:'Évaluation ajoutée avec succès', severity:'success' });
  };

  // KPIs
  const totalSessions    = sessions.length;
  const enCours          = sessions.filter(s => s.statut === 'EN_COURS').length;
  const terminees        = sessions.filter(s => s.statut === 'TERMINEE').length;
  const totalParticipants = [...new Set(sessions.flatMap(s => s.participants.map(p => p.id)))].length;

  return (
    <Box>
      {/* Header */}
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3, flexWrap:'wrap', gap:1 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Évaluations</Typography>
          <Typography variant="body2" color="text.secondary">
            Cliquez sur une session pour voir le détail des participants et leur progression.
          </Typography>
        </Box>
        <Box sx={{ display:'flex', gap:1, flexWrap:'wrap' }}>
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            Ajouter une évaluation
          </Button>
          <Button variant="contained" sx={{ bgcolor:'#4CAF50','&:hover':{bgcolor:'#43A047'} }} onClick={handleExport}>
            Export Excel
          </Button>
        </Box>
      </Box>

      {/* KPI cards */}
      <Grid container spacing={2} mb={3}>
        {[
          { label:'Sessions évaluées', value:totalSessions, color:'primary.main', bg:'primary.light' },
          { label:'En cours',          value:enCours,        color:'success.main', bg:'success.light' },
          { label:'Terminées',         value:terminees,      color:'error.main',   bg:'error.light' },
          { label:'Participants total', value:totalParticipants, color:'#7b1fa2', bg:'#f3e5f5' },
        ].map(k => (
          <Grid key={k.label} item xs={6} sm={3}>
            <Card sx={{ borderRadius:2, boxShadow:'none', border:'1px solid', borderColor:'divider',
              background:`linear-gradient(135deg, ${k.bg} 0%, #fff 100%)` }}>
              <CardContent sx={{ p:2,'&:last-child':{pb:2} }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color:k.color }}>{k.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      {/* Filters */}
      <Card sx={{ borderRadius:2, boxShadow:'none', border:'1px solid', borderColor:'divider', mb:2 }}>
        <CardContent sx={{ py:1.5,'&:last-child':{pb:1.5} }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Formation</InputLabel>
                <Select value={filterFormation} label="Formation" sx={{ minWidth: 140 }} onChange={e=>setFilterFormation(e.target.value)}>
                  <MenuItem value="">Toutes</MenuItem>
                  {formations.map(f=><MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select value={filterStatut} label="Statut" sx={{ minWidth: 140 }} onChange={e=>setFilterStatut(e.target.value)}>
                  <MenuItem value="">Tous</MenuItem>
                  {Object.entries(STATUS_CONFIG).map(([k,v])=>(
                    <MenuItem key={k} value={k}>{v.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" size="small" sx={{ minWidth: 140 }} onClick={()=>{setFilterFormation('');setFilterStatut('');}}>
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Sessions table */}
      <Card sx={{ borderRadius:2, boxShadow:'none', border:'1px solid', borderColor:'divider' }}>
        <Box sx={{ overflowX:'auto' }}>
          <Table>
            <TableHead sx={{ bgcolor:'background.default' }}>
              <TableRow>
                <TableCell sx={{ fontWeight:700 }}>Formation</TableCell>
                <TableCell sx={{ fontWeight:700 }}>Groupe</TableCell>
                <TableCell sx={{ fontWeight:700 }}>Dates</TableCell>
                <TableCell sx={{ fontWeight:700 }} align="center">Participants</TableCell>
                <TableCell sx={{ fontWeight:700 }} align="center">Jours atteints</TableCell>
                <TableCell sx={{ fontWeight:700 }} align="center">Progression</TableCell>
                <TableCell sx={{ fontWeight:700 }} align="center">Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map(s => {
                const pct = Math.round((s.joursAtteint / s.dureeJours) * 100);
                return (
                  <TableRow
                    key={s.id} hover
                    sx={{ cursor:'pointer', '&:hover':{ bgcolor:'primary.light' } }}
                    onClick={() => setSelectedSession(s)}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={600}>{s.formation}</Typography>
                      <Typography variant="caption" color="text.secondary">{s.reference}</Typography>
                    </TableCell>
                    <TableCell>{s.groupe}</TableCell>
                    <TableCell>
                      <Typography variant="caption" color="text.secondary">{s.dateDebut} → {s.dateFin}</Typography>
                    </TableCell>
                    <TableCell align="center">
                      <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0.5 }}>
                        <GroupOutlinedIcon sx={{ fontSize:14, color:'text.secondary' }} />
                        <Typography variant="body2" fontWeight={600}>{s.participants.length}</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip label={`${s.joursAtteint} / ${s.dureeJours}`} size="small"
                        color={s.joursAtteint === s.dureeJours ? 'success' : 'primary'} variant="outlined" />
                    </TableCell>
                    <TableCell sx={{ minWidth:140 }}>
                      <Box>
                        <LinearProgress variant="determinate" value={pct}
                          color={pct===100?'success':pct>=50?'warning':'primary'}
                          sx={{ height:6, borderRadius:3, mb:0.5 }} />
                        <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="center">
                      <Chip
                        label={STATUS_CONFIG[s.statut]?.label ?? s.statut}
                        color={STATUS_CONFIG[s.statut]?.color ?? 'default'}
                        size="small" sx={{ fontWeight:700 }}
                      />
                    </TableCell>
                  </TableRow>
                );
              })}
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py:5, color:'text.secondary' }}>
                    Aucune session trouvée.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </Box>
        <Box sx={{ px:2, py:1.5, borderTop:'1px solid', borderColor:'divider', display:'flex', justifyContent:'flex-end' }}>
          <Typography variant="caption" color="text.secondary">{filtered.length} session{filtered.length!==1?'s':''}</Typography>
        </Box>
      </Card>

      <SessionDetailDialog
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
      />

      <AddEvaluationModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSubmit={handleAddEvaluation}
      />

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(p=>({...p,open:false}))}
        anchorOrigin={{ vertical:'top', horizontal:'center' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
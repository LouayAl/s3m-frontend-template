// frontend-template/vite/src/views/equipment-manager/EMFormationsPage.jsx
import { useState } from 'react';
import {
  Box, Typography, Grid, Card, CardContent, CardActionArea,
  Chip, Divider, Dialog, DialogTitle, DialogContent,
  DialogActions, Button, Table, TableBody, TableCell,
  TableHead, TableRow, LinearProgress, Stack, Avatar
} from '@mui/material';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import { useNavigate } from 'react-router-dom';

// ── Dummy data ────────────────────────────────────────────────────────────────
const DUMMY_FORMATIONS = [
  {
    id: 1,
    nom: 'RTG Operator Training',
    reference: 'RTG-2026-01',
    duree: 15,
    sessions: [
      { id: 1, groupe: 'Groupe A', dateDebut: '2026-01-12', dateFin: '2026-01-26', participants: 2, statut: 'EN_COURS', joursCompletes: 3 },
      { id: 2, groupe: 'Groupe B', dateDebut: '2026-02-01', dateFin: '2026-02-15', participants: 2, statut: 'PLANIFIEE', joursCompletes: 0 },
      { id: 3, groupe: 'Groupe C', dateDebut: '2025-11-01', dateFin: '2025-11-15', participants: 2, statut: 'TERMINEE', joursCompletes: 15 },
    ],
  },
  {
    id: 2,
    nom: 'Sécurité au travail',
    reference: 'SEC-2026-01',
    duree: 5,
    sessions: [
      { id: 4, groupe: 'Groupe A', dateDebut: '2026-01-10', dateFin: '2026-01-14', participants: 8, statut: 'TERMINEE', joursCompletes: 5 },
      { id: 5, groupe: 'Groupe B', dateDebut: '2026-02-10', dateFin: '2026-02-14', participants: 6, statut: 'PLANIFIEE', joursCompletes: 0 },
    ],
  },
  {
    id: 3,
    nom: 'Habilitation électrique',
    reference: 'HAB-2026-02',
    duree: 3,
    sessions: [
      { id: 6, groupe: 'Groupe A', dateDebut: '2026-01-20', dateFin: '2026-01-22', participants: 12, statut: 'EN_COURS', joursCompletes: 1 },
    ],
  },
  {
    id: 4,
    nom: 'Management d\'équipe',
    reference: 'MGT-2026-01',
    duree: 7,
    sessions: [
      { id: 7, groupe: 'Groupe A', dateDebut: '2025-12-01', dateFin: '2025-12-07', participants: 15, statut: 'TERMINEE', joursCompletes: 7 },
    ],
  },
];

const STATUS_CONFIG = {
  EN_COURS:  { label: 'En cours',  color: 'success' },
  PLANIFIEE: { label: 'Planifiée', color: 'warning' },
  TERMINEE:  { label: 'Terminée',  color: 'error' },
};

function SessionDot({ statut, label }) {
  const colors = { EN_COURS: '#4caf50', PLANIFIEE: '#ff9800', TERMINEE: '#f44336' };
  return (
    <Avatar
      sx={{
        width: 32, height: 32, bgcolor: colors[statut] + '22', color: colors[statut],
        fontSize: 13, fontWeight: 700, border: `2px solid ${colors[statut]}`
      }}
    >
      {label}
    </Avatar>
  );
}

export default function EMFormationsPage() {
  const navigate = useNavigate();
  const [selectedFormation, setSelectedFormation] = useState(null);

  const handleSessionClick = (sessionId) => {
    setSelectedFormation(null);
    navigate(`/em/sessions/${sessionId}`);
  };

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Formations</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Cliquez sur une formation pour voir ses sessions. Cliquez sur une session pour accéder au suivi journalier.
      </Typography>

      <Grid container spacing={3}>
        {DUMMY_FORMATIONS.map((f) => {
          const enCours  = f.sessions.filter(s => s.statut === 'EN_COURS').length;
          const termine  = f.sessions.filter(s => s.statut === 'TERMINEE').length;
          const planifie = f.sessions.filter(s => s.statut === 'PLANIFIEE').length;
          const totalParticipants = f.sessions.reduce((sum, s) => sum + s.participants, 0);

          return (
            <Grid key={f.id} item xs={12} sm={6} lg={4}>
              <Card
                sx={{
                  borderRadius: 2, transition: '0.3s',
                  boxShadow: 2, '&:hover': { boxShadow: 6 },
                  cursor: 'pointer', height: '100%', display: 'flex', flexDirection: 'column'
                }}
                onClick={() => setSelectedFormation(f)}
              >
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="h6" fontWeight={700} mb={0.5}>{f.nom}</Typography>
                  <Typography variant="caption" color="text.secondary" display="block" mb={2}>
                    Réf: {f.reference} · {f.duree} jours
                  </Typography>

                  {/* Session dots */}
                  <Stack direction="row" spacing={1} mb={1.5} flexWrap="wrap">
                    {f.sessions.map((s, i) => (
                      <SessionDot key={s.id} statut={s.statut} label={`S${i + 1}`} />
                    ))}
                  </Stack>

                  {/* Status legend */}
                  <Stack direction="row" spacing={2} mb={1.5} flexWrap="wrap">
                    {enCours  > 0 && <Typography variant="caption" sx={{ color: '#4caf50', fontWeight: 600 }}>● En cours: {enCours}</Typography>}
                    {planifie > 0 && <Typography variant="caption" sx={{ color: '#ff9800', fontWeight: 600 }}>● Planifiées: {planifie}</Typography>}
                    {termine  > 0 && <Typography variant="caption" sx={{ color: '#f44336', fontWeight: 600 }}>● Terminées: {termine}</Typography>}
                  </Stack>

                  <Divider sx={{ mb: 2 }} />

                  {/* Stats */}
                  <Stack direction="row" spacing={3} justifyContent="space-around">
                    <Box textAlign="center">
                      <SchoolOutlinedIcon color="primary" />
                      <Typography variant="h6" fontWeight={700}>{f.sessions.length}</Typography>
                      <Typography variant="caption" color="text.secondary">Sessions</Typography>
                    </Box>
                    <Box textAlign="center">
                      <GroupOutlinedIcon color="primary" />
                      <Typography variant="h6" fontWeight={700}>{totalParticipants}</Typography>
                      <Typography variant="caption" color="text.secondary">Participants</Typography>
                    </Box>
                    <Box textAlign="center">
                      <CalendarTodayOutlinedIcon color={enCours > 0 ? 'success' : 'disabled'} />
                      <Typography variant="h6" fontWeight={700} color={enCours > 0 ? 'success.main' : 'text.secondary'}>{enCours}</Typography>
                      <Typography variant="caption" color="text.secondary">En cours</Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>

      {/* Sessions dialog */}
      <Dialog open={!!selectedFormation} onClose={() => setSelectedFormation(null)} maxWidth="md" fullWidth>
        {selectedFormation && (
          <>
            <DialogTitle sx={{ fontWeight: 700 }}>{selectedFormation.nom} — Sessions</DialogTitle>
            <DialogContent dividers>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Session</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Dates</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Participants</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Progression</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedFormation.sessions.map((s) => {
                    const pct = Math.round((s.joursCompletes / selectedFormation.duree) * 100);
                    return (
                      <TableRow
                        key={s.id}
                        hover
                        sx={{ cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' } }}
                        onClick={() => handleSessionClick(s.id)}
                      >
                        <TableCell>{s.groupe}</TableCell>
                        <TableCell sx={{ fontSize: 12 }}>{s.dateDebut} → {s.dateFin}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <GroupOutlinedIcon sx={{ fontSize: 14, color: 'text.secondary' }} />
                            {s.participants}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ minWidth: 100 }}>
                          <LinearProgress
                            variant="determinate"
                            value={pct}
                            sx={{ height: 6, borderRadius: 3, background: '#eee', '& .MuiLinearProgress-bar': { borderRadius: 3, background: 'linear-gradient(90deg,#1976d2,#42a5f5)' } }}
                          />
                          <Typography variant="caption" color="text.secondary">{s.joursCompletes}/{selectedFormation.duree} jours</Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={STATUS_CONFIG[s.statut]?.label ?? s.statut}
                            color={STATUS_CONFIG[s.statut]?.color ?? 'default'}
                            size="small"
                            sx={{ fontWeight: 600, fontSize: 11 }}
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setSelectedFormation(null)}>Fermer</Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </Box>
  );
}
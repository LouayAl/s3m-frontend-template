import { useState, useEffect }              from 'react';
import {
  Box, Typography, Grid, Card, CardContent, Chip,
  Divider, Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Table, TableBody, TableCell, TableHead, TableRow,
  LinearProgress, Stack, Avatar, CircularProgress, Snackbar, Alert,
}                                           from '@mui/material';
import SchoolOutlinedIcon                   from '@mui/icons-material/SchoolOutlined';
import GroupOutlinedIcon                    from '@mui/icons-material/GroupOutlined';
import CalendarTodayOutlinedIcon            from '@mui/icons-material/CalendarTodayOutlined';
import { useNavigate }                      from 'react-router-dom';
import { getEmSessions, getEmFormations }   from '../../api/emApi';
import AddIcon                              from '@mui/icons-material/Add';
import FormationsModal                      from '../formations/FormationsModal';
import { useAuth }                          from '../../contexts/auth/AuthContext';


const STATUS_CONFIG = {
  EN_COURS:  { label: 'En cours',  color: 'success' },
  PLANIFIEE: { label: 'Planifiée', color: 'warning' },
  TERMINEE:  { label: 'Terminée',  color: 'error'   },
};

const STATUS_COLORS = {
  EN_COURS:  '#4caf50',
  PLANIFIEE: '#ff9800',
  TERMINEE:  '#f44336',
};

function SessionDot({ statut, label }) {
  const color = STATUS_COLORS[statut] ?? '#999';
  return (
    <Avatar sx={{
      width:32, height:32,
      bgcolor: color + '22',
      color,
      fontSize:13, fontWeight:700,
      border:`2px solid ${color}`,
    }}>
      {label}
    </Avatar>
  );
}

export default function EMFormationsPage() {
  const navigate = useNavigate();
  const [formations,         setFormations]         = useState([]);
  const [loading,            setLoading]            = useState(true);
  const [selectedFormation,  setSelectedFormation]  = useState(null);
  const [openModal,          setOpenModal]          = useState(false);
  const { user } = useAuth();
  const isTrainer = user?.role === 'TRAINER';

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success',
  });

  const showSnackbar = (message, severity = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const toCardFormation = (formation) => ({
    id: formation.id,
    nom: formation.module,
    sessions: formation.sessions ?? [],
  });

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const [catalogue, sessions] = await Promise.all([
        getEmFormations(),
        getEmSessions(),
      ]);

      const map = {};

      catalogue.forEach(formation => {
        map[formation.id] = toCardFormation(formation);
      });

      sessions.forEach(s => {
        const fId = s.formationId;
        if (!map[fId]) {
          map[fId] = {
            id:       fId,
            nom:      s.formation,
            sessions: [],
          };
        }
        map[fId].sessions.push(s);
      });

      setFormations(Object.values(map));
    } catch (err) {
      console.error(err);
      showSnackbar('Erreur lors du chargement des formations.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFormations();
  }, []);

  const handleSessionClick = (sessionId) => {
    setSelectedFormation(null);
    navigate(`/em/sessions/${sessionId}`);
  };

  const handleSaveFormation = (savedFormation) => {
    setFormations(prev => {
      const exists = prev.some(f => f.id === savedFormation.id);
      const nextFormation = toCardFormation(savedFormation);

      if (exists) {
        return prev.map(f => (
          f.id === savedFormation.id
            ? { ...nextFormation, sessions: f.sessions ?? [] }
            : f
        ));
      }

      return [nextFormation, ...prev];
    });
    setOpenModal(false);
  };

  if (loading) {
    return (
      <Box sx={{ display:'flex', justifyContent:'center', alignItems:'center', minHeight:300 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={1}>Formations</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Cliquez sur une formation pour voir ses sessions. Cliquez sur une session pour accéder au suivi journalier.
      </Typography>

      {!isTrainer && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setOpenModal(true)}
          sx={{ mb: 3 }}
        >
          Créer une formation
        </Button>
      )}

      <Grid container spacing={3}>
        {formations.map((f) => {
          const enCours           = f.sessions.filter(s => s.statut === 'EN_COURS').length;
          const termine           = f.sessions.filter(s => s.statut === 'TERMINEE').length;
          const planifie          = f.sessions.filter(s => s.statut === 'PLANIFIEE').length;
          const totalParticipants = f.sessions.reduce((sum, s) => sum + (s.participantsCount ?? 0), 0);

          return (
            <Grid key={f.id} item xs={12} sm={6} lg={4}>
              <Card
                sx={{
                  borderRadius:2, transition:'0.3s',
                  boxShadow:2, '&:hover':{ boxShadow:6 },
                  cursor:'pointer', height:'100%', display:'flex', flexDirection:'column',
                }}
                onClick={() => setSelectedFormation(f)}
              >
                <CardContent sx={{ flexGrow:1 }}>
                  <Typography variant="h6" fontWeight={700} mb={0.5}>{f.nom}</Typography>

                  {/* Session dots */}
                  <Stack direction="row" spacing={1} mb={1.5} flexWrap="wrap">
                    {f.sessions.length > 0 ? (
                      f.sessions.map((s, i) => (
                        <SessionDot key={s.idSession} statut={s.statut} label={`S${i + 1}`} />
                      ))
                    ) : (
                      <Typography variant="caption" color="text.secondary">
                        Aucune session planifiée
                      </Typography>
                    )}
                  </Stack>

                  {/* Status legend */}
                  <Stack direction="row" spacing={2} mb={1.5} flexWrap="wrap">
                    {enCours  > 0 && <Typography variant="caption" sx={{ color:'#4caf50', fontWeight:600 }}>● En cours: {enCours}</Typography>}
                    {planifie > 0 && <Typography variant="caption" sx={{ color:'#ff9800', fontWeight:600 }}>● Planifiées: {planifie}</Typography>}
                    {termine  > 0 && <Typography variant="caption" sx={{ color:'#f44336', fontWeight:600 }}>● Terminées: {termine}</Typography>}
                  </Stack>

                  <Divider sx={{ mb:2 }} />

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
                      <Typography variant="h6" fontWeight={700} color={enCours > 0 ? 'success.main' : 'text.secondary'}>
                        {enCours}
                      </Typography>
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
            <DialogTitle sx={{ fontWeight:700 }}>
              {selectedFormation.nom} — Sessions
            </DialogTitle>
            <DialogContent dividers>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight:600 }}>Référence</TableCell>
                    <TableCell sx={{ fontWeight:600 }}>Dates</TableCell>
                    <TableCell sx={{ fontWeight:600 }}>Participants</TableCell>
                    <TableCell sx={{ fontWeight:600 }}>Progression</TableCell>
                    <TableCell sx={{ fontWeight:600 }}>Statut</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedFormation.sessions.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        Aucune session n'est encore rattachée à cette formation.
                      </TableCell>
                    </TableRow>
                  )}

                  {selectedFormation.sessions.map((s) => {
                    const duree        = Number(s.dJours);
                    const today        = new Date();
                    const start        = new Date(s.dateDebut);
                    const diffDays     = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
                    const joursAtteint = Math.min(Math.max(diffDays, 0), duree);
                    const pct          = duree ? Math.round((joursAtteint / duree) * 100) : 0;

                    return (
                      <TableRow key={s.idSession} hover
                        sx={{ cursor:'pointer', '&:hover':{ bgcolor:'action.hover' } }}
                        onClick={() => handleSessionClick(s.idSession)}
                      >
                        <TableCell>{s.referenceSession}</TableCell>
                        <TableCell sx={{ fontSize:12 }}>{s.dateDebut} → {s.dateFin}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            <GroupOutlinedIcon sx={{ fontSize:14, color:'text.secondary' }} />
                            {s.participantsCount}
                          </Stack>
                        </TableCell>
                        <TableCell sx={{ minWidth:120 }}>
                          <LinearProgress
                            variant="determinate" value={pct}
                            sx={{ height:6, borderRadius:3 }}
                          />
                          <Typography variant="caption" color="text.secondary">
                            {joursAtteint}/{duree} jours
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={STATUS_CONFIG[s.statut]?.label ?? s.statut}
                            color={STATUS_CONFIG[s.statut]?.color ?? 'default'}
                            size="small" sx={{ fontWeight:600, fontSize:11 }}
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

      <FormationsModal
        open={openModal}
        onClose={() => setOpenModal(false)}
        onSave={handleSaveFormation}
        showSnackbar={showSnackbar}
        initialData={null}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled" onClose={handleCloseSnackbar}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}

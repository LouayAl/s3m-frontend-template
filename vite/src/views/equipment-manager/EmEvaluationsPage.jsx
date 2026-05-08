import { useState, useEffect, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Grid, FormControl,
  InputLabel, Select, MenuItem, Chip, Table, TableHead,
  TableBody, TableRow, TableCell, Button, Snackbar, Alert,
  LinearProgress, CircularProgress,
} from '@mui/material';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import SessionDetailDialog from './components/SessionDetailDialog';
import { getEmSessions, getMySessionsAsTrainer } from '../../api/emApi';
import AddEvaluationModal from './components/AddEvaluationModal';
import { useAuth } from '../../contexts/auth/AuthContext';

const STATUS_CONFIG = {
  EN_COURS:  { label: 'En cours',  color: 'success' },
  PLANIFIEE: { label: 'Planifiée', color: 'warning' },
  TERMINEE:  { label: 'Terminée',  color: 'error'   },
};

export default function EMEvaluationsPage() {
  const { user } = useAuth();
  const isTrainer = user?.role === 'TRAINER';

  const [sessions,        setSessions]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [filterFormation, setFilterFormation] = useState('');
  const [filterStatut,    setFilterStatut]    = useState('');
  const [selectedSession, setSelectedSession] = useState(null);
  const [snackbar,        setSnackbar]        = useState({ open:false, message:'', severity:'success' });
  const [openModal,       setOpenModal]       = useState(false);

  useEffect(() => {
    const fetch = isTrainer ? getMySessionsAsTrainer : getEmSessions;
    fetch()
      .then(setSessions)
      .catch(() => setSnackbar({ open:true, message:'Erreur lors du chargement des sessions.', severity:'error' }))
      .finally(() => setLoading(false));
  }, [isTrainer]);

  const formations = [...new Set(sessions.map(s => s.formation))];

  const filtered = useMemo(() => sessions.filter(s => {
    if (filterFormation && s.formation !== filterFormation) return false;
    if (filterStatut    && s.statut    !== filterStatut)    return false;
    return true;
  }), [sessions, filterFormation, filterStatut]);

  const enCours           = sessions.filter(s => s.statut === 'EN_COURS').length;
  const terminees         = sessions.filter(s => s.statut === 'TERMINEE').length;
  const totalParticipants = sessions.reduce((sum, s) => sum + (s.participantsCount ?? 0), 0);

  return (
    <Box>
      <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'center', mb:3, flexWrap:'wrap', gap:1 }}>
        <Box>
          <Typography variant="h4" fontWeight={700}>Évaluations</Typography>
          <Typography variant="body2" color="text.secondary">
            Cliquez sur une session pour voir le détail des participants et leur progression.
          </Typography>
        </Box>
        {!isTrainer && (
          <Button variant="contained" onClick={() => setOpenModal(true)}>
            Ajouter une évaluation
          </Button>
        )}
      </Box>

      <Grid container spacing={2} mb={3}>
        {[
          { label:'Sessions totales',   value: sessions.length,     color:'primary.main', bg:'primary.light' },
          { label:'En cours',           value: enCours,             color:'success.main', bg:'success.light' },
          { label:'Terminées',          value: terminees,           color:'error.main',   bg:'error.light'   },
          { label:'Participants total', value: totalParticipants,   color:'#7b1fa2',      bg:'#f3e5f5'       },
        ].map(k => (
          <Grid key={k.label} item xs={6} sm={3}>
            <Card sx={{
              borderRadius:2, boxShadow:'none', border:'1px solid', borderColor:'divider',
              background:`linear-gradient(135deg, ${k.bg} 0%, #fff 100%)`,
            }}>
              <CardContent sx={{ p:2,'&:last-child':{pb:2} }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>{k.label}</Typography>
                <Typography variant="h4" fontWeight={700} sx={{ color:k.color }}>{k.value}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card sx={{ borderRadius:2, boxShadow:'none', border:'1px solid', borderColor:'divider', mb:2 }}>
        <CardContent sx={{ py:1.5,'&:last-child':{pb:1.5} }}>
          <Grid container spacing={1.5} alignItems="center">
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Formation</InputLabel>
                <Select value={filterFormation} label="Formation" sx={{ minWidth:140 }}
                  onChange={e => setFilterFormation(e.target.value)}>
                  <MenuItem value="">Toutes</MenuItem>
                  {formations.map(f => <MenuItem key={f} value={f}>{f}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <FormControl fullWidth size="small">
                <InputLabel>Statut</InputLabel>
                <Select value={filterStatut} label="Statut" sx={{ minWidth:140 }}
                  onChange={e => setFilterStatut(e.target.value)}>
                  <MenuItem value="">Tous</MenuItem>
                  {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                    <MenuItem key={k} value={k}>{v.label}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Button variant="outlined" size="small" sx={{ minWidth:140 }}
                onClick={() => { setFilterFormation(''); setFilterStatut(''); }}>
                Réinitialiser
              </Button>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card sx={{ borderRadius:2, boxShadow:'none', border:'1px solid', borderColor:'divider' }}>
        {loading ? (
          <Box sx={{ display:'flex', justifyContent:'center', py:6 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box sx={{ overflowX:'auto' }}>
            <Table>
              <TableHead sx={{ bgcolor:'background.default' }}>
                <TableRow>
                  <TableCell sx={{ fontWeight:700 }}>Formation</TableCell>
                  <TableCell sx={{ fontWeight:700 }}>Référence</TableCell>
                  <TableCell sx={{ fontWeight:700 }}>Dates</TableCell>
                  <TableCell sx={{ fontWeight:700 }} align="center">Participants</TableCell>
                  <TableCell sx={{ fontWeight:700 }} align="center">Statut</TableCell>
                  <TableCell sx={{ fontWeight:700 }} align="center">Progression</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filtered.map(s => {
                  const today        = new Date();
                  const start        = new Date(s.dateDebut);
                  const duree        = Number(s.dJours);
                  const diffDays     = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
                  const joursAtteint = Math.min(Math.max(diffDays, 0), duree);
                  const pct          = duree ? Math.round((joursAtteint / duree) * 100) : 0;

                  return (
                    <TableRow key={s.idSession} hover
                      sx={{ cursor:'pointer', '&:hover':{ bgcolor:'primary.light' } }}
                      onClick={() => setSelectedSession(s)}
                    >
                      <TableCell>
                        <Typography variant="body2" fontWeight={600}>{s.formation}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{s.referenceSession}</Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">
                          {s.dateDebut} → {s.dateFin}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Box sx={{ display:'flex', alignItems:'center', justifyContent:'center', gap:0.5 }}>
                          <GroupOutlinedIcon sx={{ fontSize:14, color:'text.secondary' }} />
                          <Typography variant="body2" fontWeight={600}>{s.participantsCount}</Typography>
                        </Box>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={STATUS_CONFIG[s.statut]?.label ?? s.statut}
                          color={STATUS_CONFIG[s.statut]?.color ?? 'default'}
                          size="small" sx={{ fontWeight:700 }}
                        />
                      </TableCell>
                      <TableCell sx={{ minWidth:140 }}>
                        <LinearProgress
                          variant="determinate" value={pct}
                          color={pct===100?'success':pct>=50?'warning':'primary'}
                          sx={{ height:6, borderRadius:3, mb:0.5 }}
                        />
                        <Typography variant="caption" color="text.secondary">{pct}%</Typography>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {filtered.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py:5, color:'text.secondary' }}>
                      Aucune session trouvée.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </Box>
        )}
        <Box sx={{ px:2, py:1.5, borderTop:'1px solid', borderColor:'divider', display:'flex', justifyContent:'flex-end' }}>
          <Typography variant="caption" color="text.secondary">
            {filtered.length} session{filtered.length !== 1 ? 's' : ''}
          </Typography>
        </Box>
      </Card>

      <SessionDetailDialog
        open={!!selectedSession}
        onClose={() => setSelectedSession(null)}
        session={selectedSession}
      />

      {!isTrainer && (
        <AddEvaluationModal
          open={openModal}
          onClose={() => setOpenModal(false)}
          onSubmit={() => setSnackbar({ open:true, message:'Évaluation ajoutée avec succès.', severity:'success' })}
        />
      )}

      <Snackbar open={snackbar.open} autoHideDuration={3000}
        onClose={() => setSnackbar(p => ({ ...p, open:false }))}
        anchorOrigin={{ vertical:'top', horizontal:'center' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
import { useEffect, useState } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Grid, Table, TableHead, TableBody,
  TableRow, TableCell, Chip, Avatar, LinearProgress,
  Button, CircularProgress,
} from '@mui/material';
import GroupOutlinedIcon      from '@mui/icons-material/GroupOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import TrendingUpIcon          from '@mui/icons-material/TrendingUp';
import AssessmentOutlinedIcon  from '@mui/icons-material/AssessmentOutlined';
import RatingBadge             from './RatingBadge';
import ParticipantProgressDialog from './ParticipantProgressDialog';
import { getSessionStats }     from '../../../api/emApi';

const STATUS_CONFIG = {
  EN_COURS:  { label: 'En cours',  color: 'success' },
  PLANIFIEE: { label: 'Planifiée', color: 'warning' },
  TERMINEE:  { label: 'Terminée',  color: 'error'   },
};

export default function SessionDetailDialog({ open, onClose, session }) {
  const [stats,               setStats]               = useState([]);
  const [loading,             setLoading]             = useState(false);
  const [selectedParticipant, setSelectedParticipant] = useState(null);

  useEffect(() => {
    if (!open || !session) return;
    setLoading(true);
    getSessionStats(session.idSession)
      .then(setStats)
      .catch(() => setStats([]))
      .finally(() => setLoading(false));
  }, [open, session]);

  if (!session) return null;

  const duree        = Number(session.dJours);
  const participants = session.participants ?? [];

  // Merge participants with their stats
  const participantsWithStats = participants.map(p => {
    const stat = stats.find(s => Number(s.idEmploye) === p.idEmploye);
    return {
      ...p,
      avg:           stat ? Number(stat.avgScore)     : null,
      joursEvalues:  stat ? Number(stat.joursEvalues) : 0,
      absences:      stat ? Number(stat.absences)     : 0,
    };
  });

  const today    = new Date();
  const start    = new Date(session.dateDebut);
  const diffDays = Math.floor((today - start) / (1000 * 60 * 60 * 24)) + 1;
  const joursAtteint = Math.min(Math.max(diffDays, 0), duree);
  const pct      = duree ? Math.round((joursAtteint / duree) * 100) : 0;

  return (
    <>
      <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
        <DialogTitle sx={{ pb:1, bgcolor:'primary.main', color:'#fff' }}>
          <Typography component="span" display="block" fontWeight={700}>
            {session.formation}
          </Typography>
          <Typography variant="caption" sx={{ opacity:0.85 }}>
            {session.referenceSession} · {session.dateDebut} → {session.dateFin} · {duree} jours
          </Typography>
        </DialogTitle>

        <DialogContent dividers>
          {/* KPIs */}
          <Grid container spacing={2} mb={2}>
            {[
              { label:'Participants',   value: participants.length,                     icon:<GroupOutlinedIcon/>,         color:'#1a5276' },
              { label:'Jours atteints', value: `${joursAtteint}/${duree}`,              icon:<CalendarTodayOutlinedIcon/>, color:'#f5821f' },
              { label:'Progression',    value: `${pct}%`,                               icon:<TrendingUpIcon/>,            color:'#2e7d32' },
              { label:'Statut',         value: STATUS_CONFIG[session.statut]?.label,    icon:<AssessmentOutlinedIcon/>,    color:'#7b1fa2' },
            ].map(k => (
              <Grid key={k.label} item xs={6} sm={3}>
                <Box sx={{
                  p:1.5, borderRadius:2, border:'1px solid', borderColor:'divider',
                  bgcolor:'background.paper', textAlign:'center',
                }}>
                  <Box sx={{ color:k.color, mb:0.5 }}>{k.icon}</Box>
                  <Typography variant="h6" fontWeight={700} sx={{ color:k.color }}>{k.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{k.label}</Typography>
                </Box>
              </Grid>
            ))}
          </Grid>

          <LinearProgress
            variant="determinate" value={pct}
            sx={{ height:6, borderRadius:3, mb:2 }}
            color="primary"
          />

          <Typography variant="subtitle2" fontWeight={700} mb={1.5}>
            Participants — cliquer pour voir le détail
          </Typography>

          {loading ? (
            <Box sx={{ display:'flex', justifyContent:'center', py:3 }}>
              <CircularProgress />
            </Box>
          ) : (
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
                  const avgPct = p.avg !== null ? (p.avg / 4) * 100 : 0;
                  return (
                    <TableRow
                      key={p.idEmploye} hover
                      sx={{ cursor:'pointer', '&:hover':{ bgcolor:'primary.light' } }}
                      onClick={() => setSelectedParticipant(p)}
                    >
                      <TableCell>
                        <Box sx={{ display:'flex', alignItems:'center', gap:1 }}>
                          <Avatar sx={{ width:28, height:28, bgcolor:'primary.main', fontSize:11 }}>
                            {p.prenom?.[0]}{p.nom?.[0]}
                          </Avatar>
                          <Typography variant="body2" fontWeight={600}>
                            {p.prenom} {p.nom}
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography variant="caption" color="text.secondary">{p.matricule}</Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={`${p.joursEvalues}/${joursAtteint}`}
                          size="small"
                          color={p.joursEvalues === joursAtteint && joursAtteint > 0 ? 'success' : 'default'}
                        />
                      </TableCell>
                      <TableCell align="center">
                        {p.absences > 0
                          ? <Chip label={p.absences} size="small" color="error" />
                          : <Typography variant="caption" color="text.disabled">0</Typography>
                        }
                      </TableCell>
                      <TableCell align="center">
                        <RatingBadge value={p.avg} />
                      </TableCell>
                      <TableCell sx={{ minWidth:120 }}>
                        <LinearProgress
                          variant="determinate" value={avgPct}
                          color={avgPct>=75?'success':avgPct>=50?'warning':'error'}
                          sx={{ height:6, borderRadius:3 }}
                        />
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </DialogContent>

        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>

      <ParticipantProgressDialog
        open={!!selectedParticipant}
        onClose={() => setSelectedParticipant(null)}
        participant={selectedParticipant}
        sessionId={session?.idSession}
        duree={duree}
      />
    </>
  );
}
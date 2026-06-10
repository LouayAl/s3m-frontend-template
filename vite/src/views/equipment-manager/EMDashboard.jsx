// frontend-template/vite/src/views/equipment-manager/EMDashboard.jsx
import { useEffect, useState } from 'react';
import {
  Box, Grid, Typography, Card, CardContent,
  Divider, Chip, LinearProgress,
} from '@mui/material';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import SchoolOutlinedIcon from '@mui/icons-material/SchoolOutlined';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';
import FlashOnOutlinedIcon from '@mui/icons-material/FlashOnOutlined';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import { getEmSessions, getMySessionsAsTrainer } from '../../api/emApi';
import { useAuth } from '../../contexts/auth/AuthContext';
import { getAllEmployes } from 'api/employeApi';

import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';

import format from 'date-fns/format';
import parse from 'date-fns/parse';
import startOfWeek from 'date-fns/startOfWeek';
import getDay from 'date-fns/getDay';
import fr from 'date-fns/locale/fr';

import { useNavigate } from 'react-router-dom';

const locales = {
  fr,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

function parseLocalDate(dateStr) {
  if (!dateStr) return null;
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}


// ─── Reusable KPI card ────────────────────────────────────────────────────────
function KpiCard({ label, value, icon, color = 'primary' }) {
  const colorMap = {
    primary:  { bg: 'primary.main',   text: '#fff' },
    blue:     { bg: '#1a5276',         text: '#fff' },
    orange:   { bg: 'warning.main',   text: '#fff' },
    green:    { bg: 'success.main',   text: '#fff' },
    white:    { bg: 'background.paper', text: 'text.primary' },
  };
  const c = colorMap[color] ?? colorMap.white;
  const isColored = color !== 'white';

  return (
    <Card sx={{ bgcolor: c.bg, borderRadius: 2, boxShadow: 'none', border: isColored ? 'none' : '1px solid', borderColor: 'divider' }}>
      <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h3" sx={{ color: c.text, fontWeight: 700, mb: 0.5 }}>
              {value ?? '—'}
            </Typography>
            <Typography variant="body2" sx={{ color: isColored ? 'rgba(255,255,255,0.85)' : 'text.secondary' }}>
              {label}
            </Typography>
          </Box>
          <Box sx={{ p: 1, borderRadius: 1.5, bgcolor: 'rgba(255,255,255,0.15)', color: c.text, display: 'flex' }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
}

// ─── Status pill ──────────────────────────────────────────────────────────────
function StatusChip({ statut }) {
  const map = {
    EN_COURS:  { label: 'En cours',  color: 'success' },
    PLANIFIEE: { label: 'Planifiée', color: 'warning' },
    TERMINEE:  { label: 'Terminée',  color: 'error' },
  };
  const s = map[statut] ?? { label: statut, color: 'default' };
  return <Chip label={s.label} color={s.color} size="small" sx={{ fontWeight: 600, fontSize: 11 }} />;
}

// ─── Dashboard ────────────────────────────────────────────────────────────────
export default function EMDashboard() {
  const [sessions, setSessions]   = useState([]);
  const [totalEmployes, setTotalEmployes] = useState(0);
  const [loading, setLoading]     = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const loadData = async () => {
      try {
        const [emps, sess] = await Promise.all([
          getAllEmployes(),
          user?.role === 'TRAINER'
            ? getMySessionsAsTrainer()
            : getEmSessions(),
        ]);

        setSessions(sess);
        setTotalEmployes(emps.length);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  const enCours   = sessions.filter(s => s.statut === 'EN_COURS').length;
  const terminees = sessions.filter(s => s.statut === 'TERMINEE').length;
  const planifiees = sessions.filter(s => s.statut === 'PLANIFIEE').length;

  const liveParticipants = sessions
    .filter(s => s.statut === 'EN_COURS')
    .reduce((sum, s) => sum + (s.participants?.length ?? 0), 0);

  const totalParticipants = sessions
    .reduce((sum, s) => sum + (s.participants?.length ?? 0), 0);

  // Live participants list (from EN_COURS sessions, flattened)
  const plannedSessions = sessions.filter(
    s => s.statut === 'PLANIFIEE' || s.statut === 'EN_COURS'
  );

  const calendarEvents = plannedSessions
  .filter(s => s.dateDebut != null && s.dateFin != null)
  .map((s) => {
    const end = parseLocalDate(s.dateFin);
    end.setDate(end.getDate() + 1); // ← react-big-calendar end is exclusive
    return {
      title:     s.formation,
      start:     parseLocalDate(s.dateDebut),
      end,
      sessionId: s.idSession,
      resource:  s,
    };
  });


  if (loading) return <Box sx={{ p: 3 }}><LinearProgress /></Box>;

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Dashboard</Typography>

      {/* KPI row 1 — colored cards */}
      <Grid container spacing={2} mb={2}>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard label="Formations en cours" value={enCours} icon={<SchoolOutlinedIcon />} color="primary" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard label="Formations terminées" value={terminees} icon={<CheckCircleOutlinedIcon />} color="blue" />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, lg: 4 }}>
          <KpiCard label="Total des participants" value={totalParticipants.toLocaleString()} icon={<PeopleOutlinedIcon />} color="white" />
        </Grid>
      </Grid>

      {/* KPI row 2 — white cards */}
      <Grid container spacing={2} mb={3}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="Participants en direct" value={liveParticipants} icon={<FlashOnOutlinedIcon />} color="white" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="Sessions planifiées" value={planifiees} icon={<CalendarTodayOutlinedIcon />} color="white" />
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <KpiCard label="Total employés" value={totalEmployes.toLocaleString()} icon={<AssignmentOutlinedIcon />} color="white" />
        </Grid>
      </Grid>

      {/* Bottom cards */}
      <Grid container spacing={2}>
        {/* Recent formations */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>Formations récentes</Typography>
              {sessions.slice(0, 5).map((s, i) => (
                <Box key={s.idSession}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1 }}>
                    <Box>
                      <Typography variant="body2" fontWeight={500}>{s.formation}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {s.participants?.length ?? 0} participants · {s.dJours} jours
                      </Typography>
                    </Box>
                    <StatusChip statut={s.statut} />
                  </Box>
                  {i < 4 && <Divider />}
                </Box>
              ))}
            </CardContent>
          </Card>
        </Grid>

        {/* Planned sessions calendar */}
        <Grid size={{ xs: 12, md: 6 }}>
          <Card
            sx={{
              borderRadius: 2,
              boxShadow: 'none',
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
            }}
          >
            <CardContent>
              <Typography variant="subtitle1" fontWeight={600} mb={2}>
                Sessions planifiées
              </Typography>

              <Box sx={{ height: 450 }}>
                <Calendar
                  localizer={localizer}
                  events={calendarEvents}
                  startAccessor="start"
                  endAccessor="end"
                  views={['month']}
                  defaultView="month"
                  popup
                  selectable
                  style={{ height: '100%' }}
                  messages={{
                    next: 'Suivant',
                    previous: 'Précédent',
                    today: "Aujourd'hui",
                    month: 'Mois',
                    week: 'Semaine',
                    day: 'Jour',
                    agenda: 'Agenda',
                    date: 'Date',
                    time: 'Heure',
                    event: 'Session',
                    noEventsInRange: 'Aucune session',
                  }}
                  onSelectEvent={(event) => {
                    navigate(`/em/sessions/${event.sessionId}`);
                  }}
                  eventPropGetter={(event) => {
                    const statut = event.resource?.statut;

                    let backgroundColor = '#1976d2';

                    if (statut === 'EN_COURS') {
                      backgroundColor = '#2e7d32';
                    } else if (statut === 'PLANIFIEE') {
                      backgroundColor = '#ed6c02';
                    }

                    return {
                      style: {
                        backgroundColor,
                        borderRadius: 6,
                        border: 'none',
                        color: 'white',
                        padding: '2px 4px',
                        fontSize: 12,
                      },
                    };
                  }}
                />
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
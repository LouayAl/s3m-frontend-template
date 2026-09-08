import { useEffect, useMemo, useState, useCallback } from 'react';
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Badge from '@mui/material/Badge';
import Box from '@mui/material/Box';
import CloseIcon from '@mui/icons-material/Close';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonthOutlined';
import { useTheme, alpha } from '@mui/material/styles';

import { LocalizationProvider } from '@mui/x-date-pickers';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { DateCalendar } from '@mui/x-date-pickers/DateCalendar';
import { PickersDay } from '@mui/x-date-pickers/PickersDay';
import { fr } from 'date-fns/locale';

import { startOfMonth, endOfMonth, subDays, addDays, eachDayOfInterval, format, isValid } from 'date-fns';

import KPIBox from 'ui-component/cards/KPIBox';
import VisibiliteSessionsModal from './VisibiliteSessionsModal';
import { getCalendarSessions } from 'api/kpiApi';

// ── Group sessions by every day they occupy (multi-day sessions expand across their full range) ──
function buildSessionsByDate(sessions) {
  const map = {};
  sessions.forEach((s) => {
    const start = s.dateDebut ? new Date(s.dateDebut) : null;
    if (!start || !isValid(start)) return;
    const end = s.dateFin ? new Date(s.dateFin) : start;
    const rangeEnd = isValid(end) && end >= start ? end : start;

    eachDayOfInterval({ start, end: rangeEnd }).forEach((day) => {
      const key = format(day, 'yyyy-MM-dd');
      if (!map[key]) map[key] = [];
      map[key].push(s);
    });
  });
  return map;
}

// ── Custom day cell: tinted outline for 1 session, solid fill for 2+ ──
function SessionPickersDay(props) {
  const { day, sessionsByDate, outsideCurrentMonth, ...other } = props;
  const theme = useTheme();
  const key = format(day, 'yyyy-MM-dd');
  const daySessions = sessionsByDate[key] || [];
  const hasSessions = daySessions.length > 0 && !outsideCurrentMonth;
  const isHeavy = daySessions.length >= 2;

  return (
    <Badge
      key={key}
      overlap="circular"
      badgeContent={isHeavy ? daySessions.length : 0}
      invisible={!isHeavy}
      color="warning"
      sx={{ '& .MuiBadge-badge': { fontSize: 9, height: 15, minWidth: 15, top: 4, right: 4 } }}
    >
      <PickersDay
        {...other}
        day={day}
        outsideCurrentMonth={outsideCurrentMonth}
        disableMargin
        sx={{
          ...(hasSessions && {
            bgcolor: isHeavy ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.16),
            color: isHeavy ? theme.palette.primary.contrastText : theme.palette.primary.main,
            border: isHeavy ? 'none' : `1.5px solid ${theme.palette.primary.main}`,
            fontWeight: 700,
            '&:hover': {
              bgcolor: theme.palette.primary.dark,
              color: theme.palette.primary.contrastText
            },
            '&:focus': {
              bgcolor: theme.palette.primary.dark,
              color: theme.palette.primary.contrastText
            }
          })
        }}
      />
    </Badge>
  );
}

export default function PlanifiedSessionsCalendar({ entrepriseId, departementId = null }) {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [monthAnchor, setMonthAnchor] = useState(new Date());
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(false);

  const [dayModalOpen, setDayModalOpen] = useState(false);
  const [dayModalTitle, setDayModalTitle] = useState('');
  const [dayModalSessions, setDayModalSessions] = useState([]);

  const fetchMonth = useCallback(
    (anchor) => {
      if (entrepriseId === undefined) return;
      const start = subDays(startOfMonth(anchor), 7);
      const end = addDays(endOfMonth(anchor), 7);
      setLoading(true);
      getCalendarSessions(entrepriseId, format(start, 'yyyy-MM-dd'), format(end, 'yyyy-MM-dd'), departementId)
        .then((data) => setSessions(Array.isArray(data) ? data : []))
        .catch(() => setSessions([]))
        .finally(() => setLoading(false));
    },
    [entrepriseId, departementId]
  );

  useEffect(() => {
    fetchMonth(monthAnchor);
  }, [fetchMonth, monthAnchor]);

  const sessionsByDate = useMemo(() => buildSessionsByDate(sessions), [sessions]);

  const sessionsThisMonthCount = useMemo(() => {
    const ids = new Set();
    const monthStart = startOfMonth(monthAnchor);
    const monthEnd = endOfMonth(monthAnchor);
    Object.entries(sessionsByDate).forEach(([key, list]) => {
      const d = new Date(key);
      if (d >= monthStart && d <= monthEnd) list.forEach((s) => ids.add(s.idSession));
    });
    return ids.size;
  }, [sessionsByDate, monthAnchor]);

  const handleDayClick = (date) => {
    const key = format(date, 'yyyy-MM-dd');
    const daySessions = sessionsByDate[key] || [];
    if (daySessions.length === 0) return;
    setDayModalTitle(`Sessions du ${format(date, 'dd MMMM yyyy', { locale: fr })}`);
    setDayModalSessions(daySessions);
    setDayModalOpen(true);
  };

  return (
    <>
      {/* Same KPIBox as the other 3 cards → guaranteed identical padding/radius/shadow/fonts */}
      <div onClick={() => setOpen(true)} style={{ cursor: 'pointer', height: '100%' }}>
        <KPIBox
            title={
            <Stack direction="row" spacing={0.5} justifyContent="center" alignItems="center">
                <CalendarMonthIcon sx={{ fontSize: 16 }} />
                <span style={{ textTransform: 'capitalize' }}>{format(monthAnchor, 'MMMM yyyy', { locale: fr })}</span>
            </Stack>
            }
            value={
            <Stack spacing={0} alignItems="center" sx={{ mt: -0.5 }}>
                <span style={{ fontSize: 24, fontWeight: 'bold', lineHeight: 1.2 }}>
                {loading ? '…' : sessionsThisMonthCount}
                </span>
                <span style={{ fontSize: 11, fontWeight: 500, opacity: 0.7, textTransform: 'none', lineHeight: 1.2 }}>
                session{sessionsThisMonthCount > 1 ? 's' : ''} planifiée{sessionsThisMonthCount > 1 ? 's' : ''}
                </span>
            </Stack>
            }
            color="#26A69A"
        />
        </div>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          Calendrier des sessions planifiées
          <IconButton onClick={() => setOpen(false)} size="small">
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers>
          <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={fr}>
            <DateCalendar
              value={null}
              referenceDate={monthAnchor}
              onChange={(newDate) => newDate && handleDayClick(newDate)}
              onMonthChange={(newMonth) => setMonthAnchor(newMonth)}
              slots={{ day: SessionPickersDay }}
              slotProps={{ day: { sessionsByDate } }}
              sx={{ width: '100%' }}
            />
          </LocalizationProvider>

          <Stack direction="row" spacing={2.5} alignItems="center" sx={{ mt: 1, px: 1 }} flexWrap="wrap">
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box
                sx={{
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  border: `1.5px solid ${theme.palette.primary.main}`,
                  bgcolor: alpha(theme.palette.primary.main, 0.16)
                }}
              />
              <Typography variant="caption" color="text.secondary">1 session</Typography>
            </Stack>
            <Stack direction="row" spacing={0.75} alignItems="center">
              <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: theme.palette.primary.main }} />
              <Typography variant="caption" color="text.secondary">2+ sessions</Typography>
            </Stack>
          </Stack>
        </DialogContent>
      </Dialog>

      <VisibiliteSessionsModal
        open={dayModalOpen}
        onClose={() => setDayModalOpen(false)}
        title={dayModalTitle}
        sessions={dayModalSessions}
      />
    </>
  );
}
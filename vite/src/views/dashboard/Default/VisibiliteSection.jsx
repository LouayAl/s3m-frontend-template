import { useEffect, useState } from 'react';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import KPIBox from '../../../ui-component/cards/KPIBox';
import PeriodFilter, { presetRange } from './PeriodFilter';
import VisibiliteSessionsModal from './VisibiliteSessionsModal';
import { getVisibiliteKpis, getVisibiliteSessions } from '../../../api/kpiApi';
import PlanifiedSessionsCalendar from './PlanifiedSessionsCalendar';



export default function VisibiliteSection({ entrepriseId }) {
  const [period, setPeriod] = useState(presetRange(7));
  const [kpis, setKpis] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('');
  const [modalSessions, setModalSessions] = useState([]);

  useEffect(() => {
    getVisibiliteKpis(entrepriseId, period.start, period.end).then(setKpis).catch(() => setKpis(null));
    getVisibiliteSessions(entrepriseId, period.start, period.end).then(setSessions).catch(() => setSessions([]));
  }, [entrepriseId, period.start, period.end]);

  const openModal = (title, list) => {
    setModalTitle(title);
    setModalSessions(list);
    setModalOpen(true);
  };

  return (
    <Grid size={12}>
      <Stack spacing={2}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} justifyContent="space-between" alignItems={{ xs: 'stretch', sm: 'center' }}>
          <Typography variant="h6" fontWeight={700}>Visibilité — sessions à venir</Typography>
          <PeriodFilter value={period} onChange={setPeriod} />
        </Stack>

        {/* Flat 4-column grid: all four cards are siblings with identical sizing,
            so they're guaranteed equal widths — no nested grid, no width capping. */}
        <Grid container spacing={2} alignItems="stretch">
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <div onClick={() => openModal('Sessions planifiées', sessions)} style={{ cursor: 'pointer', height: '100%' }}>
              <KPIBox title="Sessions planifiées" value={kpis?.nbSessionsPlanifiees ?? '—'} color="#2381C0" />
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <div onClick={() => openModal('Sessions planifiées', sessions)} style={{ cursor: 'pointer', height: '100%' }}>
              <KPIBox title="Moy. participants / session" value={kpis?.moyenneParticipantsParSession ?? '—'} color="#66bb6a" />
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <div
              onClick={() => openModal('Sessions sans participant', sessions.filter((s) => s.nbParticipants === 0))}
              style={{ cursor: 'pointer', height: '100%' }}
            >
              <KPIBox title="Sessions à 0 participant" value={kpis?.nbSessionsZeroParticipant ?? '—'} color="#ff9800" />
            </div>
          </Grid>
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <PlanifiedSessionsCalendar entrepriseId={entrepriseId} />
          </Grid>
        </Grid>
      </Stack>

      <VisibiliteSessionsModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        title={modalTitle}
        sessions={modalSessions}
      />
    </Grid>
  );
}
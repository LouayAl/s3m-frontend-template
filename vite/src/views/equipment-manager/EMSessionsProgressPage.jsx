import { useState } from 'react';
import { Box, Button, Chip, CircularProgress, Snackbar, Alert, Typography, useMediaQuery, useTheme } from '@mui/material';
import { useNavigate, useParams } from 'react-router-dom';
import { useAuth } from '../../contexts/auth/AuthContext';

import { useSessionProgress }        from '../../hooks/useSessionProgress';
import DayTracker                    from './components/DayTracker';
import EvaluationPanel               from './components/EvaluationPanel';
import EvaluationsHistoryDialog      from './components/EvaluationHistoryDialog';
import CritereManagerModal           from './components/CritereManagerModal';
import SessionInfoCard               from './components/SessionInfoCard';
import DailyProgramPanel             from './components/DailyProgramPanel';
import ArrowBackIcon                 from '@mui/icons-material/ArrowBack';

export default function EMSessionsProgressPage() {
  const { id }    = useParams();
  const navigate  = useNavigate();
  const sessionId = Number(id);
  const { user }  = useAuth();
  const isEM      = user?.role === 'EQUIPMENT_MANAGER';
  const isTrainer = user?.role === 'TRAINER';

  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    session, evaluations, criteres, loading, saving,
    activeDay, setActiveDay,
    snackbar, closeSnackbar,
    isEvaluated, getEval, updateEval, updateRating,
    saveEval, reloadCriteres,
  } = useSessionProgress(sessionId);

  const STATUS_LABELS = {
    PLANIFIEE: "Scheduled",
    EN_COURS: "In Progress",
    TERMINEE: "Completed",
    ANNULEE: "Cancelled",
  };

  const STATUS_COLORS = {
    PLANIFIEE: "warning",
    EN_COURS: "primary",
    TERMINEE: "success",
    ANNULEE: "error",
  };

  const [histOpen,         setHistOpen]         = useState(false);
  const [critereModalOpen, setCritereModalOpen] = useState(false);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!session) {
    return (
      <Box sx={{ p: 3 }}>
        <Typography color="error">Session introuvable.</Typography>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1 }}>Retour</Button>
      </Box>
    );
  }

  const duree        = Number(session.dJours);
  const participants = session.participants ?? [];
  const activeDayHasEvaluations = participants.some(p => isEvaluated(p.idEmploye, activeDay));

  return (
    <Box sx={{ maxWidth: '100%', overflow: 'hidden' }}>
      {/* Breadcrumb */}
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{
          display: 'block',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap',
          maxWidth: '100%',
        }}
      >
        Formations › {session.formation} › {session.referenceSession}
      </Typography>

      {/* Back button + title row */}
      <Box sx={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: 1, mt: 0.5, mb: 0.5 }}>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => navigate('/em/sessions')}
          size="small"
        >
          {isMobile ? 'Retour' : 'Back to sessions'}
        </Button>
      </Box>

      <Typography variant={isMobile ? 'h5' : 'h4'} fontWeight={700} mb={0.5}>
        Progress tracking
      </Typography>

      <Chip
        label={`${STATUS_LABELS[session.statut] ?? session.statut} · Day ${activeDay} / ${duree}`}
        color={STATUS_COLORS[session.statut] ?? "default"}
        size="small"
        sx={{ fontWeight: 600, mb: 2 }}
      />

      {/* Stacked sections with consistent spacing */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: { xs: 1.5, md: 2 } }}>
        <SessionInfoCard session={session} activeDay={activeDay} />

        <DayTracker
          duree={duree}
          activeDay={activeDay}
          participants={participants}
          isEvaluated={isEvaluated}
          onDayChange={(d) => setActiveDay(d)}
        />

        <DailyProgramPanel
          sessionId={sessionId}
          activeDay={activeDay}
          session={session}
          canEdit={isTrainer || isEM}
        />

        <EvaluationPanel
          activeDay={activeDay}
          participants={participants}
          criteres={criteres}
          isEvaluated={isEvaluated}
          getEval={getEval}
          updateEval={updateEval}
          updateRating={updateRating}
          saving={saving}
          onSave={saveEval}
          onOpenHistory={() => setHistOpen(true)}
          onOpenCriteres={isEM ? () => setCritereModalOpen(true) : null}
        />
      </Box>

      <EvaluationsHistoryDialog
        open={histOpen}
        onClose={() => setHistOpen(false)}
        evaluations={evaluations}
        participants={participants}
      />

      {isEM && (
        <CritereManagerModal
          open={critereModalOpen}
          onClose={() => setCritereModalOpen(false)}
          sessionId={sessionId}
          jour={activeDay}
          hasEvaluations={activeDayHasEvaluations}
          onSaved={reloadCriteres}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Stepper, Step, StepLabel,
  CircularProgress, Alert, useMediaQuery, useTheme, MobileStepper,
} from '@mui/material';
import KeyboardArrowLeftIcon  from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckIcon from '@mui/icons-material/Check';
import SessionStep     from './addEval/SessionStep';
import ParticipantStep from './addEval/ParticipantStep';
import EvaluationStep  from './addEval/EvaluationStep';
import { getEmSessions } from '../../../api/emApi';
import { getSessionCriteres, saveEvaluation } from '../../../api/emApi';

const STEPS = ['Session', 'Participant & Day', 'Evaluation'];

export default function AddEvaluationModal({ open, onClose, onSubmit }) {
  const theme      = useTheme();
  const isMobile   = useMediaQuery(theme.breakpoints.down('sm'));

  // ─── Data ──────────────────────────────────────────────────────────────────
  const [sessions,        setSessions]        = useState([]);
  const [criteres,        setCriteres]        = useState([]);
  const [loadingSessions, setLoadingSessions] = useState(false);
  const [loadingCriteres, setLoadingCriteres] = useState(false);
  const [saving,          setSaving]          = useState(false);
  const [error,           setError]           = useState('');

  // ─── Form state ────────────────────────────────────────────────────────────
  const [step,                setStep]                = useState(0);
  const [selectedSession,     setSelectedSession]     = useState(null);
  const [selectedParticipant, setSelectedParticipant] = useState(null);
  const [selectedDay,         setSelectedDay]         = useState(null);
  const [scores,              setScores]              = useState({});
  const [remarks,             setRemarks]             = useState('');
  const [presence,            setPresence]            = useState('PRESENT');

  // ─── Reset + load on open ──────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setStep(0);
      setSelectedSession(null);
      setSelectedParticipant(null);
      setSelectedDay(null);
      setScores({});
      setRemarks('');
      setPresence('PRESENT');
      setCriteres([]);
      setError('');
      return;
    }
    setLoadingSessions(true);
    getEmSessions()
      .then(setSessions)
      .catch(() => setError('Erreur lors du chargement des sessions.'))
      .finally(() => setLoadingSessions(false));
  }, [open]);

  // ─── Load criteria when session + day change ───────────────────────────────
  useEffect(() => {
    if (!selectedSession || !selectedDay) { setCriteres([]); return; }
    setLoadingCriteres(true);
    getSessionCriteres(selectedSession.idSession, selectedDay)
      .then(setCriteres)
      .catch(() => setCriteres([]))
      .finally(() => setLoadingCriteres(false));
  }, [selectedSession, selectedDay]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleSelectSession = (s) => {
    setSelectedSession(s);
    setSelectedParticipant(null);
    setSelectedDay(null);
    setScores({});
    setCriteres([]);
  };

  const handleSelectDay = (d) => {
    setSelectedDay(d);
    setScores({});
  };

  const handleScoreChange = (critereIndex, value) => {
    setScores(prev => ({ ...prev, [critereIndex]: value }));
  };

  const handleNext = () => {
    setError('');
    setStep(prev => prev + 1);
  };

  const handleBack = () => {
    setError('');
    setStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setSaving(true);
    setError('');
    try {
      const saved = await saveEvaluation({
        idSession: selectedSession.idSession,
        idEmploye: selectedParticipant.idEmploye,
        jour:      Number(selectedDay),
        presence,
        remarques: remarks,
        scores:    Object.fromEntries(
          Object.entries(scores).map(([k, v]) => [Number(k), v])
        ),
      });
      onSubmit?.(saved);
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la sauvegarde.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Step validation ───────────────────────────────────────────────────────
  const canGoNext = [
    !!selectedSession,
    !!selectedParticipant && !!selectedDay,
    true,
  ][step];

  // ─── Render step content ───────────────────────────────────────────────────
  const stepContent = [
    <SessionStep
      sessions={sessions}
      loading={loadingSessions}
      selectedSession={selectedSession}
      onSelect={handleSelectSession}
    />,
    <ParticipantStep
      session={selectedSession}
      selectedParticipant={selectedParticipant}
      onSelectParticipant={setSelectedParticipant}
      selectedDay={selectedDay}
      onSelectDay={handleSelectDay}
      presence={presence}
      onPresenceChange={setPresence}
    />,
    <EvaluationStep
      selectedDay={selectedDay}
      selectedParticipant={selectedParticipant}
      presence={presence}
      criteres={criteres}
      loadingCriteres={loadingCriteres}
      scores={scores}
      onScoreChange={handleScoreChange}
      remarks={remarks}
      onRemarksChange={setRemarks}
    />,
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{
        sx: { borderRadius: isMobile ? 0 : 3 }
      }}
    >
      {/* Header */}
      <DialogTitle sx={{ bgcolor: 'primary.main', color: '#fff', pb: 1.5 }}>
        <Typography component="span" display="block" fontWeight={800} fontSize="1rem">
          Add an evaluation
        </Typography>
        <Typography component="span" display="block" color='inherit' variant="caption" sx={{ opacity: 0.85, mt: 0.25 }}>
          {STEPS[step]}
        </Typography>
      </DialogTitle>

      {/* Desktop stepper */}
      {!isMobile && (
        <Box sx={{ px: 3, pt: 2 }}>
          <Stepper activeStep={step} alternativeLabel>
            {STEPS.map((label, i) => (
              <Step key={label} completed={i < step}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      {/* Mobile stepper dots */}
      {isMobile && (
        <MobileStepper
          variant="dots"
          steps={3}
          position="static"
          activeStep={step}
          sx={{ bgcolor: 'background.default', px: 2 }}
          nextButton={<Box />}
          backButton={<Box />}
        />
      )}

      <DialogContent dividers sx={{ px: { xs: 2, sm: 3 }, py: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {stepContent[step]}
      </DialogContent>

      {/* Actions */}
      <DialogActions sx={{ px: { xs: 2, sm: 3 }, py: 2, gap: 1 }}>
        {step === 0 ? (
          <Button onClick={onClose} sx={{ mr: 'auto' }}>Cancel</Button>
        ) : (
          <Button
            onClick={handleBack}
            disabled={saving}
            startIcon={<KeyboardArrowLeftIcon />}
          >
            Back
          </Button>
        )}

        <Box sx={{ flex: 1 }} />

        {step < 2 ? (
          <Button
            variant="contained"
            disabled={!canGoNext}
            onClick={handleNext}
            endIcon={<KeyboardArrowRightIcon />}
            sx={{ minWidth: 120 }}
          >
            Next
          </Button>
        ) : (
          <Button
            variant="contained"
            color="success"
            onClick={handleSubmit}
            disabled={saving}
            startIcon={saving
              ? <CircularProgress size={16} color="inherit" />
              : <CheckIcon />
            }
            sx={{ minWidth: 140 }}
          >
            {saving ? 'Saving...' : 'Submit'}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
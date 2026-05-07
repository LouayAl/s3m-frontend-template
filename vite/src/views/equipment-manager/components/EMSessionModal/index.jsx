import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Stepper, Step, StepLabel,
  MobileStepper, CircularProgress, Alert,
  useMediaQuery, useTheme,
} from '@mui/material';
import KeyboardArrowLeftIcon  from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckIcon     from '@mui/icons-material/Check';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';

import Step1Formation    from './Step1Formation';
import Step2Calendar     from './Step2Calendar';
import Step3Details      from './Step3Details';
import Step4Participants from './Step4Participants';

import { getAllFormations, getAllFormateurs, createSession, updateParticipants, updateSession} from '../../../../api/sessionApi';
import { getAllEntreprises }  from '../../../../api/entrepriseApi';
import { getEmEmployes }      from '../../../../api/employeApi';

const STEPS = ['Formation', 'Jours', 'Détails', 'Participants'];

export default function EMSessionModal({ open, onClose, onCreated, showSnackbar, initialData  }) {
  const theme    = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEdit = Boolean(initialData);

  // ─── Data ──────────────────────────────────────────────────────────────────
  const [formations,  setFormations]  = useState([]);
  const [formateurs,  setFormateurs]  = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [employes,    setEmployes]    = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingEmps, setLoadingEmps] = useState(false);

  // ─── Form state ────────────────────────────────────────────────────────────
  const [step,                 setStep]                 = useState(0);
  const [selectedFormation,    setSelectedFormation]    = useState(null);
  const [selectedDays,         setSelectedDays]         = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [createdSession,       setCreatedSession]       = useState(null);
  const [formData,             setFormData]             = useState({
    referenceSession: '',
    idEntreprise:     null,
    idFournisseur:    null,
    idFormateur:      null,
    dHeures:          '',
  });
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  // ─── Load reference data on open ───────────────────────────────────────────
    useEffect(() => {
    if (!open) {
        setStep(0);
        setSelectedFormation(null);
        setSelectedDays([]);
        setSelectedParticipants([]);
        setCreatedSession(null);
        setFormData({ referenceSession:'', idEntreprise:null, idFournisseur:null, idFormateur:null, dHeures:'' });
        setError('');
        return;
    }

    // Load reference data
    setLoadingData(true);
    Promise.all([
        getAllFormations(),
        getAllFormateurs(),
        getAllEntreprises(),
    ])
        .then(([f, fo, e]) => {
        setFormations(f);
        setFormateurs(fo);
        setEntreprises(e);

        // Pre-fill if editing
        if (initialData) {
            setFormData({
            referenceSession: initialData.referenceSession ?? '',
            idEntreprise:     initialData.idEntreprise     ?? null,
            idFournisseur:    initialData.idFournisseur    ?? null,
            idFormateur:      initialData.idFormateur      ?? null,
            dHeures:          initialData.dHeures          ?? '',
            });

            // Pre-select formation from loaded list
            const formation = f.find(x => x.id === initialData.formationId);
            if (formation) setSelectedFormation(formation);

            // Pre-fill dates as selected days range
            if (initialData.dateDebut && initialData.dateFin) {
            const days = [];
            const start = new Date(initialData.dateDebut);
            const end   = new Date(initialData.dateFin);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                days.push(new Date(d));
            }
            setSelectedDays(days);
            }

            // Skip to details step directly in edit mode
            setStep(2);
        }
        })
        .catch(() => setError('Erreur lors du chargement des données.'))
        .finally(() => setLoadingData(false));

    setLoadingEmps(true);
    getEmEmployes()
        .then(setEmployes)
        .catch(() => setEmployes([]))
        .finally(() => setLoadingEmps(false));
    }, [open]);

  // ─── Auto-generate reference ───────────────────────────────────────────────
    useEffect(() => {
        if (!selectedFormation) return;
        const code = (selectedFormation.module ?? '').substring(0, 3).toUpperCase();
        const rand = Math.floor(Math.random() * 9000 + 1000);
        setFormData(prev => ({ ...prev, referenceSession: `${code}-${rand}` }));
    }, [selectedFormation]);

  const handleChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // ─── Step validation ───────────────────────────────────────────────────────
  const canGoNext = [
    !!selectedFormation,
    selectedDays.length > 0,
    !!formData.idEntreprise && !!formData.dHeures,
    true, // participants optional
  ][step];

  // ─── Create session (step 3 → 4) ──────────────────────────────────────────
  const handleCreateSession = async () => {
    setSaving(true);
    setError('');
    try {
      const sortedDays = [...selectedDays].sort((a, b) => a - b);
      const dateDebut  = sortedDays[0].toISOString().split('T')[0];
      const dateFin    = sortedDays[sortedDays.length - 1].toISOString().split('T')[0];

      const created = await createSession({
        idFormation:      selectedFormation.id,
        idEntreprise:     formData.idEntreprise,
        idFournisseur:    formData.idFournisseur ?? null,
        idFormateur:      formData.idFormateur   ?? null,
        dateDebut,
        dateFin,
        dJours:           selectedDays.length,
        dHeures:          Number(formData.dHeures),
        referenceSession: formData.referenceSession,
      });

      setCreatedSession(created);
      onCreated?.();
      setStep(3); // move to participants step
    } catch (err) {
      setError(err.response?.data?.message ?? 'Erreur lors de la création.');
    } finally {
      setSaving(false);
    }
  };

  // ─── update session () ──────────────────────────────────────────

  const handleUpdateSession = async () => {
    setSaving(true);
    setError('');
    try {
        const sortedDays = [...selectedDays].sort((a, b) => a - b);
        const dateDebut  = sortedDays[0].toISOString().split('T')[0];
        const dateFin    = sortedDays[sortedDays.length - 1].toISOString().split('T')[0];

        await updateSession(initialData.idSession, {
        idFormation:   selectedFormation?.id ?? initialData.formationId,
        idEntreprise:  formData.idEntreprise,
        idFournisseur: formData.idFournisseur ?? null,
        idFormateur:   formData.idFormateur   ?? null,
        dateDebut,
        dateFin,
        dJours:        selectedDays.length,
        dHeures:       Number(formData.dHeures),
        statut:        initialData.statut,
        });

        showSnackbar?.('Session mise à jour avec succès !');
        onCreated?.();
        onClose();
    } catch (err) {
        setError(err.response?.data?.message ?? 'Erreur lors de la mise à jour.');
    } finally {
        setSaving(false);
    }
  };

  // ─── Save participants then close ──────────────────────────────────────────
  const handleSaveParticipants = async () => {
    if (!createdSession) { onClose(); return; }
    setSaving(true);
    try {
      if (selectedParticipants.length > 0) {
        await updateParticipants(
          createdSession.idSession,
          selectedParticipants.map(p => p.idEmploye)
        );
        showSnackbar?.(`Session créée avec ${selectedParticipants.length} participant(s) !`);
      } else {
        showSnackbar?.('Session créée avec succès !');
      }
      onCreated?.();
      onClose();
    } catch {
      setError('Erreur lors de l\'ajout des participants.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Navigate to session progress page ────────────────────────────────────
  const handleGoToCriteres = async () => {
    await handleSaveParticipants();
    if (createdSession) {
      navigate(`/em/sessions/${createdSession.idSession}`);
    }
  };

  // ─── Step content ──────────────────────────────────────────────────────────
  const stepContent = [
    <Step1Formation
      formations={formations}
      loading={loadingData}
      selectedFormation={selectedFormation}
      onSelect={setSelectedFormation}
    />,
    <Step2Calendar
      selectedDays={selectedDays}
      onDaysChange={setSelectedDays}
    />,
    <Step3Details
      formData={formData}
      onChange={handleChange}
      formateurs={formateurs}
      entreprises={entreprises}
      selectedFormation={selectedFormation}
      selectedDays={selectedDays}
    />,
    <Step4Participants
      employes={employes}
      loading={loadingEmps}
      selectedParticipants={selectedParticipants}
      onSelectionChange={setSelectedParticipants}
    />,
  ];

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      {/* Header */}
      <DialogTitle sx={{ bgcolor:'primary.main', color:'#fff', pb:1.5 }}>
        <Typography component="span" display="block" fontWeight={800} fontSize="1rem">
          {isEdit ? 'Modifier la session' : 'Créer une session'}
        </Typography>
        <Typography component="span" display="block" variant="caption" sx={{ opacity:0.85, mt:0.25 }}>
          {STEPS[step]}
        </Typography>
      </DialogTitle>

      {/* Desktop stepper */}
      {!isMobile && (
        <Box sx={{ px:3, pt:2 }}>
          <Stepper activeStep={step} alternativeLabel>
            {STEPS.map((label, i) => (
              <Step key={label} completed={i < step}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>
      )}

      {/* Mobile dots */}
      {isMobile && (
        <MobileStepper
          variant="dots" steps={4} position="static"
          activeStep={step}
          sx={{ bgcolor:'background.default', px:2 }}
          nextButton={<Box />} backButton={<Box />}
        />
      )}

      <DialogContent dividers sx={{ px:{ xs:2, sm:3 }, py:2 }}>
        {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

        {/* Step 4 success banner */}
        {step === 3 && createdSession && (
          <Alert severity="success" sx={{ mb:2 }}>
            Session <strong>{createdSession.referenceSession}</strong> créée !
            Ajoutez des participants ci-dessous puis enregistrez.
          </Alert>
        )}

        {stepContent[step]}
      </DialogContent>

      <DialogActions sx={{ px:{ xs:2, sm:3 }, py:2, flexWrap:'wrap', gap:1 }}>
        {/* Left button */}
        {step === 0 && (
          <Button onClick={onClose}>Annuler</Button>
        )}
        {step > 0 && step < 3 && (
          <Button
            onClick={() => setStep(p => p - 1)}
            disabled={saving}
            startIcon={<KeyboardArrowLeftIcon />}
          >
            Retour
          </Button>
        )}

        <Box sx={{ flex:1 }} />

        {/* Right buttons */}
        {step < 2 && (
          <Button
            variant="contained"
            disabled={!canGoNext}
            onClick={() => setStep(p => p + 1)}
            endIcon={<KeyboardArrowRightIcon />}
            sx={{ minWidth:120 }}
          >
            Suivant
          </Button>
        )}

        {step === 2 && (
        <Button
            variant="contained"
            color="success"
            onClick={isEdit ? handleUpdateSession : handleCreateSession}
            disabled={saving || !canGoNext}
            startIcon={saving
            ? <CircularProgress size={16} color="inherit" />
            : <CheckIcon />
            }
            sx={{ minWidth:140 }}
        >
            {saving
            ? (isEdit ? 'Mise à jour...' : 'Création...')
            : (isEdit ? 'Mettre à jour' : 'Créer la session')
            }
        </Button>
        )}

        {step === 3 && (
          <>
            <Button
              variant="outlined"
              onClick={handleSaveParticipants}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
            >
              {saving ? 'Enregistrement...' : 'Terminer'}
            </Button>
            <Button
              variant="contained"
              color="primary"
              onClick={handleGoToCriteres}
              disabled={saving}
              startIcon={<AssignmentIcon />}
              sx={{ minWidth:180 }}
            >
              Terminer & configurer critères
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
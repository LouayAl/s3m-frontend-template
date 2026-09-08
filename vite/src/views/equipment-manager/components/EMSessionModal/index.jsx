// frontend-template/vite/src/views/equipment-manager/components/EMSessionModal/index.jsx
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, Stepper, Step, StepLabel,
  MobileStepper, CircularProgress, Alert,
  useMediaQuery, useTheme,
} from '@mui/material';
import KeyboardArrowLeftIcon  from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import CheckIcon      from '@mui/icons-material/Check';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useNavigate } from 'react-router-dom';

import Step1Formation    from './Step1Formation';
import Step2Calendar     from './Step2Calendar';
import Step3Details      from './Step3Details';
import Step4Participants from './Step4Participants';

import { useAuth } from '../../../../contexts/auth/AuthContext';
import { getEmFormations, cloneCriteresFromTemplate }          from '../../../../api/emApi';       // ← scoped + template clone
import { getAllFormateurs, createSession, updateParticipants, updateSession } from '../../../../api/sessionApi';
import { getEmEmployes }                                      from '../../../../api/employeApi';  // ← scoped
import { getAllEntreprises } from '../../../../api/entrepriseApi';
const STEPS = ['Training Course', 'Days', 'Details', 'Participants'];

function toLocalDateStr(d) {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function parseLocalDate(str) {
  const [y, m, d] = str.split('-').map(Number);
  return new Date(y, m - 1, d);
}

export default function EMSessionModal({ open, onClose, onCreated, showSnackbar, initialData }) {
  const theme    = useTheme();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isEdit   = Boolean(initialData);

  // Auth — entreprise pre-filled from here, never from a dropdown
  const { user } = useAuth();
  const entrepriseId = user?.entrepriseId ?? null;

  // ─── Reference data ───────────────────────────────────────────────────────
  const [formations,  setFormations]  = useState([]);
  const [formateurs,  setFormateurs]  = useState([]);
  const [employes,    setEmployes]    = useState([]);
  const [entreprises, setEntreprises] = useState([]);
  const [loadingData, setLoadingData] = useState(false);
  const [loadingEmps, setLoadingEmps] = useState(false);

  // ─── Form state ───────────────────────────────────────────────────────────
  const [step,                 setStep]                 = useState(0);
  const [selectedFormation,    setSelectedFormation]    = useState(null);
  const [selectedDays,         setSelectedDays]         = useState([]);
  const [selectedParticipants, setSelectedParticipants] = useState([]);
  const [createdSession,       setCreatedSession]       = useState(null);
  const [formData,             setFormData]             = useState({
    referenceSession: '',
    idFormateur:      null,
    dHeures:          '',
    templateId:       null,   // ← replaces sessionType
  });
  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState('');

  // ─── Load data on open ────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      // Full reset on close
      setStep(0);
      setSelectedFormation(null);
      setSelectedDays([]);
      setSelectedParticipants([]);
      setCreatedSession(null);
      setFormData({ referenceSession:'', idFormateur:null, dHeures:'', templateId:null });
      setError('');
      return;
    }

    setLoadingData(true);
    Promise.all([
      getEmFormations(),   // GET /api/em/formations — scoped to user's entreprise
      getAllFormateurs(),
    ])
      .then(([f, fo]) => {
        setFormations(f);
        setFormateurs(fo);

        if (initialData) {
          setFormData({
            referenceSession: initialData.referenceSession ?? '',
            idFormateur:      initialData.idFormateur      ?? null,
            dHeures:          initialData.dHeures          ?? '',
            templateId:       null,
          });
          // Pre-select formation
          const formation = f.find(x => x.id === initialData.formationId);
          if (formation) setSelectedFormation(formation);
          // Pre-fill days from date range
          if (initialData.dateDebut && initialData.dateFin) {
            const days  = [];
            const start = parseLocalDate(initialData.dateDebut); // ← fixed
            const end   = parseLocalDate(initialData.dateFin);   // ← fixed
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                days.push(new Date(d));
            }
            setSelectedDays(days);
          }
          setStep(2); // skip to details in edit mode
        }
      })
      .catch(() => setError('Erreur lors du chargement des données.'))
      .finally(() => setLoadingData(false));

    // Load employees (scoped to user's entreprise via /api/em/employes)
    setLoadingEmps(true);
    getEmEmployes()
      .then(setEmployes)
      .catch(() => setEmployes([]))
      .finally(() => setLoadingEmps(false));
  }, [open]);

  // ─── Auto-generate reference ──────────────────────────────────────────────
  useEffect(() => {
    if (!selectedFormation || isEdit) return;
    const code = (selectedFormation.module ?? '').substring(0, 3).toUpperCase();
    const rand  = Math.floor(Math.random() * 9000 + 1000);
    setFormData(prev => ({ ...prev, referenceSession: `${code}-${rand}` }));
  }, [selectedFormation]);

    useEffect(() => {
    getAllEntreprises().then(setEntreprises);
    }, []);
  const handleChange = (field, value) =>
    setFormData(prev => ({ ...prev, [field]: value }));

  // ─── Step validation ──────────────────────────────────────────────────────
  const canGoNext = [
    !!selectedFormation,          // step 0 — must pick a formation
    selectedDays.length > 0,      // step 1 — must pick at least 1 day
    !!formData.dHeures,           // step 2 — must enter hours (entreprise pre-filled)
    true,                         // step 3 — participants optional
  ][step];

  // ─── Create session ───────────────────────────────────────────────────────
  const handleCreateSession = async () => {
    setSaving(true);
    setError('');
    try {
      const sortedDays = [...selectedDays].sort((a, b) => a - b);
      const dateDebut = toLocalDateStr(sortedDays[0]);
      const dateFin   = toLocalDateStr(sortedDays[sortedDays.length - 1]);

      const created = await createSession({
        idFormation:      selectedFormation.id,
        idEntreprise:     entrepriseId,   // ← from auth, never from a dropdown
        idFournisseur:    entrepriseId,   // ← same: EM company is always fournisseur
        idFormateur:      formData.idFormateur ?? null,
        dateDebut,
        dateFin,
        dJours:           selectedDays.length,
        dHeures:          Number(formData.dHeures),
        referenceSession: formData.referenceSession,
      });

      setCreatedSession(created);

      if (formData.templateId) {
        try {
          await cloneCriteresFromTemplate(created.idSession, formData.templateId);
        } catch {
          showSnackbar?.("Session created, but the criteria template couldn't be copied — add criteria manually.", 'warning');
        }
      }

      onCreated?.();
      setStep(3);
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error during creation.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Update session ───────────────────────────────────────────────────────
  const handleUpdateSession = async () => {
    setSaving(true);
    setError('');
    try {
      const sortedDays = [...selectedDays].sort((a, b) => a - b);
      const dateDebut = toLocalDateStr(sortedDays[0]);  
      const dateFin   = toLocalDateStr(sortedDays[sortedDays.length - 1]); 

      await updateSession(initialData.idSession, {
        idFormation:   selectedFormation?.id ?? initialData.formationId,
        idEntreprise:  entrepriseId,
        idFournisseur: entrepriseId,
        idFormateur:   formData.idFormateur ?? null,
        dateDebut,
        dateFin,
        dJours:        selectedDays.length,
        dHeures:       Number(formData.dHeures),
        statut:        initialData.statut,
      });

      showSnackbar?.('Session successfully updated!');
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message ?? 'Error during update.');
    } finally {
      setSaving(false);
    }
  };

  // ─── Save participants then close ─────────────────────────────────────────
  const handleSaveParticipants = async () => {
    if (!createdSession) { onClose(); return; }
    setSaving(true);
    try {
      if (selectedParticipants.length > 0) {
        await updateParticipants(
          createdSession.idSession,
          selectedParticipants.map(p => p.idEmploye)
        );
        showSnackbar?.(`Session created with ${selectedParticipants.length} participant(s) !`);
      } else {
        showSnackbar?.('Session created successfully !');
      }
      onCreated?.();
      onClose();
    } catch {
      setError("Error during participant addition.");
    } finally {
      setSaving(false);
    }
  };

  const handleGoToCriteres = async () => {
    await handleSaveParticipants();
    if (createdSession) navigate(`/em/sessions/${createdSession.idSession}`);
  };

  // ─── Step content ─────────────────────────────────────────────────────────
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
      selectedFormation={selectedFormation}
      selectedDays={selectedDays}
      entreprises={entreprises}
      // NO entreprises prop — Step3Details reads from auth context directly
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
      open={open} onClose={onClose}
      maxWidth="sm" fullWidth
      fullScreen={isMobile}
      PaperProps={{ sx: { borderRadius: isMobile ? 0 : 3 } }}
    >
      <DialogTitle sx={{ bgcolor:'primary.main', color:'#fff', pb:1.5 }}>
        <Typography component="span" display="block" fontWeight={800} fontSize="1rem">
          {isEdit ? 'Edit session' : 'Create a new session'}
        </Typography>
        <Typography component="span" display="block" color='#fff' variant="caption" sx={{ opacity:0.85, mt:0.25 }}>
          {STEPS[step]}
        </Typography>
      </DialogTitle>

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

      {isMobile && (
        <MobileStepper variant="dots" steps={4} position="static" activeStep={step}
          sx={{ bgcolor:'background.default', px:2 }}
          nextButton={<Box />} backButton={<Box />}
        />
      )}

      <DialogContent dividers sx={{ px:{ xs:2, sm:3 }, py:2 }}>
        {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}
        {step === 3 && createdSession && (
          <Alert severity="success" sx={{ mb:2 }}>
            Session <strong>{createdSession.referenceSession}</strong> created !
            Add participants below then save.
          </Alert>
        )}
        {stepContent[step]}
      </DialogContent>

      <DialogActions sx={{ px:{ xs:2, sm:3 }, py:2, flexWrap:'wrap', gap:1 }}>
        {step === 0 && <Button onClick={onClose}>Cancel</Button>}
        {step > 0 && step < 3 && (
          <Button onClick={() => setStep(p => p - 1)} disabled={saving}
            startIcon={<KeyboardArrowLeftIcon />}>
            Back
          </Button>
        )}

        <Box sx={{ flex:1 }} />

        {step < 2 && (
          <Button variant="contained" disabled={!canGoNext}
            onClick={() => setStep(p => p + 1)}
            endIcon={<KeyboardArrowRightIcon />} sx={{ minWidth:120 }}>
            Next
          </Button>
        )}

        {step === 2 && (
          <Button variant="contained" color="success"
            onClick={isEdit ? handleUpdateSession : handleCreateSession}
            disabled={saving || !canGoNext}
            startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <CheckIcon />}
            sx={{ minWidth:140 }}>
            {saving
              ? (isEdit ? 'Updating...' : 'Creating...')
              : (isEdit ? 'Update'  : 'Create session')}
          </Button>
        )}

        {step === 3 && (
          <>
            <Button variant="outlined" onClick={handleSaveParticipants} disabled={saving}
              startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}>
              {saving ? 'Saving...' : 'Finish'}
            </Button>
            <Button variant="contained" color="primary" onClick={handleGoToCriteres}
              disabled={saving} startIcon={<AssignmentIcon />} sx={{ minWidth:180 }}>
              Finish &amp; configure criteria
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
}
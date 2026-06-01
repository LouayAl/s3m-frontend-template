import { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Typography, Button, Snackbar, Alert, CircularProgress, Stack } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import { getAllEntreprises } from '../../api/entrepriseApi';
import { getPlanification, savePlanification } from '../../api/planificationApi';
import { getAllSessions } from '../../api/sessionApi';
import { useAuth } from '../../contexts/auth/AuthContext';
import PlanificationFilters from './PlanificationFilters';
import PlanificationOverview from './PlanificationOverview';
import PlanificationObjectivesModal from './PlanificationObjectivesModal';
import { YEAR_OPTIONS, MONTH_KEYS, MONTH_KEY_TO_LABEL, emptyTargets } from './planificationConstants';

export default function PlanificationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [entreprises, setEntreprises] = useState([]);
  const [selectedYear, setSelectedYear] = useState(YEAR_OPTIONS[2] || new Date().getFullYear());
  const [selectedEntId, setSelectedEntId] = useState('');

  const [planData, setPlanData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [createdSessions, setCreatedSessions] = useState([]);

  const [openObjectivesModal, setOpenObjectivesModal] = useState(false);
  const [savingObjectives, setSavingObjectives] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  useEffect(() => {
    getAllEntreprises()
      .then(data => {
        setEntreprises(data);
        if (data.length > 0) setSelectedEntId(data[0].idEntreprise);
      })
      .catch(() => showSnackbar('Erreur lors du chargement des entreprises.', 'error'));
  }, []);

  const loadPlan = useCallback(async () => {
    if (!selectedEntId) return;
    setLoading(true);
    try {
      const data = await getPlanification(selectedYear, selectedEntId);
      setPlanData(data);
    } catch (err) {
      console.error('Erreur lors du chargement du plan :', err);
      showSnackbar('Erreur lors du chargement du plan.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedEntId]);

  const loadCreatedSessions = useCallback(async () => {
    try {
      const data = await getAllSessions();
      setCreatedSessions(data);
    } catch (err) {
      console.error('Erreur lors du chargement des sessions créées :', err);
      showSnackbar('Erreur lors du chargement des sessions créées.', 'error');
    }
  }, []);

  useEffect(() => {
    loadPlan();
  }, [loadPlan]);

  useEffect(() => {
    loadCreatedSessions();
  }, [selectedYear, selectedEntId, loadCreatedSessions]);

  const handleSaveObjectives = async (objectivesData) => {
    if (!selectedEntId) return;
    setSavingObjectives(true);

    try {
      const newTargets = emptyTargets();
      objectivesData.forEach((month) => {
        newTargets[month.month] = month.sessions.length;
      });

      const payload = {
        annee: selectedYear,
        entrepriseId: selectedEntId,
        ...Object.fromEntries(
          MONTH_KEYS.map((key) => [key, Number(newTargets[key]) || 0])
        ),
      };

      const data = await savePlanification(payload);
      setPlanData(data);
      showSnackbar('Objectifs enregistrés avec succès !');
      setOpenObjectivesModal(false);
    } catch (err) {
      console.error("Erreur lors de l'enregistrement des objectifs :", err);
      showSnackbar("Erreur lors de l'enregistrement.", "error");
    } finally {
      setSavingObjectives(false);
    }
  };

  const createdSessionsForSelection = useMemo(() => {
    if (!selectedEntId || !createdSessions.length) return [];
    return createdSessions.filter((session) => {
      const sessionYear = session.dateDebut ? new Date(session.dateDebut).getFullYear() : null;
      return sessionYear === selectedYear && Number(session.idEntreprise) === Number(selectedEntId);
    });
  }, [createdSessions, selectedYear, selectedEntId]);

  const createdMonthlyCounts = useMemo(() => {
    const counts = Array(12).fill(0);
    createdSessionsForSelection.forEach((session) => {
      if (!session.dateDebut) return;
      const month = new Date(session.dateDebut).getMonth();
      counts[month] += 1;
    });
    return counts;
  }, [createdSessionsForSelection]);

  const createdMonthlyParticipants = useMemo(() => {
    const counts = Array(12).fill(0);
    createdSessionsForSelection.forEach((session) => {
      if (!session.dateDebut) return;
      const month = new Date(session.dateDebut).getMonth();
      counts[month] += session.participants?.length || 0;
    });
    return counts;
  }, [createdSessionsForSelection]);

  const totalPlanifie = planData?.months.reduce((sum, month) => sum + month.planifie, 0) ?? 0;
  const totalCreated = createdSessionsForSelection.length;
  const totalParticipants = createdSessionsForSelection.reduce(
    (sum, session) => sum + (session.participants?.length || 0),
    0
  );

  const pct = totalPlanifie > 0 ? Math.round((totalCreated / totalPlanifie) * 100) : null;

  const chartData = planData
    ? planData.months.map((month, index) => ({
        name: MONTH_KEY_TO_LABEL[month.month] || month.label || month.month,
        Planifié: month.planifie,
        Créées: createdMonthlyCounts[index] || 0,
      }))
    : [];

  return (
    <Box p={3}>
      <Box sx={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
        <Box>
          <Typography variant="h4" fontWeight={700} mb={0.25}>
            Planification des sessions
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Planifiez vos sessions avec participants, puis comparez-les aux sessions créées dans la page Session.
          </Typography>
        </Box>
      </Box>

      <PlanificationFilters
        yearOptions={YEAR_OPTIONS}
        selectedYear={selectedYear}
        onYearChange={(e) => setSelectedYear(Number(e.target.value))}
        entreprises={entreprises}
        selectedEntId={selectedEntId}
        onEntrepriseChange={(e) => setSelectedEntId(e.target.value)}
        isAdmin={isAdmin}
        onEditObjectives={() => setOpenObjectivesModal(true)}
        disableEdit={loading || !planData}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Box>
          <PlanificationOverview
            planData={planData}
            totalPlanifie={totalPlanifie}
            totalCreated={totalCreated}
            totalParticipants={totalParticipants}
            actualMonthlyParticipants={createdMonthlyParticipants}
            chartData={chartData}
            selectedYear={selectedYear}
            pct={pct}
            createdMonthlyCounts={createdMonthlyCounts}
          />
        </Box>
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((prev) => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>

      <PlanificationObjectivesModal
        open={openObjectivesModal}
        onClose={() => setOpenObjectivesModal(false)}
        planData={planData}
        selectedYear={selectedYear}
        onSave={handleSaveObjectives}
        saving={savingObjectives}
      />
    </Box>
  );
}

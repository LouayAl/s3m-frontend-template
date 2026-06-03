import { useEffect, useMemo, useState, useCallback } from 'react';
import { Box, Typography, CircularProgress, Snackbar, Alert } from '@mui/material';
import { getAllEntreprises } from '../../api/entrepriseApi';
import { getPlanification, bulkAddSessions, updateSession, deleteSession } from '../../api/planificationApi';
import { useAuth } from '../../contexts/auth/AuthContext';
import PlanificationFilters from './PlanificationFilters';
import PlanificationOverview from './PlanificationOverview';
import { YEAR_OPTIONS } from './planificationConstants';

export default function PlanificationPage() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [entreprises, setEntreprises] = useState([]);
  const [selectedYear, setSelectedYear] = useState(YEAR_OPTIONS[2] || new Date().getFullYear());
  const [selectedEntId, setSelectedEntId] = useState('');

  const [planData, setPlanData] = useState(null); // { annee, entrepriseId, sessions, planned, actual }
  const [loading, setLoading] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar = (message, severity = 'success') =>
    setSnackbar({ open: true, message, severity });

  // Load entreprises (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    getAllEntreprises()
      .then(data => {
        setEntreprises(data);
        if (data.length > 0 && !selectedEntId) setSelectedEntId(data[0].idEntreprise);
      })
      .catch(() => showSnackbar('Erreur lors du chargement des entreprises.', 'error'));
  }, [isAdmin]);

  // Set entreprise from user context (non-admin)
  useEffect(() => {
    if (!isAdmin && user?.entrepriseId) setSelectedEntId(user.entrepriseId);
  }, [isAdmin, user?.entrepriseId]);

  const loadPlan = useCallback(async () => {
    if (!selectedEntId) return;
    setLoading(true);
    try {
      const data = await getPlanification(selectedYear, selectedEntId);
      setPlanData(data);
    } catch {
      showSnackbar('Erreur lors du chargement du plan.', 'error');
    } finally {
      setLoading(false);
    }
  }, [selectedYear, selectedEntId]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  // ── Handlers passed down to Overview ────────────────────────────────────────

    const handleBulkAdd = useCallback(async (payload) => {
    try {
        const data = await bulkAddSessions({
        ...payload,
        entrepriseId: selectedEntId
        });

        setPlanData(data);

        if (data.yearChanged && data.annee !== selectedYear) {
        setSelectedYear(data.annee);

        showSnackbar(
            `La session a été créée dans l'année ${data.annee}. Affichage basculé automatiquement.`
        );
        } else {
        showSnackbar('Sessions ajoutées avec succès !');
        }
    } catch {
        showSnackbar("Erreur lors de l'ajout des sessions.", "error");
    }
    }, [selectedEntId, selectedYear]);

    const handleUpdateSession = useCallback(async (id, payload) => {
    try {
        const data = await updateSession(id, selectedEntId, payload);

        setPlanData(data);

        if (data.yearChanged && data.annee !== selectedYear) {
        setSelectedYear(data.annee);

        showSnackbar(
            `La session a été déplacée vers ${data.annee}.`
        );
        } else {
        showSnackbar('Session mise à jour.');
        }
    } catch {
        showSnackbar('Erreur lors de la mise à jour.', 'error');
    }
    }, [selectedEntId, selectedYear]);

  const handleDeleteSession = useCallback(async (id) => {
    try {
      await deleteSession(id, selectedEntId);
      // Re-fetch to get fresh aggregates
      const data = await getPlanification(selectedYear, selectedEntId);
      setPlanData(data);
      showSnackbar('Session supprimée.');
    } catch {
      showSnackbar('Erreur lors de la suppression.', 'error');
    }
  }, [selectedEntId, selectedYear]);

  // ── Derived chart data from new response shape ───────────────────────────────
  const chartData = useMemo(() => {
    if (!planData?.planned) return [];
    let cumPlan = 0, cumActual = 0;
    return planData.planned.map((p, i) => {
      const a = planData.actual[i] ?? { sessionCount: 0, heures: 0 };
      cumPlan   += p.sessionCount;
      cumActual += a.sessionCount;
      return {
        name: p.monthLabel,
        'Planifié':          p.sessionCount,
        'Réalisé':           a.sessionCount,
        'Planifié Cumulé':   cumPlan,
        'Réalisé Cumulé':    cumActual,
      };
    });
  }, [planData]);

  const totalPlanifie = planData?.planned?.reduce((s, m) => s + m.sessionCount, 0) ?? 0;
  const totalActual   = planData?.actual?.reduce((s, m) => s + m.sessionCount, 0) ?? 0;
  const totalHeures   = planData?.actual?.reduce((s, m) => s + m.heures, 0) ?? 0;
  const pct = totalPlanifie > 0 ? Math.round((totalActual / totalPlanifie) * 100) : null;

  return (
    <Box p={3}>
      <Box sx={{ mb: 3 }}>
        <Typography variant="h4" fontWeight={700} mb={0.25}>
          Planification des sessions
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Planifiez vos sessions de formation par date, puis suivez leur réalisation mois par mois.
        </Typography>
      </Box>

      <PlanificationFilters
        yearOptions={YEAR_OPTIONS}
        selectedYear={selectedYear}
        onYearChange={(e) => setSelectedYear(Number(e.target.value))}
        entreprises={entreprises}
        selectedEntId={selectedEntId}
        onEntrepriseChange={(e) => setSelectedEntId(e.target.value)}
        isAdmin={isAdmin}
      />

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
          <CircularProgress />
        </Box>
      ) : (
        <PlanificationOverview
          planData={planData}
          chartData={chartData}
          selectedYear={selectedYear}
          totalPlanifie={totalPlanifie}
          totalActual={totalActual}
          totalHeures={totalHeures}
          pct={pct}
          isAdmin={isAdmin}
          onBulkAdd={handleBulkAdd}
          onUpdateSession={handleUpdateSession}
          onDeleteSession={handleDeleteSession}
        />
      )}

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(p => ({ ...p, open: false }))}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
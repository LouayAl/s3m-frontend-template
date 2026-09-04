// frontend-template/vite/src/views/dashboard/Default/index.jsx
import { useEffect, useState, useCallback } from 'react';

// material-ui
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';

// project imports
import StatusKpiCard from '../../../ui-component/cards/StatusKpiCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import DepartmentBarChart from './DepartementBarChart';
import FournisseurPieChart from './FournisseurPieChart';
import GenderPieChart from './GenderPieChart';
import CspPieChart from './CspPieChart';
import RemboursementPieChart from './RemboursementPieChart';
import YearFilter from './YearFilter';
import EntrepriseFilter from './EntrepriseFilter';

import { gridSpacing } from 'store/constant';
import { useAuth } from 'contexts/auth/AuthContext';
import { getClientKpis, getAvailableYears } from 'api/kpiApi';
import { getAllEntreprises } from 'api/entrepriseApi';
import DashboardSkeleton from './DashboardSkeleton';
import EmptyDashboardState from './EmptyDashboardState';
import { useGlobalFilter } from 'contexts/filters/GlobalFilterContext';

import VisibiliteSection from './VisibiliteSection';


export default function Dashboard() {
  const { user } = useAuth();
  const isAdmin = user?.role === 'ADMIN';

  const [isLoading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);
  const [entreprises, setEntreprises] = useState([]);
  const [entreprisesLoading, setEntreprisesLoading] = useState(false);

  const { selectedEntrepriseId, setSelectedEntrepriseId, selectedYears, setSelectedYears } = useGlobalFilter();
  const [availableYears, setAvailableYears] = useState([]);
  const [yearsLoading, setYearsLoading] = useState(true);
  const effectiveEntrepriseId = isAdmin ? (selectedEntrepriseId || null) : user?.entrepriseId;


  useEffect(() => {
    if (!isAdmin) return;

    setEntreprisesLoading(true);
    getAllEntreprises('CLIENT')
      .then((data) => setEntreprises(Array.isArray(data) ? data : []))
      .catch(() => setEntreprises([]))
      .finally(() => setEntreprisesLoading(false));
  }, [isAdmin]);

  // ── Fetch available years once ────────────────────────────────────────────
  useEffect(() => {
    if (effectiveEntrepriseId === undefined) return;

    setYearsLoading(true);
    getAvailableYears(effectiveEntrepriseId)
      .then((years) => {
        setAvailableYears(years);
        if (!years.includes(2026)) {
          setSelectedYears([]); // no 2026 data for this client — show all years instead
        }
      })
      .catch(() => setAvailableYears([]))
      .finally(() => setYearsLoading(false));
  }, [effectiveEntrepriseId]);

  // ── Fetch KPIs whenever clientId or selectedYears changes ─────────────────
  const fetchKpis = useCallback(async () => {
    if (effectiveEntrepriseId === undefined) return;

    try {
      const data = await getClientKpis(effectiveEntrepriseId, selectedYears);
      setKpis(data);
    } catch {
      setKpis(null);
    } finally {
      setLoading(false);
    }
  }, [effectiveEntrepriseId, selectedYears]);

  useEffect(() => {
    setLoading(true);
    fetchKpis();

    const interval = setInterval(fetchKpis, 30_000);
    return () => clearInterval(interval);
  }, [fetchKpis]);

  // ── Year change handler ───────────────────────────────────────────────────
  const handleYearsChange = (years) => {
    setSelectedYears(years);
  };

  const handleEntrepriseChange = (entrepriseId) => {
    setSelectedEntrepriseId(entrepriseId);
    setSelectedYears([2026]);
  };

  // ── Render guards ─────────────────────────────────────────────────────────
  if (isLoading) return <DashboardSkeleton />;
  if (!kpis)     return <EmptyDashboardState />;

  const {
    participantsByDepartment,
    hoursByDepartment,
    hoursByFamilleFormation,
    hoursByFournisseur,
    population,
    remboursementByType,
    totalFormationHours,
    totalSessions,
    realiseeKpi,
    planifieeKpi,
    autresKpi,
  } = kpis;

  return (
    <Grid container spacing={gridSpacing}>

      {/* ── Year filter bar ─────────────────────────────────────────────── */}
      <Grid size={12}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems={{ xs: 'stretch', sm: 'center' }}>
          {isAdmin && (
            <EntrepriseFilter
              entreprises={entreprises}
              selectedEntrepriseId={selectedEntrepriseId}
              onChange={handleEntrepriseChange}
              loading={entreprisesLoading}
            />
          )}
          <YearFilter
            availableYears={availableYears}
            selectedYears={selectedYears}
            onChange={handleYearsChange}
            loading={yearsLoading}
          />
        </Stack>
      </Grid>

      <VisibiliteSection entrepriseId={effectiveEntrepriseId} />

      {/* ── Top KPI cards ────────────────────────────────────────────────── */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <StatusKpiCard
              isLoading={isLoading}
              variant="realisee"
              title="Sessions Réalisées"
              totalHeures={realiseeKpi?.totalHeures}
              totalSessions={realiseeKpi?.totalSessions}
              totalParticipants={realiseeKpi?.totalParticipants}
            />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <StatusKpiCard
              isLoading={isLoading}
              variant="planifiee"
              title="Sessions Planifiées"
              totalHeures={planifieeKpi?.totalHeures}
              totalSessions={planifieeKpi?.totalSessions}
              totalParticipants={planifieeKpi?.totalParticipants}
            />
          </Grid>
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <StatusKpiCard
              isLoading={isLoading}
              variant="autres"
              title="Autres Sessions"
              totalHeures={autresKpi?.totalHeures}
              totalSessions={autresKpi?.totalSessions}
              totalParticipants={autresKpi?.totalParticipants}
            />
          </Grid>
        </Grid>
      </Grid>

      {/* ── Growth + Participants per Department ─────────────────────────── */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, sm: 6 }}>
            {/*
              Pass selectedYears so the growth chart re-fetches when the
              year filter changes. The chart manages its own period/drilldown
              state internally.
            */}
            <TotalGrowthBarChart
              isLoading={isLoading}
              entrepriseId={effectiveEntrepriseId}
              selectedYears={selectedYears}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DepartmentBarChart
              title="Participants par Département"
              data={participantsByDepartment || []}
              isLoading={isLoading}
              type="participants"
            />
          </Grid>
        </Grid>
      </Grid>

      {/* ── Hours by Department / Famille ───────────────────────────────── */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DepartmentBarChart
              title="Heures par Département"
              data={hoursByDepartment || []}
              isLoading={isLoading}
              type="hours"
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <DepartmentBarChart
              title="Heures par Famille de Formation"
              data={hoursByFamilleFormation || []}
              isLoading={isLoading}
              type="famille"
            />
          </Grid>
        </Grid>
      </Grid>

      {/* ── Pie charts ───────────────────────────────────────────────────── */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, sm: 6 }}>
            <FournisseurPieChart
              data={hoursByFournisseur || []}
              isLoading={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <RemboursementPieChart
              data={remboursementByType || []}
              isLoading={isLoading}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <GenderPieChart
              isLoading={isLoading}
              data={population?.genderHours || []}
            />
          </Grid>
          <Grid size={{ xs: 12, sm: 6 }}>
            <CspPieChart
              isLoading={isLoading}
              data={population?.cspHours || []}
            />
          </Grid>
        </Grid>
      </Grid>

    </Grid>
  );
}

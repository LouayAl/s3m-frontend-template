// frontend-template/vite/src/views/dashboard/Default/index.jsx
import { useEffect, useState, useCallback } from 'react';

// material-ui
import Grid from '@mui/material/Grid';

// project imports
import TotalFormationHoursCard from './TotalFormationHoursCard';
import TotalSessionsCardDark from '../../../ui-component/cards/TotalSessionsDarkCard';
import TotalParticipantsCard from '../../../ui-component/cards/TotalParticipantsCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import DepartmentBarChart from './DepartementBarChart';
import FournisseurPieChart from './FournisseurPieChart';
import GenderPieChart from './GenderPieChart';
import CspPieChart from './CspPieChart';
import RemboursementPieChart from './RemboursementPieChart';
import YearFilter from './YearFilter';

import { gridSpacing } from 'store/constant';
import { useAuth } from 'contexts/auth/AuthContext';
import { getClientKpis, getAvailableYears } from 'api/kpiApi';
import DashboardSkeleton from './DashboardSkeleton';
import EmptyDashboardState from './EmptyDashboardState';

export default function Dashboard() {
  const { user } = useAuth();

  const [isLoading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);

  // Year-filter state
  const [availableYears, setAvailableYears] = useState([]);
  const [yearsLoading, setYearsLoading] = useState(true);
  const [selectedYears, setSelectedYears] = useState([]); // [] = "all years"

  // ── Fetch available years once ────────────────────────────────────────────
  useEffect(() => {
    if (!user?.entrepriseId) return;

    getAvailableYears(user.entrepriseId)
      .then((years) => setAvailableYears(years))
      .catch(() => setAvailableYears([]))
      .finally(() => setYearsLoading(false));
  }, [user?.entrepriseId]);

  // ── Fetch KPIs whenever clientId or selectedYears changes ─────────────────
  const fetchKpis = useCallback(async () => {
    if (!user?.entrepriseId) return;

    try {
      const data = await getClientKpis(user.entrepriseId, selectedYears);
      setKpis(data);
    } catch {
      setKpis(null);
    } finally {
      setLoading(false);
    }
  }, [user?.entrepriseId, selectedYears]);

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
  } = kpis;

  return (
    <Grid container spacing={gridSpacing}>

      {/* ── Year filter bar ─────────────────────────────────────────────── */}
      <Grid size={12}>
        <YearFilter
          availableYears={availableYears}
          selectedYears={selectedYears}
          onChange={handleYearsChange}
          loading={yearsLoading}
        />
      </Grid>

      {/* ── Top KPI cards ────────────────────────────────────────────────── */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalFormationHoursCard
              isLoading={isLoading}
              totalHours={totalFormationHours}
            />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalSessionsCardDark
              isLoading={isLoading}
              totalSessions={totalSessions}
            />
          </Grid>
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <TotalParticipantsCard
              isLoading={isLoading}
              totalParticipants={population?.totalParticipants || 0}
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
              entrepriseId={user.entrepriseId}
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
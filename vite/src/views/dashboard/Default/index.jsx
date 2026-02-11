// frontend-template/vite/src/views/dashboard/Default/index.jsx
import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';

// project imports
import TotalFormationHoursCard from './TotalFormationHoursCard';
import PopularCard from './PopularCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalSessionsCardDark from '../../../ui-component/cards/TotalSessionsDarkCard';
import TotalParticipantsCard from '../../../ui-component/cards/TotalParticipantsCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import DepartmentBarChart from './DepartementBarChart';
import FournisseurPieChart from './FournisseurPieChart';
import GenderPieChart from './GenderPieChart';
import CspPieChart from './CspPieChart';
import RemboursementPieChart from './RemboursementPieChart';

import { gridSpacing } from 'store/constant';
import { useAuth } from 'contexts/auth/AuthContext';
import { getClientKpis } from 'api/kpiApi';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [isLoading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    if (!user?.entrepriseId) {
      setLoading(false);
      return;
    }

    const fetchKpis = async () => {
      try {
        const data = await getClientKpis(user.entrepriseId, token);
        setKpis(data);
      } catch (err) {
        console.error('Failed to fetch KPIs:', err);
        setKpis(null);
      } finally {
        setLoading(false);
      }
    };

    fetchKpis();
  }, [token, user?.entrepriseId]);

    if (!kpis) return <div>No KPI data available.</div>;


  const {
    participantsByDepartment,
    hoursByDepartment,
    hoursByFamilleFormation,
    hoursByFournisseur,
    population,
    remboursementByType,
    totalFormationHours,
    totalSessions
  } = kpis;

  return (
    <Grid container spacing={gridSpacing}>

      {/* Top Row */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalFormationHoursCard 
            isLoading={isLoading}
            totalHours={totalFormationHours}
            />
          </Grid>

          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard 
            isLoading={isLoading}
            />
          </Grid>

          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={gridSpacing}>

              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalSessionsCardDark 
                isLoading={isLoading} 
                totalSessions={totalSessions} 
                />
              </Grid>

              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalParticipantsCard
                  isLoading={isLoading}
                  totalParticipants={population?.totalParticipants || 0}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Growth + Popular */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TotalGrowthBarChart 
            isLoading={isLoading} 
            entrepriseId={user.entrepriseId} 
            token={token} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <PopularCard isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>

      {/* Department charts */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DepartmentBarChart
              title="Participants par Département"
              data={participantsByDepartment || []}
              isLoading={isLoading}
              type="participants"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DepartmentBarChart
              title="Heures par Département"
              data={hoursByDepartment || []}
              isLoading={isLoading}
              type="hours"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DepartmentBarChart
              title="Heures par Famille de Formation"
              data={hoursByFamilleFormation || []}
              isLoading={isLoading}
              type="famille"
            />
          </Grid>
        </Grid>
      </Grid>

      {/* Pie charts */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FournisseurPieChart
              data={hoursByFournisseur || []}
              isLoading={isLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <RemboursementPieChart
              data={remboursementByType || []}
              isLoading={isLoading}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <GenderPieChart
              isLoading={isLoading}
              data={population?.genderHours || []}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
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

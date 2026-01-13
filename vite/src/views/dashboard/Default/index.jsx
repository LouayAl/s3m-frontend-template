// frontend-template/vite/src/views/dashboard/Default/index.jsx
import { useEffect, useState } from 'react';

// material-ui
import Grid from '@mui/material/Grid';

// project imports
import EarningCard from './EarningCard';
import PopularCard from './PopularCard';
import TotalOrderLineChartCard from './TotalOrderLineChartCard';
import TotalIncomeDarkCard from '../../../ui-component/cards/TotalIncomeDarkCard';
import TotalIncomeLightCard from '../../../ui-component/cards/TotalIncomeLightCard';
import TotalGrowthBarChart from './TotalGrowthBarChart';
import DepartmentBarChart from './DepartementBarChart';
import FournisseurPieChart from './FournisseurPieChart';
import { gridSpacing } from 'store/constant';
import { useAuth } from 'contexts/auth/AuthContext';
import { getClientKpis } from 'api/kpiApi';
import StorefrontTwoToneIcon from '@mui/icons-material/StorefrontTwoTone';

export default function Dashboard() {
  const { token, user } = useAuth();
  const [isLoading, setLoading] = useState(true);
  const [kpis, setKpis] = useState(null);

  useEffect(() => {
    if (!user?.entrepriseId) return setLoading(false);

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
  }, [token, user]);

  if (isLoading) return <div>Loading dashboard...</div>;
  if (!kpis) return <div>No KPI data available.</div>;

  const {
    participantsByDepartment,
    hoursByDepartment,
    hoursByFamilleFormation,
    hoursByFournisseur
  } = kpis;

  return (
    <Grid container spacing={gridSpacing}>
      {/* Top Row: Earning, Orders, Income */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <EarningCard isLoading={isLoading} />
          </Grid>
          <Grid size={{ lg: 4, md: 6, sm: 6, xs: 12 }}>
            <TotalOrderLineChartCard isLoading={isLoading} />
          </Grid>
          <Grid size={{ lg: 4, md: 12, sm: 12, xs: 12 }}>
            <Grid container spacing={gridSpacing}>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeDarkCard isLoading={isLoading} />
              </Grid>
              <Grid size={{ sm: 6, xs: 12, md: 6, lg: 12 }}>
                <TotalIncomeLightCard
                  isLoading={isLoading}
                  total={203}
                  label="Total Income"
                  icon={<StorefrontTwoToneIcon fontSize="inherit" />}
                />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* Growth Chart + Popular Card */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 8 }}>
            <TotalGrowthBarChart isLoading={isLoading} />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <PopularCard isLoading={isLoading} />
          </Grid>
        </Grid>
      </Grid>

      {/* Added Charts: Department & Training Family & Pie Chart */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 4 }}>
            <DepartmentBarChart
              title="Participants by Department"
              data={participantsByDepartment?.length ? participantsByDepartment : []}
              isLoading={isLoading}
              type="participants"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DepartmentBarChart
              title="Hours by Department"
              data={hoursByDepartment?.length ? hoursByDepartment : []}
              isLoading={isLoading}
              type="hours"
            />
          </Grid>
          <Grid size={{ xs: 12, md: 4 }}>
            <DepartmentBarChart
              title="Hours by Training Family"
              data={hoursByFamilleFormation?.length ? hoursByFamilleFormation : []}
              isLoading={isLoading}
              type="famille"
            />
          </Grid>
        </Grid>
      </Grid>

      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 6 }}>
            <FournisseurPieChart
              title="Hours by Trainer"
              data={hoursByFournisseur?.length ? hoursByFournisseur : []}
              isLoading={isLoading}
            />
          </Grid>
        </Grid>
      </Grid>
    </Grid>
  );
}

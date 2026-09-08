import PropTypes from 'prop-types';
import { useEffect, useState } from 'react';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Chart from 'react-apexcharts';

import MainCard from 'ui-component/cards/MainCard';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import { gridSpacing } from 'store/constant';
import useConfig from 'hooks/useConfig';
import { useAuth } from 'contexts/auth/AuthContext';

const TYPE_META = {
  participants: { title: (t) => t, subtitle: 'Nombre de participants par département', seriesName: 'Participants' },
  hours: { title: (t) => `${t} (Heures-Participants)`, subtitle: 'Heures de formation × nombre de participants, par département', seriesName: 'Heures-Participants' },
  famille: { title: (t) => `${t} (Heures-Participants)`, subtitle: 'Heures de formation × nombre de participants, par famille', seriesName: 'Heures-Participants' }
};

export default function DepartmentBarChart({ isLoading, data, title, type }) {
  const theme = useTheme();
  const { state: { fontFamily } } = useConfig();
  const { user } = useAuth();
  const myDepartementId = user?.departementId ?? null;

  const [chartOptions, setChartOptions] = useState({});
  const [series, setSeries] = useState([]);

  const palette = ['#1976d2', '#0d47a1', '#f57c00', '#43a047', '#0288d1', '#7b1fa2', '#fbc02d'];
  const HIGHLIGHT_COLOR = '#e53935';
  const meta = TYPE_META[type] || TYPE_META.hours;

  useEffect(() => {
    if (!data || data.length === 0) {
      setSeries([]);
      setChartOptions({});
      return;
    }

    let categories = [];
    let values = [];
    let labelKey = 'departement';

    if (type === 'participants') {
      categories = data.map((d) => d.departement || 'Unknown');
      values = data.map((d) => d.nbParticipants || 0);
    }
    if (type === 'hours') {
      categories = data.map((d) => d.departement || 'Unknown');
      values = data.map((d) => d.totalHeures || 0);
    }
    if (type === 'famille') {
      categories = data.map((d) => d.familleFormation || 'Réglementaire');
      values = data.map((d) => d.totalHeures || 0);
      labelKey = 'familleFormation';
    }

    // "famille" bars are formation categories, never departments — never highlighted
    const colors = data.map((d, idx) =>
      type !== 'famille' && myDepartementId != null && d.departementId === myDepartementId
        ? HIGHLIGHT_COLOR
        : palette[idx % palette.length]
    );

    setSeries([{ name: meta.seriesName, data: values }]);
    setChartOptions({
      chart: { type: 'bar', fontFamily },
      plotOptions: { bar: { distributed: true, dataLabels: { position: 'top' } } },
      dataLabels: { enabled: true, style: { colors: ['#000000'] }, formatter: (val) => val },
      xaxis: { categories, labels: { style: { colors: theme.palette.text.primary } } },
      yaxis: { labels: { style: { colors: theme.palette.text.primary } } },
      colors,
      tooltip: {
        theme: 'light',
        custom:
          type === 'participants'
            ? undefined
            : function ({ dataPointIndex }) {
                const d = data[dataPointIndex] || {};
                const total = d.totalHeures ?? 0;
                const hasBreakdown = d.sessionHeures != null && d.nbParticipants != null;
                const label = d[labelKey] || 'Unknown';
                return `
                  <div style="padding:8px 12px;">
                    <div style="font-weight:600;margin-bottom:4px;">${label}</div>
                    <div>${total.toLocaleString()} heures-participants</div>
                    ${hasBreakdown ? `<div style="font-size:11px;opacity:0.75;margin-top:2px;">${d.sessionHeures.toLocaleString()} h de session × ${d.nbParticipants.toLocaleString()} participants</div>` : ''}
                  </div>`;
              }
      },
      grid: { borderColor: theme.palette.divider }
    });
  }, [data, theme, fontFamily, title, type, meta.seriesName, myDepartementId]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Stack spacing={gridSpacing}>
            <Box>
              <Typography variant="h6">{meta.title(title)}</Typography>
              <Typography variant="caption" color="textSecondary">{meta.subtitle}</Typography>
            </Box>
            <Box>
              {series.length > 0 ? (
                <Chart options={chartOptions} series={series} type="bar" height={535} />
              ) : (
                <Typography variant="body2" color="textSecondary">No data available</Typography>
              )}
            </Box>
          </Stack>
        </MainCard>
      )}
    </>
  );
}

DepartmentBarChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.array,
  title: PropTypes.string,
  type: PropTypes.oneOf(['participants', 'hours', 'famille'])
};
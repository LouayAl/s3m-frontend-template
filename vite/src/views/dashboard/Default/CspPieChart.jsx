// frontend-template/vite/src/views/dashboard/Default/CspPieChart.jsx
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

export default function CspPieChart({ isLoading = false, data = [] }) {
  const theme = useTheme();
  const {
    state: { fontFamily }
  } = useConfig();
  const CHART_COLORS = [
    '#2196F3', // blue
    '#FF6B35', // orange
    '#4CAF50', // green
    '#9C27B0', // purple
    '#F44336', // red
    '#00BCD4', // cyan
    '#FF9800', // amber
    '#795548', // brown
    '#607D8B', // blue-grey
    '#E91E63', // pink
  ];

  const [chartOptions, setChartOptions] = useState({
    labels: [],
      colors: CHART_COLORS,
    legend: { position: 'bottom', labels: { colors: theme.palette.text.primary } },
    chart: { fontFamily },
    tooltip: { theme: 'light', y: { formatter: (val, opts) => `${val} h` } }
  });
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setSeries(data.map((d) => Number(d.totalHeures ?? 0)));
      setChartOptions((prev) => ({
        ...prev,
        labels: data.map((d) => d.csp || 'N/A')
      }));
    } else {
      setSeries([]);
      setChartOptions((prev) => ({ ...prev, labels: [] }));
    }
  }, [data, theme.palette.primary.main, theme.palette.text.primary, fontFamily]);

  return isLoading ? (
    <SkeletonTotalGrowthBarChart />
  ) : (
    <MainCard>
      <Stack spacing={gridSpacing}>
        <Typography variant="h6">Répartition des heures de formation par CSP</Typography>
        <Box>
          {series.length > 0 ? (
            <Chart options={chartOptions} series={series} type="pie" height={350} />
          ) : (
            <Typography variant="body2" color="textSecondary">
              No data available
            </Typography>
          )}
        </Box>
      </Stack>
    </MainCard>
  );
}

CspPieChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      csp: PropTypes.string,
      totalHeures: PropTypes.number,
      nombreEmployes: PropTypes.number
    })
  )
};

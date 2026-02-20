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

  const [chartOptions, setChartOptions] = useState({
    labels: [],
    colors: [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.error.main,
      theme.palette.warning.main,
      theme.palette.info.main
    ],
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

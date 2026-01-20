// frontend-template/vite/src/views/dashboard/Default/RemboursementPieChart.jsx
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

export default function RemboursementPieChart({ isLoading = false, data = [] }) {
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
      theme.palette.warning.main
    ],
    legend: { position: 'bottom', labels: { colors: theme.palette.text.primary } },
    chart: { fontFamily },
    tooltip: { theme: 'light' }
  });
  const [series, setSeries] = useState([]);

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      setSeries(data.map((d) => Number(d.totalHeures ?? 0)));
      setChartOptions((prev) => ({
        ...prev,
        labels: data.map((d) => d.typeRemboursement || 'Unknown')
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
        <Typography variant="h6">Répartition nb heures par dispositif de remboursement prévu</Typography>
        <Box>
          {series.length > 0 ? (
            <Chart options={chartOptions} series={series} type="pie" height={400} />
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

RemboursementPieChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      typeRemboursement: PropTypes.string,
      totalHeures: PropTypes.number
    })
  )
};

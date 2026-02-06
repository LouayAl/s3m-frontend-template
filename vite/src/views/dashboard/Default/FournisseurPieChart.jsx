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

export default function FournisseurBarChart({ isLoading = false, data = [] }) {
  const theme = useTheme();
  const {
    state: { fontFamily }
  } = useConfig();

  const [chartOptions, setChartOptions] = useState({});
  const [series, setSeries] = useState([]);

  // Define a fixed palette similar to other charts
  const palette = ['#2196f3', '#1565c0', '#ff9800', '#4caf50', '#64b5f6', '#1976d2', '#ffa726', '#81c784'];

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const categories = data.map((d) => d.fournisseur || 'Unknown');
      const values = data.map((d) => d.totalHeures || 0);

      // Assign colors based on palette, cycling if more bars than colors
      const colors = categories.map((_, index) => palette[index % palette.length]);

      setSeries([
        {
          name: 'Heures',
          data: values
        }
      ]);

      setChartOptions({
        chart: { type: 'bar', fontFamily },
        xaxis: {
          categories,
          labels: { style: { colors: theme.palette.text.primary } }
        },
        yaxis: {
          labels: { style: { colors: theme.palette.text.primary } }
        },
        colors, // each bar gets its corresponding color
        plotOptions: {
          bar: {
            distributed: true, // enables per-bar colors
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ['#000000'] // black color for values on top of bars
          },
          formatter: function (val) {
            return val; // show value
          }
        },
        tooltip: { theme: 'light' },
        grid: { borderColor: theme.palette.divider }
      });
    } else {
      setSeries([]);
      setChartOptions({});
    }
  }, [data, fontFamily, theme.palette.text.primary]);

  return isLoading ? (
    <SkeletonTotalGrowthBarChart />
  ) : (
    <MainCard>
      <Stack spacing={gridSpacing}>
        <Typography variant="h6">Heures par fournisseur</Typography>
        <Box>
          {series.length > 0 ? (
            <Chart options={chartOptions} series={series} type="bar" height={400} />
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

FournisseurBarChart.propTypes = {
  isLoading: PropTypes.bool,
  data: PropTypes.arrayOf(
    PropTypes.shape({
      fournisseur: PropTypes.string,
      totalHeures: PropTypes.number
    })
  )
};

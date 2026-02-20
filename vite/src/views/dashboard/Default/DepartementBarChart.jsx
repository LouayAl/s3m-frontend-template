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

export default function DepartmentBarChart({ isLoading, data, title, type }) {
  const theme = useTheme();
  const {
    state: { fontFamily }
  } = useConfig();

  const [chartOptions, setChartOptions] = useState({});
  const [series, setSeries] = useState([]);

  // Fixed color palette
  const palette = [
    '#1976d2', // blue
    '#0d47a1', // dark blue
    '#f57c00', // orange
    '#43a047', // green
    '#0288d1', // light blue
    '#7b1fa2', // purple
    '#fbc02d'  // yellow
  ];

  useEffect(() => {
    if (!data || data.length === 0) {
      setSeries([]);
      setChartOptions({});
      return;
    }

    let categories = [];
    let values = [];

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
    }

    // Map colors to categories
    const colors = categories.map((_, idx) => palette[idx % palette.length]);

    setSeries([
      {
        name: title,
        data: values
      }
    ]);

    setChartOptions({
      chart: { type: 'bar', fontFamily },
      plotOptions: {
        bar: {
          distributed: true, // each bar a different color
          dataLabels: { position: 'top' }
        }
      },
      dataLabels: {
        enabled: true,
        style: { colors: ['#000000'] }, // black numbers
        formatter: (val) => val
      },
      xaxis: {
        categories,
        labels: { style: { colors: theme.palette.text.primary } }
      },
      yaxis: {
        labels: { style: { colors: theme.palette.text.primary } }
      },
      colors,
      tooltip: { theme: 'light' },
      grid: { borderColor: theme.palette.divider }
    });
  }, [data, theme, fontFamily, title, type]);

  return (
    <>
      {isLoading ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Stack spacing={gridSpacing}>
            <Typography variant="h6">{title}</Typography>
            <Box>
              {series.length > 0 ? (
                <Chart options={chartOptions} series={series} type="bar" height={535} />
              ) : (
                <Typography variant="body2" color="textSecondary">
                  No data available
                </Typography>
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

// frontend-template/vite/src/views/dashboard/Default/TotalGrowthBarChart.jsx

import PropTypes from 'prop-types';
import { useEffect, useState, useMemo } from 'react';

// material-ui
import { useTheme } from '@mui/material/styles';
import MenuItem from '@mui/material/MenuItem';
import Stack from '@mui/material/Stack';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

// third-party
import Chart from 'react-apexcharts';

// project imports
import useConfig from 'hooks/useConfig';
import SkeletonTotalGrowthBarChart from 'ui-component/cards/Skeleton/TotalGrowthBarChart';
import MainCard from 'ui-component/cards/MainCard';
import { gridSpacing } from 'store/constant';

import { useAuth } from 'contexts/auth/AuthContext';
import { getClientTotalGrowth } from 'api/kpiApi';

export default function TotalGrowthBarChart({ isLoading }) {
  const theme = useTheme();
  const {
    state: { fontFamily }
  } = useConfig();

  // ✅ only user is needed now
  const { user } = useAuth();

  const [chartData, setChartData] = useState(null);
  const [period, setPeriod] = useState('monthly');
  const [selectedMonth, setSelectedMonth] = useState('');

  const textPrimary = theme.vars.palette.text.primary;
  const divider = theme.vars.palette.divider;
  const grey500 = theme.vars.palette.grey[500];
  const primary200 = theme.vars.palette.primary[200];
  const secondaryMain = theme.vars.palette.secondary.main;

  // ✅ Fetch KPI data (cookie auth)
  useEffect(() => {
    if (!user?.entrepriseId) return;

    const fetchData = async () => {
      try {
        const monthParam = period === 'daily' ? selectedMonth : '';

        // ✅ token removed
        const totalGrowth = await getClientTotalGrowth(
          user.entrepriseId,
          period,
          monthParam
        );

        if (!totalGrowth || !totalGrowth.series?.length) {
          setChartData(null);
          return;
        }

        setChartData(totalGrowth);
      } catch (err) {
        console.error('Failed to fetch total growth KPIs:', err);
        setChartData(null);
      }
    };

    fetchData();
  }, [user?.entrepriseId, period, selectedMonth]);

  // Compute total hours safely
  const totalHours = useMemo(() => {
    if (!chartData?.series?.length) return 0;

    return chartData.series.reduce(
      (sum, s) => sum + (s?.data?.reduce((a, b) => a + b, 0) || 0),
      0
    );
  }, [chartData]);

  // Safe categories + series
  const safeCategories = Array.isArray(chartData?.categories)
    ? chartData.categories
    : [];

  const safeSeries = Array.isArray(chartData?.series)
    ? chartData.series.map((s) => ({
        name: s.name || 'Unknown',
        data: Array.isArray(s.data) ? s.data : []
      }))
    : [];

  // Chart options
  const chartOptions = useMemo(
    () => ({
      chart: {
        type: 'bar',
        stacked: true,
        height: 480,
        fontFamily,
        toolbar: { show: true },
        zoom: { enabled: true }
      },
      plotOptions: {
        bar: {
          horizontal: false,
          columnWidth: '50%',
          borderRadius: 4
        }
      },
      dataLabels: { enabled: false },
      colors: [primary200, secondaryMain],
      xaxis: {
        categories: safeCategories,
        labels: { style: { colors: textPrimary } }
      },
      yaxis: {
        labels: { style: { colors: textPrimary } },
        title: { text: 'Heures', style: { color: textPrimary } }
      },
      grid: { borderColor: divider },
      tooltip: {
        shared: true,
        intersect: false,
        y: {
          formatter: (val, opts) => {
            const label =
              opts?.w?.globals?.labels?.[opts.dataPointIndex];

            if (!label || !chartData?.topFormationsByMonth)
              return `${val} h`;

            return opts.seriesIndex === 0
              ? `${chartData.topFormationsByMonth[label]}: ${val} h`
              : `Autres: ${val} h`;
          }
        }
      },
      legend: {
        show: true,
        position: 'bottom',
        offsetX: 0,
        labels: { colors: grey500 },
        markers: { size: 8, shape: 'square' },
        itemMargin: { horizontal: 15, vertical: 8 }
      }
    }),
    [
      safeCategories,
      chartData,
      fontFamily,
      primary200,
     secondaryMain,
      textPrimary,
      divider,
      grey500
    ]
  );

  return (
    <>
      {isLoading || !chartData ? (
        <SkeletonTotalGrowthBarChart />
      ) : (
        <MainCard>
          <Stack sx={{ gap: gridSpacing }}>
            {/* Header */}
            <Stack
              direction="row"
              sx={{ alignItems: 'center', justifyContent: 'space-between' }}
            >
              <Stack sx={{ gap: 1 }}>
                <Typography variant="subtitle2">
                  Heures de formation
                </Typography>
                <Typography variant="h3">
                  {totalHours.toLocaleString()} h
                </Typography>
              </Stack>

              {/* Period selector */}
              <Stack direction="row" spacing={1}>
                <TextField
                  id="select-period"
                  select
                  value={period}
                  onChange={(e) => setPeriod(e.target.value)}
                  size="small"
                >
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="monthly">Monthly</MenuItem>
                  <MenuItem value="yearly">Yearly</MenuItem>
                </TextField>

                {/* Month picker for daily */}
                {period === 'daily' && (
                  <TextField
                    id="select-month"
                    type="month"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                    size="small"
                  />
                )}
              </Stack>
            </Stack>

            {/* Chart */}
            <Box>
              {safeCategories.length === 0 || safeSeries.length === 0 ? (
                <Typography variant="body2" sx={{ mt: 2 }}>
                  No data available for the selected period.
                </Typography>
              ) : (
                <Chart
                  options={chartOptions}
                  series={safeSeries}
                  type="bar"
                  height={480}
                />
              )}
            </Box>
          </Stack>
        </MainCard>
      )}
    </>
  );
}

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool
};

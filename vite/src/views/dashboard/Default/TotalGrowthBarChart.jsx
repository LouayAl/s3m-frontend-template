// frontend-template/vite/src/views/dashboard/Default/TotalGrowthBarChart.jsx
import PropTypes from "prop-types";
import { useEffect, useMemo, useState, useCallback } from "react";

// material-ui
import { useTheme } from "@mui/material/styles";
import MenuItem from "@mui/material/MenuItem";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

// third-party
import Chart from "react-apexcharts";

// project imports
import useConfig from "hooks/useConfig";
import SkeletonTotalGrowthBarChart from "ui-component/cards/Skeleton/TotalGrowthBarChart";
import MainCard from "ui-component/cards/MainCard";
import { gridSpacing } from "store/constant";

import { useAuth } from "contexts/auth/AuthContext";
import { getClientTotalGrowth } from "api/kpiApi";

/* Helper: Convert "Dec 2025" → "2025-12" */
function convertMonthLabelToParam(label) {
  if (!label) return "";
  const [monthStr, yearStr] = label.split(" ");
  const monthMap = {
    Jan: "01", Feb: "02", Mar: "03", Apr: "04", May: "05", Jun: "06",
    Jul: "07", Aug: "08", Sep: "09", Oct: "10", Nov: "11", Dec: "12"
  };
  return monthMap[monthStr] ? `${yearStr}-${monthMap[monthStr]}` : "";
}

export default function TotalGrowthBarChart({ isLoading }) {
  const theme = useTheme();
  const { state: { fontFamily } } = useConfig();
  const { user } = useAuth();

  /* State */
  const [chartData, setChartData] = useState(null);
  const [period, setPeriod] = useState("monthly");
  const [drilldownMonth, setDrilldownMonth] = useState(null);
  const [loadingChart, setLoadingChart] = useState(false);

  /* Fetch KPI Data */
  useEffect(() => {
    if (!user?.entrepriseId) return;

    const fetchGrowth = async () => {
      setLoadingChart(true);
      try {
        const effectivePeriod = drilldownMonth ? "daily" : period;
        const monthParam = drilldownMonth || "";
        const data = await getClientTotalGrowth(user.entrepriseId, effectivePeriod, monthParam);
        setChartData(data);
      } catch (err) {
        console.error("Failed to fetch Total Growth:", err);
        setChartData(null);
      } finally {
        setLoadingChart(false);
      }
    };

    fetchGrowth();
  }, [user?.entrepriseId, period, drilldownMonth]);

  /* Safe categories & series */
  const safeCategories = useMemo(() => chartData?.categories || [], [chartData]);
  const safeSeries = useMemo(() => chartData?.series || [], [chartData]);

  /* Total hours */
  const totalHours = useMemo(() => {
    return safeSeries.reduce((sum, s) => sum + (s.data?.reduce((a, b) => a + b, 0) || 0), 0);
  }, [safeSeries]);

  /* Drilldown click */
  const handleDrilldown = useCallback((event, chartContext, config) => {
    if (period !== "monthly" || drilldownMonth) return;
    const clickedLabel = config.w.globals.labels[config.dataPointIndex];
    const monthParam = convertMonthLabelToParam(clickedLabel);
    if (monthParam) setDrilldownMonth(monthParam);
  }, [period, drilldownMonth]);

  /* Chart options */
  const chartOptions = useMemo(() => ({
    chart: {
      type: "bar",
      stacked: true,
      height: 480,
      fontFamily,
      toolbar: { show: true },
      animations: { 
        enabled: true, 
        easing: safeCategories.length > 31 ? "linear" : "easeinout",
        speed: safeCategories.length > 31 ? 250 : 500 },
      events: { dataPointSelection: handleDrilldown }
    },
    colors: [
      theme.vars.palette.primary[200], // orange
      theme.vars.palette.secondary.main // blue
    ],
    plotOptions: { bar: { horizontal: false, columnWidth: "55%", borderRadius: 6 } },
    dataLabels: { enabled: false },
    xaxis: { categories: safeCategories, labels: { style: { colors: theme.vars.palette.text.primary } } },
    yaxis: {
      title: { text: "Heures", style: { color: theme.vars.palette.text.primary } },
      labels: { style: { colors: theme.vars.palette.text.primary } }
    },
    tooltip: {
      shared: true,
      intersect: false,
      y: { formatter: (val, opts) => {
        const label = opts?.w?.globals?.labels?.[opts.dataPointIndex];
        if (!label || !chartData?.topFormationsByMonth) return `${val} h`;
        const formation = chartData.topFormationsByMonth[label];
        return opts.seriesIndex === 0 ? `${formation}: ${val} h` : `Autres: ${val} h`;
      }}
    },
    legend: { position: "bottom" }
  }), [safeCategories, theme, fontFamily, chartData, handleDrilldown]);

  /* Render skeleton */
  if (isLoading || loadingChart || !chartData) return <SkeletonTotalGrowthBarChart />;

  return (
    <MainCard>
      <Stack sx={{ gap: gridSpacing }}>
        {/* Header */}
        <Stack direction="row" sx={{ alignItems: "center", justifyContent: "space-between" }}>
          <Stack spacing={0.5}>
            <Typography variant="subtitle2">Heures de formation</Typography>
            <Typography variant="h3">{totalHours.toLocaleString()} h</Typography>
            {drilldownMonth && <Typography variant="body2" color="text.secondary">Vue journalière ({drilldownMonth})</Typography>}
          </Stack>

          {/* Controls */}
          <Stack direction="row" spacing={1}>
            {drilldownMonth && <Button size="small" variant="outlined" onClick={() => setDrilldownMonth(null)}>← Retour</Button>}
            {!drilldownMonth && (
              <TextField select value={period} size="small" onChange={(e) => setPeriod(e.target.value)}>
                <MenuItem value="monthly">Monthly</MenuItem>
                <MenuItem value="yearly">Yearly</MenuItem>
              </TextField>
            )}
          </Stack>
        </Stack>

        {/* Chart */}
        <Box>
          {safeCategories.length === 0 ? (
            <Typography variant="body2">No data available.</Typography>
          ) : (
            <Chart options={chartOptions} series={safeSeries} type="bar" height={480} />
          )}
          {!drilldownMonth && period === "monthly" && (
            <Typography variant="caption" sx={{ display: "block", mt: 1 }} color="text.secondary">
              💡 Cliquer sur un mois pour voir les détails quotidiens.
            </Typography>
          )}
        </Box>
      </Stack>
    </MainCard>
  );
}

TotalGrowthBarChart.propTypes = {
  isLoading: PropTypes.bool
};

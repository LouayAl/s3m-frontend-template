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

  const palette = ['#2196f3', '#1565c0', '#ff9800', '#4caf50', '#64b5f6', '#1976d2', '#ffa726', '#81c784'];

  useEffect(() => {
    if (Array.isArray(data) && data.length > 0) {
      const categories = data.map((d) => d.fournisseur || 'Unknown');
      const values = data.map((d) => d.totalHeures || 0);
      const colors = categories.map((_, index) => palette[index % palette.length]);

      setSeries([
        {
          name: 'Heures-Participants',
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
        colors,
        plotOptions: {
          bar: {
            distributed: true,
            dataLabels: {
              position: 'top'
            }
          }
        },
        dataLabels: {
          enabled: true,
          style: {
            colors: ['#000000']
          },
          formatter: function (val) {
            return val;
          }
        },
        tooltip: {
          theme: 'light',
          custom: function ({ dataPointIndex }) {
            const d = data[dataPointIndex] || {};
            const total = d.totalHeures ?? 0;
            const hasBreakdown = d.sessionHeures != null && d.nbParticipants != null;

            return `
              <div style="padding:8px 12px;">
                <div style="font-weight:600;margin-bottom:4px;">${d.fournisseur || 'Unknown'}</div>
                <div>${total.toLocaleString()} heures-participants</div>
                ${
                  hasBreakdown
                    ? `<div style="font-size:11px;opacity:0.75;margin-top:2px;">
                        ${d.sessionHeures.toLocaleString()} h de session × ${d.nbParticipants.toLocaleString()} participants
                       </div>`
                    : ''
                }
              </div>
            `;
          }
        },
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
        <Box>
          <Typography variant="h6">Heures-Participants par fournisseur</Typography>
          <Typography variant="caption" color="textSecondary">
            Heures de formation × nombre de participants
          </Typography>
        </Box>
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
      totalHeures: PropTypes.number,
      sessionHeures: PropTypes.number,
      nbParticipants: PropTypes.number
    })
  )
};
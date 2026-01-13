// frontend-template/vite/src/views/dashboard/Default/DepartementBarChart.jsx
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

  useEffect(() => {
    if (!data || data.length === 0) {
      setSeries([]);
      return;
    }

    let categories = [];
    let values = [];

    // Participants by department
    if (type === 'participants') {
      categories = data.map((d) => d.departement);
      values = data.map((d) => d.nbParicipants);
    }

    // Hours by department
    if (type === 'hours') {
      categories = data.map((d) => d.departement);
      values = data.map((d) => d.totalHeures);
    }

    // Hours by famille formation
    if (type === 'famille') {
      categories = data.map((d) => d.familleFormation);
      values = data.map((d) => d.totalHeures);
    }

    setSeries([
      {
        name: title,
        data: values
      }
    ]);

    setChartOptions({
      chart: {
        type: 'bar',
        fontFamily
      },
      xaxis: {
        categories,
        labels: { style: { colors: theme.palette.text.primary } }
      },
      yaxis: {
        labels: { style: { colors: theme.palette.text.primary } }
      },
      colors: [theme.palette.primary.main],
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
              <Chart options={chartOptions} series={series} type="bar" height={350} />
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

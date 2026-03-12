// frontend-template/vite/src/views/dashboard/Default/YearFilter.jsx
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import Skeleton from '@mui/material/Skeleton';
import Tooltip from '@mui/material/Tooltip';
import CalendarTodayOutlinedIcon from '@mui/icons-material/CalendarTodayOutlined';

/**
 * YearFilter — horizontal row of toggle chips, one per available year.
 *
 * Props:
 *   availableYears  number[]   all years returned by the API
 *   selectedYears   number[]   currently active years
 *   onChange        (years: number[]) => void
 *   loading         boolean
 */
export default function YearFilter({ availableYears = [], selectedYears = [], onChange, loading = false }) {
  const theme = useTheme();

  const toggle = (year) => {
    const next = selectedYears.includes(year)
      ? selectedYears.filter((y) => y !== year)
      : [...selectedYears, year];

    // Never allow zero selection — keep at least one year active
    if (next.length === 0) return;

    onChange(next.sort((a, b) => b - a));
  };

  const selectAll = () => onChange([]);   // empty = "all years" sentinel
  const isAllSelected = selectedYears.length === 0;

  return (
    <Stack
      direction="row"
      spacing={1}
      sx={{
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: 1,
        py: 1,
        px: 2,
        borderRadius: 2,
        bgcolor: theme.vars
          ? theme.vars.palette.background.default
          : theme.palette.background.default,
        border: `1px solid ${theme.vars ? theme.vars.palette.divider : theme.palette.divider}`,
      }}
    >
      {/* Icon label */}
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mr: 0.5 }}>
        <CalendarTodayOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Année
        </Typography>
      </Stack>

      {loading ? (
        // Skeleton chips while years are loading
        [1, 2, 3].map((i) => (
          <Skeleton key={i} variant="rounded" width={60} height={32} sx={{ borderRadius: 4 }} />
        ))
      ) : (
        <>
          {/* "Toutes" chip */}
          <Tooltip title="Afficher toutes les années">
            <Chip
              label="Toutes"
              size="small"
              onClick={selectAll}
              color={isAllSelected ? 'primary' : 'default'}
              variant={isAllSelected ? 'filled' : 'outlined'}
              sx={{ fontWeight: isAllSelected ? 700 : 400, borderRadius: 2 }}
            />
          </Tooltip>

          {/* One chip per year */}
          {availableYears.map((year) => {
            const active = !isAllSelected && selectedYears.includes(year);
            return (
              <Chip
                key={year}
                label={year}
                size="small"
                onClick={() => toggle(year)}
                color={active ? 'primary' : 'default'}
                variant={active ? 'filled' : 'outlined'}
                sx={{ fontWeight: active ? 700 : 400, borderRadius: 2 }}
              />
            );
          })}
        </>
      )}
    </Stack>
  );
}

YearFilter.propTypes = {
  availableYears: PropTypes.arrayOf(PropTypes.number),
  selectedYears: PropTypes.arrayOf(PropTypes.number),
  onChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
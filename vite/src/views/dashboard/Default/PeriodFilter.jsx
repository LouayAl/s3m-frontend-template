import { useState } from 'react';
import PropTypes from 'prop-types';
import { useTheme } from '@mui/material/styles';
import Stack from '@mui/material/Stack';
import Chip from '@mui/material/Chip';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import EventOutlinedIcon from '@mui/icons-material/EventOutlined';

const PRESETS = [
  { label: '7 jours', days: 7 },
  { label: '14 jours', days: 14 },
  { label: '30 jours', days: 30 },
];

function toIsoDate(date) {
  return date.toISOString().slice(0, 10);
}

function presetRange(days) {
  const start = new Date();
  const end = new Date();
  end.setDate(end.getDate() + days);
  return { start: toIsoDate(start), end: toIsoDate(end) };
}

/**
 * PeriodFilter — preset chips (7/14/30 jours) or a custom start/end date range.
 *
 * Props:
 *   value     { start: string, end: string }  ISO dates
 *   onChange  (range: { start, end }) => void
 */
export default function PeriodFilter({ value, onChange }) {
  const theme = useTheme();
  const [customMode, setCustomMode] = useState(false);

  const activePreset = PRESETS.find((p) => {
    const r = presetRange(p.days);
    return r.start === value.start && r.end === value.end;
  });

  const handlePreset = (days) => {
    setCustomMode(false);
    onChange(presetRange(days));
  };

  const handleCustomStart = (e) => onChange({ ...value, start: e.target.value });
  const handleCustomEnd = (e) => onChange({ ...value, end: e.target.value });

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
        bgcolor: theme.vars ? theme.vars.palette.background.default : theme.palette.background.default,
        border: `1px solid ${theme.vars ? theme.vars.palette.divider : theme.palette.divider}`,
      }}
    >
      <Stack direction="row" spacing={0.5} alignItems="center" sx={{ mr: 0.5 }}>
        <EventOutlinedIcon sx={{ fontSize: 16, color: 'text.secondary' }} />
        <Typography variant="caption" color="text.secondary" fontWeight={600}>
          Période
        </Typography>
      </Stack>

      {PRESETS.map((p) => (
        <Chip
          key={p.label}
          label={p.label}
          size="small"
          onClick={() => handlePreset(p.days)}
          color={!customMode && activePreset?.label === p.label ? 'primary' : 'default'}
          variant={!customMode && activePreset?.label === p.label ? 'filled' : 'outlined'}
          sx={{ fontWeight: !customMode && activePreset?.label === p.label ? 700 : 400, borderRadius: 2 }}
        />
      ))}

      <Chip
        label="Personnalisé"
        size="small"
        onClick={() => setCustomMode(true)}
        color={customMode ? 'primary' : 'default'}
        variant={customMode ? 'filled' : 'outlined'}
        sx={{ fontWeight: customMode ? 700 : 400, borderRadius: 2 }}
      />

      {customMode && (
        <Stack direction="row" spacing={1} alignItems="center">
          <TextField
            type="date"
            size="small"
            value={value.start}
            onChange={handleCustomStart}
            sx={{ width: 150 }}
          />
          <Typography variant="caption" color="text.secondary">à</Typography>
          <TextField
            type="date"
            size="small"
            value={value.end}
            onChange={handleCustomEnd}
            sx={{ width: 150 }}
          />
        </Stack>
      )}
    </Stack>
  );
}

PeriodFilter.propTypes = {
  value: PropTypes.shape({ start: PropTypes.string, end: PropTypes.string }).isRequired,
  onChange: PropTypes.func.isRequired,
};

export { presetRange };
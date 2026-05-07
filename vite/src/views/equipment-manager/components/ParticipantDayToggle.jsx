import { Box, Typography, Chip, ToggleButtonGroup, ToggleButton } from '@mui/material';

const PRESENCE_LABELS = { PRESENT: 'Présent', ABSENT: 'Absent', RETARD: 'Retard' };
const PRESENCE_COLORS = { PRESENT: 'success', ABSENT: 'error',  RETARD: 'warning' };

export default function ParticipantDayToggle({ duree, evaluatedDays, activeDay, onChange }) {
  const allDays = Array.from({ length: duree }, (_, i) => i + 1);

  return (
    <Box sx={{ mb: 2 }}>
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
        Sélectionner un jour
      </Typography>
      <ToggleButtonGroup
        value={activeDay}
        exclusive
        onChange={(_, val) => { if (val !== null) onChange(val); }}
        size="small"
        sx={{ flexWrap: 'wrap', gap: 0.5 }}
      >
        {allDays.map(d => {
          const dayData  = evaluatedDays.find(e => e.day === d);
          const evaluated = !!dayData;
          return (
            <ToggleButton
              key={d} value={d}
              sx={{
                fontWeight: 700,
                borderRadius: '8px !important',
                border: '1px solid !important',
                px: 1.5, py: 0.5, minWidth: 64,
              }}
            >
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" fontWeight={700} display="block">
                  Jour {d}
                </Typography>
                {evaluated ? (
                  <Chip
                    label={PRESENCE_LABELS[dayData.presence]}
                    color={PRESENCE_COLORS[dayData.presence]}
                    size="small"
                    sx={{ fontSize: 9, height: 16 }}
                  />
                ) : (
                  <Typography variant="caption" color="text.disabled" fontSize={9}>
                    Non évalué
                  </Typography>
                )}
              </Box>
            </ToggleButton>
          );
        })}
      </ToggleButtonGroup>
    </Box>
  );
}
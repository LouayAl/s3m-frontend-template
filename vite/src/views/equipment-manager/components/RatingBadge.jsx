import { Box, Typography } from '@mui/material';

export default function RatingBadge({ value }) {
  if (value === null || value === undefined)
    return null;

  const color = value >= 3.5 ? '#2e7d32' : value >= 2.5 ? '#e65100' : '#c62828';
  const bg    = value >= 3.5 ? '#e8f5e9' : value >= 2.5 ? '#fff3e0' : '#ffebee';

  return (
    <Box sx={{ display:'inline-flex', alignItems:'center', px:1, py:0.25, borderRadius:1, bgcolor:bg }}>
      <Typography variant="caption" fontWeight={700} sx={{ color }}>
        {value.toFixed(1)}/4
      </Typography>
    </Box>
  );
}
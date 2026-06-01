import { Box, Card, CardContent, Typography } from '@mui/material';
import {
  ResponsiveContainer,
  ComposedChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from 'recharts';

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <Box sx={{
      bgcolor: 'background.paper',
      border: '1px solid',
      borderColor: 'divider',
      borderRadius: 1.5,
      p: 1.5,
      boxShadow: 3,
    }}>
      <Typography variant="caption" fontWeight={700} display="block" mb={0.5}>
        {label}
      </Typography>
      {payload.map(entry => (
        <Box key={entry.name} sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25 }}>
          <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: entry.color }} />
          <Typography variant="caption" color="text.secondary">{entry.name}:</Typography>
          <Typography variant="caption" fontWeight={700}>{entry.value}</Typography>
        </Box>
      ))}
    </Box>
  );
}

export default function PlanificationChart({ chartData, selectedYear, entrepriseName }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
      <Box sx={{ width: '100%', maxWidth: '1200px' }}>
        <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
          <CardContent>
            <Typography variant="subtitle1" fontWeight={700} mb={2}>
              Planifié vs Créées — {selectedYear}
              {entrepriseName && (
                <Typography component="span" variant="caption" color="text.secondary" ml={1}>
                  {entrepriseName}
                </Typography>
              )}
            </Typography>
            {chartData.length > 0 ? (
              <Box sx={{ width: '100%', height: { xs: 360, md: 500 } }}>
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend wrapperStyle={{ fontSize: 13 }} />
                    <Line
                      type="monotone"
                      dataKey="Planifié"
                      stroke="#f0813c"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#f0813c' }}
                      activeDot={{ r: 6 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="Créées"
                      stroke="#1976d2"
                      strokeWidth={2.5}
                      dot={{ r: 4, fill: '#1976d2' }}
                      activeDot={{ r: 6 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </Box>
            ) : (
              <Box sx={{ py: 6, textAlign: 'center', color: 'text.secondary' }}>
                <Typography variant="body2">Aucune donnée disponible pour {selectedYear}.</Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

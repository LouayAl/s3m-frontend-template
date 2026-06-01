import { Box, Card, CardContent, Typography, Grid, Table, TableBody, TableCell, TableHead, TableRow, Chip, Stack } from '@mui/material';
import { MONTH_KEY_TO_LABEL } from './planificationConstants';
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

export default function PlanificationOverview({
  planData,
  totalPlanifie,
  totalCreated,
  totalParticipants,
  actualMonthlyParticipants,
  chartData,
  selectedYear,
  pct,
  createdMonthlyCounts
}) {
  const S3M_ORANGE = '#ed823b';
  const S3M_LIGHT_BLUE = '#2583c0';
  const S3M_DARK_BLUE = '#10426c';

  return (
    <Card sx={{
      borderRadius: 2,
      boxShadow: 'none',
      border: '1px solid',
      borderColor: 'divider',
      backgroundColor: '#ffffff',
      mb: 3
    }}>
      <CardContent sx={{ p: 3 }}>
        {/* Stats Cards */}
        <Box sx={{ mb: 4 }}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ flexWrap: 'wrap' }}>
            <Box sx={{ flex: '1 1 auto', minWidth: 150, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1.5, border: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Objectif
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: S3M_DARK_BLUE }}>
                {totalPlanifie}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 auto', minWidth: 150, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1.5, border: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Créées
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: S3M_LIGHT_BLUE }}>
                {totalCreated}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 auto', minWidth: 150, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1.5, border: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                Participants
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: S3M_ORANGE }}>
                {totalParticipants}
              </Typography>
            </Box>
            <Box sx={{ flex: '1 1 auto', minWidth: 150, p: 2, backgroundColor: '#f9f9f9', borderRadius: 1.5, border: '1px solid #e0e0e0' }}>
              <Typography variant="caption" color="text.secondary" display="block" mb={0.5}>
                % atteint
              </Typography>
              <Typography variant="h6" fontWeight={700} sx={{ color: pct !== null && pct >= 100 ? S3M_LIGHT_BLUE : pct >= 60 ? S3M_ORANGE : '#d32f2f' }}>
                {pct !== null ? `${pct}%` : 'N/A'}
              </Typography>
            </Box>
          </Stack>
        </Box>

        {/* Chart Section */}
        {chartData && chartData.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" fontWeight={700} mb={2} sx={{ color: S3M_DARK_BLUE }}>
              Planifié vs Créées — {selectedYear}
            </Typography>
            <Box sx={{ width: '100%', height: { xs: 360, md: 400 } }}>
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={chartData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis dataKey="name" tick={{ fontSize: 12 }} />
                  <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                  <Tooltip content={<CustomTooltip />} />
                  <Legend wrapperStyle={{ fontSize: 13 }} />
                  <Line
                    type="monotone"
                    dataKey="Planifié"
                    stroke={S3M_ORANGE}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: S3M_ORANGE }}
                    activeDot={{ r: 6 }}
                  />
                  <Line
                    type="monotone"
                    dataKey="Créées"
                    stroke={S3M_LIGHT_BLUE}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: S3M_LIGHT_BLUE }}
                    activeDot={{ r: 6 }}
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </Box>
          </Box>
        )}

        

        {/* Table Section */}
        <Box>
          <Typography variant="subtitle1" fontWeight={700} mb={2} sx={{ color: S3M_DARK_BLUE }}>
            Détail mensuel
          </Typography>

          <Table sx={{ minWidth: 320 }} size="small">
            <TableHead>
              <TableRow sx={{ backgroundColor: '#f5f5f5' }}>
                <TableCell sx={{ fontWeight: 700, color: S3M_ORANGE }}>Mois</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: S3M_DARK_BLUE }}>Planifié</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: S3M_LIGHT_BLUE }}>Créées</TableCell>
                <TableCell align="right" sx={{ fontWeight: 700, color: S3M_ORANGE }}>Participants</TableCell>
                <TableCell align="center" sx={{ fontWeight: 700, color: S3M_DARK_BLUE }}>Statut</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {planData?.months.map((monthItem, index) => {
                const createdCount = createdMonthlyCounts?.[index] ?? 0;
                const ratio = monthItem.planifie > 0 ? createdCount / monthItem.planifie : null;
                const status = ratio === null ? 'Aucun objectif' : ratio >= 1 ? 'Atteint' : ratio >= 0.6 ? 'Sur la bonne voie' : 'À améliorer';
                const statusBgColor = ratio === null ? '#e6e1e1' : ratio >= 1 ? S3M_LIGHT_BLUE : ratio >= 0.6 ? '#098d14' : S3M_ORANGE;
                const statusTextColor = ratio === null ? '#666' : ratio >= 1 ? '#ffffff' : ratio >= 0.6 ? '#ffffff' : '#ffffff';
                const participants = actualMonthlyParticipants?.[index] ?? 0;
                const monthLabel = MONTH_KEY_TO_LABEL[monthItem.month] || monthItem.label || monthItem.month;

                return (
                  <TableRow key={monthItem.month} sx={{ '&:last-child td': { border: 0 }, '&:hover': { backgroundColor: '#fafafa' } }}>
                    <TableCell sx={{ py: 1.25 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: S3M_ORANGE }} />
                        <Typography variant="body2" fontWeight={700} color={S3M_DARK_BLUE}>
                          {monthLabel}
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell align="right" sx={{ py: 1.25, color: S3M_DARK_BLUE, fontWeight: 600 }}>{monthItem.planifie}</TableCell>
                    <TableCell align="right" sx={{ py: 1.25, color: S3M_LIGHT_BLUE, fontWeight: 600 }}>{createdCount}</TableCell>
                    <TableCell align="right" sx={{ py: 1.25, color: S3M_ORANGE, fontWeight: 600 }}>{participants}</TableCell>
                    <TableCell align="center" sx={{ py: 1.25 }}>
                      <Box sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        px: 1.5,
                        py: 0.5,
                        borderRadius: 2,
                        bgcolor: statusBgColor,
                        color: statusTextColor,
                        fontWeight: 700,
                        fontSize: '0.75rem',
                        textTransform: 'uppercase'
                      }}>
                        {status}
                      </Box>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </Box>
      </CardContent>
    </Card>
  );
}

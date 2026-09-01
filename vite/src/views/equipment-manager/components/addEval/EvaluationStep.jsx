import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell,
  LinearProgress, Alert, CircularProgress, TextField, Chip } from '@mui/material';

const PRESENCE_OPTIONS = [
  { value: 'PRESENT', label: 'Present', color: 'success' },
  { value: 'ABSENT',  label: 'Absent',  color: 'error'   },
  { value: 'RETARD',  label: 'Late',  color: 'warning' },
];

export default function EvaluationStep({
  selectedDay, selectedParticipant, presence,
  criteres, loadingCriteres,
  scores, onScoreChange,
  remarks, onRemarksChange,
}) {
  const filledCount = Object.keys(scores).length;
  const totalCount  = criteres.length;
  const fillPct     = totalCount ? Math.round((filledCount / totalCount) * 100) : 0;

  return (
    <Box>
      {/* Summary header */}
      <Box sx={{
        p: 1.5, mb: 2, borderRadius: 2,
        bgcolor: 'background.default',
        border: '1px solid', borderColor: 'divider',
        display: 'flex', gap: 1, flexWrap: 'wrap', alignItems: 'center',
      }}>
        <Chip label={`Jour ${selectedDay}`} color="primary" size="small" sx={{ fontWeight: 700 }} />
        <Chip
          label={`${selectedParticipant?.prenom} ${selectedParticipant?.nom}`}
          variant="outlined" size="small"
        />
        <Chip
          label={PRESENCE_OPTIONS.find(o => o.value === presence)?.label}
          color={PRESENCE_OPTIONS.find(o => o.value === presence)?.color}
          size="small" sx={{ fontWeight: 700 }}
        />
      </Box>

      {/* Progress bar */}
      {totalCount > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
            <Typography variant="caption" color="text.secondary">
              {filledCount} / {totalCount} compétences évaluées
            </Typography>
            <Typography variant="caption" fontWeight={700} color="primary.main">
              {fillPct}%
            </Typography>
          </Box>
          <LinearProgress
            variant="determinate" value={fillPct}
            sx={{ height: 6, borderRadius: 3 }}
            color={fillPct === 100 ? 'success' : 'primary'}
          />
        </Box>
      )}

      {/* Criteria grid */}
      {loadingCriteres ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
          <CircularProgress size={28} />
        </Box>
      ) : criteres.length === 0 ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          No criteria defined for the day {selectedDay}.
          Please configure the criteria from the session tracking page.
        </Alert>
      ) : (
        <Box sx={{ overflowX: 'auto', mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Competence</TableCell>
                {[1, 2, 3, 4].map(v => (
                  <TableCell key={v} align="center" sx={{ fontWeight: 700, width: 44, fontSize: 12 }}>
                    {v}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {criteres.map((c) => (
                <TableRow
                  key={c.critereIndex} hover
                  sx={{ bgcolor: scores[c.critereIndex] !== undefined ? 'primary.light' : 'transparent' }}
                >
                  <TableCell sx={{ fontSize: 12, maxWidth: 180 }}>
                    <Typography variant="caption" sx={{
                      display: 'block', overflow: 'hidden',
                      textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                    }}
                      title={c.libelle}
                    >
                      {c.libelle}
                    </Typography>
                  </TableCell>
                  {[1, 2, 3, 4].map(v => (
                    <TableCell key={v} align="center" sx={{ px: 0.5 }}>
                      <Box
                        onClick={() => onScoreChange(c.critereIndex, v)}
                        sx={{
                          width: 36, height: 36, borderRadius: 1.5,
                          border: '2px solid',
                          borderColor: scores[c.critereIndex] === v ? 'primary.main' : 'divider',
                          bgcolor: scores[c.critereIndex] === v ? 'primary.main' : 'background.paper',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', mx: 'auto', transition: 'all 0.1s',
                          '&:active': { transform: 'scale(0.92)' },
                          '&:hover': { borderColor: 'primary.main', bgcolor: scores[c.critereIndex] === v ? 'primary.main' : 'primary.light' },
                        }}
                      >
                        <Typography variant="caption" fontWeight={700}
                          color={scores[c.critereIndex] === v ? '#fff' : 'text.secondary'}
                        >
                          {v}
                        </Typography>
                      </Box>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Box>
      )}

      {/* Remarks */}
      <TextField
        fullWidth multiline rows={3}
        label="Trainer's comments"
        value={remarks}
        onChange={e => onRemarksChange(e.target.value)}
        placeholder="Observations, points d'amélioration..."
        size="small"
      />
    </Box>
  );
}
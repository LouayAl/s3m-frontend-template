import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Chip, Alert, Button } from '@mui/material';
import SettingsIcon from '@mui/icons-material/Settings';

const PRESENCE_OPTIONS = ['PRESENT', 'ABSENT', 'RETARD'];
const PRESENCE_LABELS  = { PRESENT: 'Présent', ABSENT: 'Absent', RETARD: 'Retard' };
const PRESENCE_COLORS  = { PRESENT: 'success', ABSENT: 'error',  RETARD: 'warning' };

export default function ParticipantEditForm({
  activeDay, activeCriteres,
  editScores, setEditScores,
  editPresence, setEditPresence,
  editRemarks, setEditRemarks,
  saveError, isEM, onConfigureCriteres,
}) {
  const hasNoCriteres = activeCriteres.length === 0;

  return (
    <Box>
      {saveError && <Alert severity="error" sx={{ mb: 2 }}>{saveError}</Alert>}

      {/* No criteria */}
      {hasNoCriteres ? (
        <Alert severity="warning" sx={{ mb: 2 }}>
          Aucun critère défini pour ce jour.
          {isEM && (
            <Button size="small" sx={{ ml: 1 }} startIcon={<SettingsIcon />} onClick={onConfigureCriteres}>
              Configurer
            </Button>
          )}
        </Alert>
      ) : (
        <Box sx={{ overflowX: 'auto', mb: 2 }}>
          <Table size="small">
            <TableHead>
              <TableRow sx={{ bgcolor: 'background.default' }}>
                <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Compétence</TableCell>
                {[1, 2, 3, 4].map(v => (
                  <TableCell key={v} align="center" sx={{ fontWeight: 700, width: 48 }}>{v}</TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {activeCriteres.map((c) => (
                <TableRow
                  key={c.critereIndex} hover
                  sx={{ bgcolor: editScores[c.critereIndex] ? 'primary.light' : 'transparent' }}
                >
                  <TableCell sx={{ fontSize: 12 }}>{c.libelle}</TableCell>
                  {[1, 2, 3, 4].map(v => (
                    <TableCell key={v} align="center">
                      <Box
                        onClick={() => setEditScores(prev => ({ ...prev, [c.critereIndex]: v }))}
                        sx={{
                          width: 32, height: 32, borderRadius: 1, border: '1px solid',
                          borderColor: editScores[c.critereIndex] === v ? 'primary.main' : 'divider',
                          bgcolor: editScores[c.critereIndex] === v ? 'primary.main' : 'background.paper',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          cursor: 'pointer', mx: 'auto', transition: 'all 0.1s',
                          '&:hover': { borderColor: 'primary.main', bgcolor: 'primary.light' },
                        }}
                      >
                        <Typography variant="caption" fontWeight={700}
                          color={editScores[c.critereIndex] === v ? '#fff' : 'text.secondary'}
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

      {/* Presence */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
          Présence
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          {PRESENCE_OPTIONS.map(opt => (
            <Chip
              key={opt}
              label={PRESENCE_LABELS[opt]}
              color={editPresence === opt ? PRESENCE_COLORS[opt] : 'default'}
              variant={editPresence === opt ? 'filled' : 'outlined'}
              onClick={() => setEditPresence(opt)}
              sx={{ fontWeight: editPresence === opt ? 700 : 400, cursor: 'pointer' }}
            />
          ))}
        </Box>
      </Box>

      {/* Remarks */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={0.5}>
          Remarques
        </Typography>
        <Box
          component="textarea"
          value={editRemarks}
          onChange={e => setEditRemarks(e.target.value)}
          placeholder="Observations, points d'amélioration..."
          sx={{
            width: '100%', minHeight: 80, p: 1.5, borderRadius: 1,
            border: '1px solid', borderColor: 'divider',
            fontFamily: 'inherit', fontSize: 13, resize: 'vertical',
            bgcolor: 'background.paper', color: 'text.primary',
            boxSizing: 'border-box',
            '&:focus': { outline: 'none', borderColor: 'primary.main' },
          }}
        />
      </Box>
    </Box>
  );
}
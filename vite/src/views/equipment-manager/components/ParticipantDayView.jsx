import { Box, Typography, Table, TableHead, TableBody, TableRow, TableCell, Button } from '@mui/material';
import EditIcon     from '@mui/icons-material/Edit';
import AddIcon      from '@mui/icons-material/Add';
import SettingsIcon from '@mui/icons-material/Settings';
import RatingBadge  from './RatingBadge';

const PRESENCE_LABELS = { PRESENT: 'Présent', ABSENT: 'Absent', RETARD: 'Retard' };

export default function ParticipantDayView({
  activeDay, activeDayData, activeCriteres,
  isEM, onEdit, onAdd, onConfigureCriteres,
}) {
  const activeDayScores = activeDayData ? Object.values(activeDayData.scores) : [];
  const activeDayAvg = activeDayScores.length
    ? activeDayScores.reduce((a, b) => a + b, 0) / activeDayScores.length
    : null;

  const hasNoCriteres = activeCriteres.length === 0;

  // No criteria defined
  if (hasNoCriteres) {
    return (
      <Box sx={{
        p: 3, textAlign: 'center', bgcolor: 'background.default',
        borderRadius: 2, border: '1px dashed', borderColor: 'divider',
      }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Aucun critère d'évaluation défini pour le jour {activeDay}.
        </Typography>
        {isEM && (
          <Button variant="outlined" startIcon={<SettingsIcon />} onClick={onConfigureCriteres}>
            Configurer les critères
          </Button>
        )}
      </Box>
    );
  }

  // Criteria exist but no evaluation yet
  if (!activeDayData) {
    return (
      <Box sx={{
        p: 3, textAlign: 'center', bgcolor: 'background.default',
        borderRadius: 2, border: '1px dashed', borderColor: 'divider',
      }}>
        <Typography variant="body2" color="text.secondary" mb={2}>
          Aucune évaluation saisie pour le jour {activeDay}.
        </Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAdd}>
          Ajouter une évaluation
        </Button>
      </Box>
    );
  }

  // Evaluation exists — show scores
  return (
    <>
      <Box sx={{ overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 700, minWidth: 220 }}>Compétence</TableCell>
              <TableCell align="center" sx={{ fontWeight: 700 }}>Score</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {activeCriteres.map((c) => {
              const score = activeDayData.scores[c.critereIndex] ?? null;
              return (
                <TableRow key={c.critereIndex} hover>
                  <TableCell sx={{ fontSize: 12 }}>{c.libelle}</TableCell>
                  <TableCell align="center">
                    {score !== null ? (
                      <Box sx={{
                        width: 32, height: 32, borderRadius: '50%', mx: 'auto',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        bgcolor: score>=3.5?'#e8f5e9':score>=2.5?'#fff3e0':'#ffebee',
                        border: '2px solid',
                        borderColor: score>=3.5?'#4caf50':score>=2.5?'#ff9800':'#f44336',
                      }}>
                        <Typography variant="caption" fontWeight={700}
                          sx={{ color: score>=3.5?'#2e7d32':score>=2.5?'#e65100':'#c62828' }}
                        >
                          {score}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="caption" color="text.disabled">—</Typography>
                    )}
                  </TableCell>
                </TableRow>
              );
            })}
            <TableRow sx={{ bgcolor: 'background.default' }}>
              <TableCell sx={{ fontWeight: 700, fontSize: 12 }}>Moyenne du jour</TableCell>
              <TableCell align="center"><RatingBadge value={activeDayAvg} /></TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </Box>

      {/* Remarks */}
      {activeDayData.remarks && (
        <Box sx={{
          mt: 2, p: 1.5, bgcolor: 'background.default', borderRadius: 1,
          borderLeft: '3px solid', borderColor: 'primary.main',
        }}>
          <Typography variant="caption" fontWeight={700} color="primary.main">
            Remarques — Jour {activeDay}
          </Typography>
          <Typography variant="body2" sx={{ mt: 0.25 }}>{activeDayData.remarks}</Typography>
        </Box>
      )}

      {/* Edit button */}
      <Box sx={{ mt: 2, display: 'flex', justifyContent: 'flex-end' }}>
        <Button variant="outlined" startIcon={<EditIcon />} onClick={onEdit}>
          Modifier l'évaluation
        </Button>
      </Box>
    </>
  );
}
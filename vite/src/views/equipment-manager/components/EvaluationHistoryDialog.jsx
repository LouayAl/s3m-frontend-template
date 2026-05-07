import {
  Box, Button, Chip, Dialog, DialogActions,
  DialogContent, DialogTitle, Typography,
} from '@mui/material';

const PRESENCE_LABELS = { PRESENT: 'Présent', ABSENT: 'Absent', RETARD: 'Retard' };
const PRESENCE_COLORS = { PRESENT: 'success', ABSENT: 'error', RETARD: 'warning' };

/**
 * Builds a flat, sorted list of all evaluations from the evaluations map.
 */
function buildEvalList(evaluations, participants) {
  return Object.entries(evaluations)
    .map(([key, val]) => {
      const [empId, day] = key.split('-').map(Number);
      const p            = participants.find(x => x.idEmploye === empId);
      const scores       = Object.values(val.ratings);
      const avgRating    = scores.length
        ? (scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(1)
        : '—';
      return { participant: p, day, presence: val.presence, remarks: val.remarks, avgRating };
    })
    .sort((a, b) =>
      a.day - b.day || (a.participant?.nom ?? '').localeCompare(b.participant?.nom ?? '')
    );
}

export default function EvaluationsHistoryDialog({ open, onClose, evaluations, participants }) {
  const allEvals = buildEvalList(evaluations, participants);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle fontWeight={700}>Évaluations existantes</DialogTitle>
      <DialogContent dividers>
        {allEvals.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            Aucune évaluation saisie pour cette session.
          </Typography>
        ) : (
          allEvals.map((ev, i) => (
            <Box
              key={i}
              sx={{ p: 1.5, bgcolor: 'background.default', borderRadius: 1, mb: 1 }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 0.5 }}>
                <Typography variant="body2" fontWeight={600}>
                  {ev.participant?.prenom} {ev.participant?.nom} · Jour {ev.day}
                </Typography>
                <Chip
                  label={PRESENCE_LABELS[ev.presence]}
                  color={PRESENCE_COLORS[ev.presence]}
                  size="small"
                />
              </Box>
              <Typography variant="caption" color="text.secondary">
                Note moy.: {ev.avgRating}/4
                {ev.remarks && ` · ${ev.remarks}`}
              </Typography>
            </Box>
          ))
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
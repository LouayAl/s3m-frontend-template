import { Box, Card, CardContent, Tooltip, Typography } from '@mui/material';
import CheckCircleOutlinedIcon from '@mui/icons-material/CheckCircleOutlined';

export default function DayTracker({ duree, activeDay, participants, isEvaluated, onDayChange }) {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 2 }}>
      <CardContent>
        <Typography variant="subtitle2" fontWeight={600} mb={1.5}>
          Jours de formation — cliquer sur un jour pour évaluer
        </Typography>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
          {Array.from({ length: duree }, (_, i) => i + 1).map((d) => {
            const isActive     = d === activeDay;
            const allEvaluated = participants.length > 0 &&
              participants.every(p => isEvaluated(p.idEmploye, d));

            return (
              <Tooltip key={d} title={`Jour ${d}`} arrow>
                <Box
                  onClick={() => onDayChange(d)}
                  sx={{
                    width: 40, height: 40, borderRadius: 1.5,
                    display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer',
                    border: '1px solid',
                    borderColor: isActive ? 'primary.main' : allEvaluated ? 'success.main' : 'divider',
                    bgcolor:     isActive ? 'primary.light' : allEvaluated ? 'success.light' : 'background.paper',
                    transition: 'all 0.15s',
                    position: 'relative',
                  }}
                >
                  <Typography
                    variant="caption"
                    fontWeight={isActive ? 700 : 500}
                    color={isActive ? 'primary.main' : allEvaluated ? 'success.main' : 'text.secondary'}
                  >
                    J{d}
                  </Typography>
                  {allEvaluated && (
                    <CheckCircleOutlinedIcon
                      sx={{ fontSize: 10, color: 'success.main', position: 'absolute', top: 1, right: 1 }}
                    />
                  )}
                </Box>
              </Tooltip>
            );
          })}
        </Box>
      </CardContent>
    </Card>
  );
}
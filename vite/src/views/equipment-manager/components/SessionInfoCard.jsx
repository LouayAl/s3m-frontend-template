import { Box, Card, CardContent, Grid, LinearProgress, Typography } from '@mui/material';

export default function SessionInfoCard({ session, activeDay }) {
  const duree       = Number(session.dJours);
  const progressPct = duree ? Math.round((activeDay / duree) * 100) : 0;
  const participants = session.participants ?? [];

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 2 }}>
      <CardContent>
        <Grid container spacing={2} mb={2}>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">Formation</Typography>
            <Typography variant="body2" fontWeight={600}>{session.formation}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">Entreprise</Typography>
            <Typography variant="body2" fontWeight={600}>{session.entrepriseNom}</Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">Dates</Typography>
            <Typography variant="body2" fontWeight={600}>
              {session.dateDebut} → {session.dateFin}
            </Typography>
          </Grid>
          <Grid size={{ xs: 12, sm: 3 }}>
            <Typography variant="caption" color="text.secondary">Participants</Typography>
            <Typography variant="body2" fontWeight={600}>{participants.length} inscrits</Typography>
          </Grid>
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
          <Typography variant="caption" color="text.secondary">Progression globale</Typography>
          <Typography variant="caption" fontWeight={600}>{activeDay} / {duree} jours</Typography>
        </Box>
        <LinearProgress
          variant="determinate"
          value={progressPct}
          sx={{ height: 8, borderRadius: 4 }}
          color="primary"
        />
        <Typography variant="caption" color="text.secondary">{progressPct}% complété</Typography>
      </CardContent>
    </Card>
  );
}
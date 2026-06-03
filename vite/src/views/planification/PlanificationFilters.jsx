import { Card, CardContent, Grid, TextField, MenuItem } from '@mui/material';

export default function PlanificationFilters({
  yearOptions,
  selectedYear,
  onYearChange,
  entreprises,
  selectedEntId,
  onEntrepriseChange,
  isAdmin,
}) {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} sm={6} md={4}>
            <TextField
              select fullWidth size="small" label="Année"
              value={selectedYear} onChange={onYearChange}
            >
              {yearOptions.map(y => <MenuItem key={y} value={y}>{y}</MenuItem>)}
            </TextField>
          </Grid>
          {isAdmin && (
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                select fullWidth size="small" label="Entreprise"
                value={selectedEntId} onChange={onEntrepriseChange}
              >
                {entreprises.map(e => (
                  <MenuItem key={e.idEntreprise} value={e.idEntreprise}>
                    {e.nomEntreprise}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
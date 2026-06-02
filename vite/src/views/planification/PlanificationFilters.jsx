import { Card, CardContent, Grid, TextField, MenuItem, Button } from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';

export default function PlanificationFilters({
  yearOptions,
  selectedYear,
  onYearChange,
  entreprises,
  selectedEntId,
  onEntrepriseChange,
  isAdmin,
  onEditObjectives,
  disableEdit,
}) {
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 3 }}>
      <CardContent>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={7}>
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12} sm={6}>
                <TextField
                  select
                  fullWidth
                  size="small"
                  label="Année"
                  value={selectedYear}
                  onChange={onYearChange}
                >
                  {yearOptions.map(y => (
                    <MenuItem key={y} value={y}>{y}</MenuItem>
                  ))}
                </TextField>
              </Grid>
              {isAdmin && (
                <Grid item xs={12} sm={6}>
                  <TextField
                    select
                    fullWidth
                    size="small"
                    label="Entreprise"
                    value={selectedEntId}
                    onChange={onEntrepriseChange}
                  >
                    {entreprises.map(entreprise => (
                      <MenuItem key={entreprise.idEntreprise} value={entreprise.idEntreprise}>
                        {entreprise.nomEntreprise}
                      </MenuItem>
                    ))}
                  </TextField>
                </Grid>
              )}
            </Grid>
          </Grid>
          {isAdmin && (
            <Grid item xs={12} md={5} sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={onEditObjectives}
                disabled={disableEdit}
              >
                Modifier objectifs
              </Button>
            </Grid>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}

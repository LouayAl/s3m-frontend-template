import {
  Box, Typography, TextField, MenuItem,
  Grid, Chip, Divider,
} from '@mui/material';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';
import BusinessOutlinedIcon from '@mui/icons-material/BusinessOutlined';

export default function Step3Details({
  formData, onChange,
  formateurs, entreprises,
  selectedFormation, selectedDays,
}) {
  const count    = selectedDays.length;
  const dateDebut = count > 0 ? selectedDays[0] : null;
  const dateFin   = count > 0 ? selectedDays[count - 1] : null;
  const fmt = (d) => d ? d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  return (
    <Box>
      {/* Session summary */}
      <Box sx={{
        p: 2, mb: 2.5, borderRadius: 2,
        bgcolor: 'background.default',
        border: '1px solid', borderColor: 'divider',
      }}>
        <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
          Résumé de la session
        </Typography>
        <Grid container spacing={1}>
          {[
            { label: 'Formation',  value: selectedFormation?.module },
            { label: 'Jours',      value: `${count} jours` },
            { label: 'Début',      value: fmt(dateDebut) },
            { label: 'Fin',        value: fmt(dateFin) },
          ].map(item => (
            <Grid key={item.label} item xs={6}>
              <Typography variant="caption" color="text.secondary">{item.label}</Typography>
              <Typography variant="body2" fontWeight={600}>{item.value ?? '—'}</Typography>
            </Grid>
          ))}
        </Grid>
      </Box>

      <Grid container spacing={2}>
        {/* Reference */}
        <Grid item xs={12}>
          <TextField
            fullWidth size="small"
            label="Référence session"
            value={formData.referenceSession}
            onChange={e => onChange('referenceSession', e.target.value)}
            placeholder="Ex: RTG-2026-001"
          />
        </Grid>

        {/* Entreprise */}
        <Grid item xs={12} sm={6}>
          <TextField
            select fullWidth size="small"
            label="Entreprise cliente"
            value={formData.idEntreprise ?? ''}
            onChange={e => onChange('idEntreprise', Number(e.target.value))}
            InputProps={{
              startAdornment: <BusinessOutlinedIcon sx={{ fontSize:18, color:'text.secondary', mr:1 }} />,
            }}
          >
            {entreprises.map(e => (
              <MenuItem key={e.idEntreprise} value={e.idEntreprise}>
                {e.nomEntreprise}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Fournisseur */}
        <Grid item xs={12} sm={6}>
          <TextField
            select fullWidth size="small"
            label="Fournisseur"
            value={formData.idFournisseur ?? ''}
            onChange={e => onChange('idFournisseur', Number(e.target.value))}
            InputProps={{
              startAdornment: <BusinessOutlinedIcon sx={{ fontSize:18, color:'text.secondary', mr:1 }} />,
            }}
          >
            {entreprises.map(e => (
              <MenuItem key={e.idEntreprise} value={e.idEntreprise}>
                {e.nomEntreprise}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Formateur */}
        <Grid item xs={12} sm={6}>
          <TextField
            select fullWidth size="small"
            label="Formateur"
            value={formData.idFormateur ?? ''}
            onChange={e => onChange('idFormateur', Number(e.target.value))}
            InputProps={{
              startAdornment: <PersonOutlinedIcon sx={{ fontSize:18, color:'text.secondary', mr:1 }} />,
            }}
          >
            {formateurs.map(f => (
              <MenuItem key={f.idFormateur} value={f.idFormateur}>
                {f.nom} {f.prenom}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* dHeures */}
        <Grid item xs={12} sm={6}>
          <TextField
            fullWidth size="small"
            label="Durée totale (heures)"
            type="number"
            value={formData.dHeures}
            onChange={e => onChange('dHeures', e.target.value)}
            inputProps={{ min: 1, step: 0.5 }}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
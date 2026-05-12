import { Box, Typography, TextField, MenuItem, Grid } from '@mui/material';
import PersonOutlinedIcon     from '@mui/icons-material/PersonOutlined';
import AccessTimeOutlinedIcon from '@mui/icons-material/AccessTimeOutlined';
import BusinessOutlinedIcon   from '@mui/icons-material/BusinessOutlined';
import LockOutlinedIcon       from '@mui/icons-material/LockOutlined';
import { useAuth } from '../../../../contexts/auth/AuthContext';

export default function Step3Details({
  formData, onChange,
  formateurs, entreprises,
  selectedFormation, selectedDays,
}) {
  const { user } = useAuth();

  const count     = selectedDays.length;
  const dateDebut = count > 0 ? selectedDays[0] : null;
  const dateFin   = count > 0 ? selectedDays[count - 1] : null;
  const fmt = (d) =>
    d ? d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  return (
    <Box sx={{ display:'flex', flexDirection:'column', gap:2.5 }}>

      {/* ── Session summary ──────────────────────────────────────────────── */}
      <Box sx={{ p:2, borderRadius:2, bgcolor:'primary.main', color:'#fff' }}>
        <Typography variant="caption" sx={{ opacity:0.8, fontWeight:600, letterSpacing:'0.05em' }}>
          RÉSUMÉ DE LA SESSION
        </Typography>
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1.5, mt:1.5 }}>
          {[
            { label:'Formation', value: selectedFormation?.module ?? '—' },
            { label:'Jours',     value: `${count} jour${count !== 1 ? 's' : ''}` },
            { label:'Début',     value: fmt(dateDebut) },
            { label:'Fin',       value: fmt(dateFin) },
          ].map(item => (
            <Box key={item.label}>
              <Typography variant="caption" sx={{ opacity:0.7, display:'block' }}>{item.label}</Typography>
              <Typography variant="body2" fontWeight={700} sx={{
                overflow:'hidden', display:'-webkit-box',
                WebkitLineClamp:2, WebkitBoxOrient:'vertical',
              }}>
                {item.value}
              </Typography>
            </Box>
          ))}
        </Box>
      </Box>

      {/* ── Entreprise — locked, taken from auth ─────────────────────────── */}
      <Box sx={{
        px:2, py:1.5, border:'1px solid', borderColor:'divider',
        borderRadius:1, bgcolor:'action.disabledBackground',
        display:'flex', alignItems:'center', gap:1.5,
      }}>
        <LockOutlinedIcon sx={{ fontSize:18, color:'text.disabled' }} />
        <Box>
          <Typography variant="caption" color="text.secondary" display="block">
            Entreprise cliente (pré-rempli automatiquement)
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {user?.nom ?? '—'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Non modifiable — lié à votre compte
          </Typography>
        </Box>
      </Box>

      {/* ── Editable fields ──────────────────────────────────────────────── */}
      <Grid container spacing={2}>

        {/* Référence */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Référence session"
            value={formData.referenceSession}
            onChange={e => onChange('referenceSession', e.target.value)}
            placeholder="Ex: RTG-2026-001"
            helperText="Modifiez si vous voulez une référence personnalisée."
          />
        </Grid>

        {/* Fournisseur — editable */}
        <Grid item xs={12}>
          <TextField
            select fullWidth
            label="Fournisseur"
            value={formData.idFournisseur ?? ''}
            onChange={e => onChange('idFournisseur', e.target.value ? Number(e.target.value) : null)}
            InputProps={{
              startAdornment: <BusinessOutlinedIcon sx={{ fontSize:18, color:'text.secondary', mr:1 }} />,
            }}
            helperText="Optionnel — organisme prestataire de la formation."
          >
            <MenuItem value=""><em>Aucun</em></MenuItem>
            {entreprises.map(e => (
              <MenuItem key={e.idEntreprise} value={e.idEntreprise}>
                {e.nomEntreprise}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Formateur */}
        <Grid item xs={12}>
          <TextField
            select fullWidth
            label="Formateur"
            value={formData.idFormateur ?? ''}
            onChange={e => onChange('idFormateur', e.target.value ? Number(e.target.value) : null)}
            InputProps={{
              startAdornment: <PersonOutlinedIcon sx={{ fontSize:18, color:'text.secondary', mr:1 }} />,
            }}
            helperText="Optionnel — peut être défini plus tard."
          >
            <MenuItem value=""><em>Aucun</em></MenuItem>
            {formateurs.map(f => (
              <MenuItem key={f.idFormateur} value={f.idFormateur}>
                {f.nom} {f.prenom}
              </MenuItem>
            ))}
          </TextField>
        </Grid>

        {/* Durée */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Durée totale (heures)"
            type="number"
            value={formData.dHeures}
            onChange={e => onChange('dHeures', e.target.value)}
            inputProps={{ min:1, step:0.5 }}
            InputProps={{
              startAdornment: <AccessTimeOutlinedIcon sx={{ fontSize:18, color:'text.secondary', mr:1 }} />,
            }}
            helperText={`${count} jour${count !== 1 ? 's' : ''} sélectionné${count !== 1 ? 's' : ''}. Saisissez le total en heures.`}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
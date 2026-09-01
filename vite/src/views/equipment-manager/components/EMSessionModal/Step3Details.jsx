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
        <Typography variant="caption" color="inherit" sx={{ opacity:0.8, fontWeight:600, letterSpacing:'0.05em' }}>
          SESSION SUMMARY
        </Typography>
        <Box sx={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:1.5, mt:1.5 }}>
          {[
            { label:'Training course', value: selectedFormation?.module ?? '—' },
            { label:'Days',     value: `${count} day${count !== 1 ? 's' : ''}` },
            { label:'Start',     value: fmt(dateDebut) },
            { label:'End',       value: fmt(dateFin) },
          ].map(item => (
            <Box key={item.label}>
              <Typography variant="caption" sx={{color: '#fff', opacity:0.7, display:'block' }}>{item.label}</Typography>
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
            Client company (pre-filled automatically)
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {user?.nom ?? '—'}
          </Typography>
          <Typography variant="caption" color="text.disabled">
            Not modifiable — linked to your account
          </Typography>
        </Box>
      </Box>

      {/* ── Editable fields ──────────────────────────────────────────────── */}
      <Grid container spacing={2}>

        {/* Référence */}
        <Grid item xs={12}>
          <TextField
            fullWidth
            label="Session Reference"
            value={formData.referenceSession}
            onChange={e => onChange('referenceSession', e.target.value)}
            placeholder="Ex: RTG-2026-001"
            helperText="Modify if you want a custom reference."
          />
        </Grid>

        {/* Fournisseur — editable */}
        <Grid item xs={12}>
          <TextField
            select fullWidth
            label="Supplier"
            value={formData.idFournisseur ?? ''}
            onChange={e => onChange('idFournisseur', e.target.value ? Number(e.target.value) : null)}
            InputProps={{
              startAdornment: <BusinessOutlinedIcon sx={{ fontSize:18, color:'text.secondary', mr:1 }} />,
            }}
            helperText="Optional — training provider organization."
          >
            <MenuItem value=""><em>None</em></MenuItem>
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
            label="Trainer"
            value={formData.idFormateur ?? ''}
            onChange={e => onChange('idFormateur', e.target.value ? Number(e.target.value) : null)}
            InputProps={{
              startAdornment: <PersonOutlinedIcon sx={{ fontSize:18, color:'text.secondary', mr:1 }} />,
            }}
            helperText="Optional — can be defined later."
          >
            <MenuItem value=""><em>None</em></MenuItem>
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
            label="Total duration (hours)"
            type="number"
            value={formData.dHeures}
            onChange={e => onChange('dHeures', e.target.value)}
            inputProps={{ min:1, step:0.5 }}
            InputProps={{
              startAdornment: <AccessTimeOutlinedIcon sx={{ fontSize:18, color:'text.secondary', mr:1 }} />,
            }}
            helperText={`${count} day${count !== 1 ? 's' : ''} selected. Enter the total in hours.`}
          />
        </Grid>
      </Grid>
    </Box>
  );
}
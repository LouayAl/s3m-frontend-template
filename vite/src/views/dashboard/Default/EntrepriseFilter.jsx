import PropTypes from 'prop-types';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';

export default function EntrepriseFilter({
  entreprises = [],
  selectedEntrepriseId = '',
  onChange,
  loading = false,
}) {
  if (loading) return <Skeleton variant="rounded" width={260} height={40} />;

  return (
    <TextField
      select
      size="small"
      label="Entreprise"
      value={selectedEntrepriseId ?? ''}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth: { xs: '100%', sm: 260 } }}
    >
      <MenuItem value="">
        <em>Toutes les entreprises</em>
      </MenuItem>
      {entreprises.map((entreprise) => (
        <MenuItem key={entreprise.idEntreprise} value={entreprise.idEntreprise}>
          {entreprise.nomEntreprise}
        </MenuItem>
      ))}
    </TextField>
  );
}

EntrepriseFilter.propTypes = {
  entreprises: PropTypes.arrayOf(
    PropTypes.shape({
      idEntreprise: PropTypes.number.isRequired,
      nomEntreprise: PropTypes.string.isRequired,
    })
  ),
  selectedEntrepriseId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};

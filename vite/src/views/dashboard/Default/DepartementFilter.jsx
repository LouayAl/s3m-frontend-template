import PropTypes from 'prop-types';
import MenuItem from '@mui/material/MenuItem';
import Skeleton from '@mui/material/Skeleton';
import TextField from '@mui/material/TextField';

export default function DepartementFilter({
  departements = [],
  selectedDepartementId = '',
  onChange,
  loading = false,
}) {
  if (loading) return <Skeleton variant="rounded" width={220} height={40} />;

  return (
    <TextField
      select
      size="small"
      label="Département"
      value={selectedDepartementId ?? ''}
      onChange={(e) => onChange(e.target.value)}
      sx={{ minWidth: { xs: '100%', sm: 220 } }}
    >
      <MenuItem value="">
        <em>Tous les départements</em>
      </MenuItem>
      {departements.map((d) => (
        <MenuItem key={d.id} value={d.id}>
          {d.nom}
        </MenuItem>
      ))}
    </TextField>
  );
}

DepartementFilter.propTypes = {
  departements: PropTypes.arrayOf(
    PropTypes.shape({ id: PropTypes.number.isRequired, nom: PropTypes.string.isRequired })
  ),
  selectedDepartementId: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  onChange: PropTypes.func.isRequired,
  loading: PropTypes.bool,
};
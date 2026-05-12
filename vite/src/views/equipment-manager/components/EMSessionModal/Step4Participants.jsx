// frontend-template/vite/src/views/equipment-manager/components/Step4Participants.jsx
import { useState, useMemo, useEffect } from 'react';
import {
  Box, Typography, TextField, Checkbox, InputAdornment,
  CircularProgress, Chip, Alert,Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { useNavigate } from 'react-router-dom';
import PersonAddIcon from '@mui/icons-material/PersonAdd';

export default function Step4Participants({
  employes,
  loading,
  selectedParticipants,
  onSelectionChange,
}) {
  const [search, setSearch] = useState('');

  const selectedIds = useMemo(
    () => new Set(selectedParticipants.map(p => p.idEmploye)),
    [selectedParticipants]
  );

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return employes;
    return employes.filter(e =>
      e.nom?.toLowerCase().includes(q) ||
      e.prenom?.toLowerCase().includes(q) ||
      e.matricule?.toLowerCase().includes(q) ||
      e.cin?.toLowerCase().includes(q)
    );
  }, [employes, search]);

  const visibleIds     = filtered.map(e => e.idEmploye);
  const allSelected    = visibleIds.length > 0 && visibleIds.every(id => selectedIds.has(id));
  const someSelected   = visibleIds.some(id => selectedIds.has(id));

  const navigate = useNavigate();

  const toggleOne = (emp) => {
    if (selectedIds.has(emp.idEmploye)) {
      onSelectionChange(selectedParticipants.filter(p => p.idEmploye !== emp.idEmploye));
    } else {
      onSelectionChange([...selectedParticipants, emp]);
    }
  };

  const toggleAll = () => {
    if (allSelected) {
      // Deselect all visible
      onSelectionChange(selectedParticipants.filter(p => !visibleIds.includes(p.idEmploye)));
    } else {
      // Add all visible that aren't already selected
      const toAdd = filtered.filter(e => !selectedIds.has(e.idEmploye));
      onSelectionChange([...selectedParticipants, ...toAdd]);
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
        <CircularProgress size={32} />
        <Typography variant="caption" color="text.secondary">Chargement des employés...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Header count */}
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
        <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
          {employes.length} employé{employes.length !== 1 ? 's' : ''} disponible{employes.length !== 1 ? 's' : ''}
        </Typography>
        {selectedParticipants.length > 0 && (
          <Chip
            label={`${selectedParticipants.length} sélectionné${selectedParticipants.length !== 1 ? 's' : ''}`}
            color="primary"
            size="small"
            sx={{ fontWeight: 700 }}
            onDelete={() => onSelectionChange([])}
          />
        )}
      </Box>

      {/* Search */}
      <TextField
        fullWidth size="small"
        placeholder="Rechercher par nom, prénom, matricule, CIN..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1 }}
      />

    <Box sx={{ display:'flex', justifyContent:'flex-end', mb:1 }}>
        <Button
            size="small"
            variant="outlined"
            startIcon={<PersonAddIcon />}
            onClick={() => navigate('/em/employes')}
            sx={{ fontSize: 12 }}
        >
            Créer un nouvel employé
        </Button>
    </Box>

      {/* Select-all row */}
      {filtered.length > 0 && (
        <Box
          onClick={toggleAll}
          sx={{
            display: 'flex', alignItems: 'center', gap: 1,
            px: 1, py: 0.5, borderRadius: 1,
            cursor: 'pointer', bgcolor: 'background.default',
            border: '1px solid', borderColor: 'divider',
            mb: 0.5,
            '&:hover': { bgcolor: 'action.hover' },
          }}
        >
          <Checkbox
            size="small"
            checked={allSelected}
            indeterminate={!allSelected && someSelected}
            onChange={toggleAll}
            onClick={e => e.stopPropagation()}
          />
          <Typography variant="caption" fontWeight={600} color="text.secondary">
            {allSelected ? 'Tout désélectionner' : 'Tout sélectionner'} ({filtered.length})
          </Typography>
        </Box>
      )}

      {/* Employee list */}
      <Box sx={{ maxHeight: 320, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 0.5, pr: 0.5 }}>
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            Aucun employé trouvé.
          </Typography>
        )}
        {filtered.map(emp => {
          const isSelected = selectedIds.has(emp.idEmploye);
          return (
            <Box
              key={emp.idEmploye}
              onClick={() => toggleOne(emp)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1,
                px: 1.5, py: 1, borderRadius: 1.5, cursor: 'pointer',
                border: '1px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'primary.light' : 'background.paper',
                transition: 'all 0.12s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: isSelected ? 'primary.light' : 'action.hover',
                },
              }}
            >
              <Checkbox
                size="small"
                checked={isSelected}
                onClick={e => e.stopPropagation()}
                onChange={() => toggleOne(emp)}
                sx={{ p: 0 }}
              />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {emp.prenom} {emp.nom}
                </Typography>
                <Typography variant="caption" color="text.secondary" noWrap>
                  {[emp.matricule, emp.cin, emp.departement].filter(Boolean).join(' · ')}
                </Typography>
              </Box>
            </Box>
          );
        })}
      </Box>

      {employes.length === 0 && (
        <Alert severity="info" sx={{ mt: 1 }}>
          Aucun employé trouvé pour votre entreprise. Vous pourrez ajouter des participants plus tard.
        </Alert>
      )}
    </Box>
  );
}
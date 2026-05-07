import { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, InputAdornment,
  Chip, CircularProgress,
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';

export default function Step1Formation({ formations, loading, selectedFormation, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return formations;
    return formations.filter(f =>
      f.module?.toLowerCase().includes(q) ||
      f.familleFormation?.toLowerCase().includes(q) ||
      f.typeFormation?.toLowerCase().includes(q) ||
      f.referenceFormation?.toLowerCase().includes(q)
    );
  }, [formations, search]);

  if (loading) {
    return (
      <Box sx={{ display:'flex', flexDirection:'column', alignItems:'center', py:6, gap:2 }}>
        <CircularProgress size={32} />
        <Typography variant="caption" color="text.secondary">Chargement des formations...</Typography>
      </Box>
    );
  }

  return (
    <Box>
      <TextField
        fullWidth size="small"
        placeholder="Rechercher par module, famille, type..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize:18, color:'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 1.5 }}
      />

      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        {filtered.length} formation{filtered.length !== 1 ? 's' : ''}
      </Typography>

      <Box sx={{ display:'flex', flexDirection:'column', gap:1, maxHeight:400, overflowY:'auto', pr:0.5 }}>
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            Aucune formation trouvée.
          </Typography>
        )}
        {filtered.map(f => {
          const isSelected = selectedFormation?.id === f.id;
          return (
            <Box
              key={f.id}
              onClick={() => onSelect(f)}
              sx={{
                p: 2, borderRadius: 2, cursor: 'pointer',
                border: '2px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'primary.light' : 'background.paper',
                transition: 'all 0.15s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: isSelected ? 'primary.light' : 'action.hover',
                  transform: 'translateY(-1px)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
                },
              }}
            >
              <Box sx={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', mb:0.5 }}>
                <Typography
                  variant="body2" fontWeight={700}
                  sx={{ flex:1, mr:1, overflow:'hidden', display:'-webkit-box',
                    WebkitLineClamp:2, WebkitBoxOrient:'vertical' }}
                >
                  {f.module}
                </Typography>
                <Chip
                  label={f.interneExterne ?? 'N/A'}
                  size="small"
                  variant="outlined"
                  sx={{ fontSize:10, flexShrink:0 }}
                />
              </Box>
              <Typography variant="caption" color="text.secondary" display="block">
                {f.familleFormation} {f.sousFamille ? `· ${f.sousFamille}` : ''}
              </Typography>
              <Box sx={{ display:'flex', gap:2, mt:0.75, flexWrap:'wrap' }}>
                {f.dureeJours && (
                  <Typography variant="caption" color="text.secondary">
                    📅 {f.dureeJours} jours
                  </Typography>
                )}
                {f.dureeHeures && (
                  <Typography variant="caption" color="text.secondary">
                    ⏱ {f.dureeHeures}h
                  </Typography>
                )}
                {f.annee && (
                  <Typography variant="caption" color="text.secondary">
                    📆 {f.annee}
                  </Typography>
                )}
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
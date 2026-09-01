import { useState, useMemo } from 'react';
import {
  Box, Typography, TextField, Chip, Avatar,
  InputAdornment, CircularProgress,
} from '@mui/material';
import SearchIcon        from '@mui/icons-material/Search';
import GroupOutlinedIcon from '@mui/icons-material/GroupOutlined';
import PersonOutlinedIcon from '@mui/icons-material/PersonOutlined';

const STATUS_CONFIG = {
  EN_COURS:  { label: 'In progress',  color: 'success' },
  PLANIFIEE: { label: 'Planified', color: 'warning' },
  TERMINEE:  { label: 'Completed',  color: 'default' },
};

export default function SessionStep({ sessions, loading, selectedSession, onSelect }) {
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    if (!q) return sessions;
    return sessions.filter(s =>
      s.formation?.toLowerCase().includes(q) ||
      s.referenceSession?.toLowerCase().includes(q) ||
      s.entrepriseNom?.toLowerCase().includes(q) ||
      s.formateurNomComplet?.toLowerCase().includes(q)
    );
  }, [sessions, search]);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', py: 6, gap: 2 }}>
        <CircularProgress size={32} />
        <Typography variant="caption" color="text.secondary">
          Loading sessions...
        </Typography>
      </Box>
    );
  }

  return (
    <Box>
      {/* Search */}
      <TextField
        fullWidth
        size="small"
        placeholder="Search by formation, reference, company..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
            </InputAdornment>
          ),
        }}
        sx={{ mb: 2 }}
      />

      {/* Session count */}
      <Typography variant="caption" color="text.secondary" display="block" mb={1.5}>
        {filtered.length} session{filtered.length !== 1 ? 's' : ''}
      </Typography>

      {/* Session list */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1.5, maxHeight: 420, overflowY: 'auto', pr: 0.5 }}>
        {filtered.length === 0 && (
          <Typography variant="body2" color="text.secondary" textAlign="center" py={4}>
            No session found.
          </Typography>
        )}
        {filtered.map(s => {
          const isSelected = selectedSession?.idSession === s.idSession;
          const status     = STATUS_CONFIG[s.statut] ?? { label: s.statut, color: 'default' };

          return (
            <Box
              key={s.idSession}
              onClick={() => onSelect(s)}
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
              {/* Top row */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 0.5 }}>
                <Typography
                  variant="body2" fontWeight={700}
                  sx={{
                    flex: 1, mr: 1, overflow: 'hidden',
                    display: '-webkit-box', WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}
                >
                  {s.formation}
                </Typography>
                <Chip
                  label={status.label}
                  color={status.color}
                  size="small"
                  sx={{ fontWeight: 700, flexShrink: 0, fontSize: 11 }}
                />
              </Box>

              {/* Reference + company */}
              <Typography variant="caption" color="text.secondary" display="block">
                {s.referenceSession} · {s.entrepriseNom}
              </Typography>

              {/* Trainer */}
              {s.formateurNomComplet && (
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.5 }}>
                  <PersonOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {s.formateurNomComplet}
                  </Typography>
                </Box>
              )}

              {/* Dates + participants */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 0.75 }}>
                <Typography variant="caption" color="text.secondary">
                  {s.dateDebut} → {s.dateFin} · {s.dJours}j
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                  <GroupOutlinedIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                  <Typography variant="caption" color="text.secondary">
                    {s.participantsCount}
                  </Typography>
                </Box>
              </Box>
            </Box>
          );
        })}
      </Box>
    </Box>
  );
}
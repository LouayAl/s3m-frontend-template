import { Box, Typography, Avatar, Chip } from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

const STATUS_CONFIG = {
  EN_COURS:  { label: 'En cours',  color: 'success' },
  PLANIFIEE: { label: 'Planifiée', color: 'warning' },
  TERMINEE:  { label: 'Terminée',  color: 'default' },
};

const PRESENCE_OPTIONS = [
  { value: 'PRESENT', label: 'Présent', color: 'success' },
  { value: 'ABSENT',  label: 'Absent',  color: 'error'   },
  { value: 'RETARD',  label: 'Retard',  color: 'warning' },
];

export default function ParticipantStep({
  session, selectedParticipant, onSelectParticipant,
  selectedDay, onSelectDay,
  presence, onPresenceChange,
}) {
  const participants = session?.participants ?? [];
  const duree        = session ? Number(session.dJours) : 0;
  const dayOptions   = Array.from({ length: duree }, (_, i) => i + 1);

  return (
    <Box>
      {/* Session summary pill */}
      <Box sx={{
        p: 1.5, mb: 2, borderRadius: 2,
        bgcolor: 'background.default',
        border: '1px solid', borderColor: 'divider',
      }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Typography variant="body2" fontWeight={700}>{session?.formation}</Typography>
            <Typography variant="caption" color="text.secondary">
              {session?.referenceSession} · {session?.entrepriseNom}
            </Typography>
          </Box>
          <Chip
            label={STATUS_CONFIG[session?.statut]?.label ?? session?.statut}
            color={STATUS_CONFIG[session?.statut]?.color ?? 'default'}
            size="small" sx={{ fontWeight: 700 }}
          />
        </Box>
      </Box>

      {/* Participant list */}
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
        Sélectionner un participant
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3, maxHeight: 220, overflowY: 'auto', pr: 0.5 }}>
        {participants.map(p => {
          const isSelected = selectedParticipant?.idEmploye === p.idEmploye;
          return (
            <Box
              key={p.idEmploye}
              onClick={() => onSelectParticipant(p)}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5,
                p: 1.5, borderRadius: 2, cursor: 'pointer',
                border: '2px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'primary.light' : 'background.paper',
                transition: 'all 0.15s',
                '&:hover': {
                  borderColor: 'primary.main',
                  bgcolor: isSelected ? 'primary.light' : 'action.hover',
                },
              }}
            >
              <Avatar sx={{
                width: 36, height: 36, flexShrink: 0,
                bgcolor: isSelected ? 'primary.main' : 'grey.300',
                fontSize: 13, fontWeight: 700,
              }}>
                {p.prenom?.[0]}{p.nom?.[0]}
              </Avatar>
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" fontWeight={600} noWrap>
                  {p.prenom} {p.nom}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Matricule: {p.matricule}
                </Typography>
              </Box>
              {isSelected && (
                <CheckCircleIcon sx={{ color: 'primary.main', fontSize: 20, flexShrink: 0 }} />
              )}
            </Box>
          );
        })}
      </Box>

      {/* Day selector */}
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
        Sélectionner le jour
      </Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 3 }}>
        {dayOptions.map(d => {
          const isSelected = selectedDay === d;
          return (
            <Box
              key={d}
              onClick={() => onSelectDay(d)}
              sx={{
                width: 48, height: 48, borderRadius: 2,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                cursor: 'pointer', border: '2px solid',
                borderColor: isSelected ? 'primary.main' : 'divider',
                bgcolor: isSelected ? 'primary.main' : 'background.paper',
                transition: 'all 0.15s',
                '&:hover': { borderColor: 'primary.main', bgcolor: isSelected ? 'primary.main' : 'primary.light' },
              }}
            >
              <Typography
                variant="caption" fontWeight={700}
                color={isSelected ? '#fff' : 'text.secondary'}
              >
                J{d}
              </Typography>
            </Box>
          );
        })}
      </Box>

      {/* Presence */}
      <Typography variant="caption" color="text.secondary" fontWeight={600} display="block" mb={1}>
        Présence
      </Typography>
      <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
        {PRESENCE_OPTIONS.map(opt => (
          <Chip
            key={opt.value}
            label={opt.label}
            color={presence === opt.value ? opt.color : 'default'}
            variant={presence === opt.value ? 'filled' : 'outlined'}
            onClick={() => onPresenceChange(opt.value)}
            sx={{
              fontWeight: presence === opt.value ? 700 : 400,
              cursor: 'pointer', fontSize: 13, height: 36, px: 1,
            }}
          />
        ))}
      </Box>
    </Box>
  );
}
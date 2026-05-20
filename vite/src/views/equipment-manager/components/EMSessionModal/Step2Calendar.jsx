import { Box, Typography, Chip, Button } from '@mui/material';
import { DayPicker } from 'react-day-picker';
import { fr } from 'react-day-picker/locale';
import 'react-day-picker/style.css';

// ── Helper: format date as YYYY-MM-DD using LOCAL time (no UTC shift) ────────
function toLocalDateStr(d) {
  const year  = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day   = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default function Step2Calendar({ selectedDays, onDaysChange }) {
  const count     = selectedDays.length;
  const dateDebut = count > 0 ? selectedDays[0] : null;
  const dateFin   = count > 0 ? selectedDays[count - 1] : null;

  const fmt = (d) =>
    d ? d.toLocaleDateString('fr-FR', { day:'2-digit', month:'short', year:'numeric' }) : '—';

  const handleDayClick = (day) => {
    const dayStr = toLocalDateStr(day);
    const exists = selectedDays.some(d => toLocalDateStr(d) === dayStr);
    if (exists) {
      onDaysChange(selectedDays.filter(d => toLocalDateStr(d) !== dayStr));
    } else {
      onDaysChange([...selectedDays, day].sort((a, b) => a - b));
    }
  };

  const handleClear = () => onDaysChange([]);

  return (
    <Box>
      {/* Summary bar */}
      <Box sx={{
        p: 1.5, mb: 2, borderRadius: 2,
        bgcolor: 'background.default',
        border: '1px solid', borderColor: 'divider',
        display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center',
        minHeight: 44,
      }}>
        <Chip
          label={`${count} jour${count !== 1 ? 's' : ''} sélectionné${count !== 1 ? 's' : ''}`}
          color={count > 0 ? 'primary' : 'default'}
          size="small" sx={{ fontWeight: 700 }}
        />
        {count > 0 && (
          <>
            <Typography variant="caption" color="text.secondary">
              Du {fmt(dateDebut)} au {fmt(dateFin)}
            </Typography>
            <Button size="small" color="error" onClick={handleClear}
              sx={{ ml:'auto', fontSize:11 }}>
              Effacer
            </Button>
          </>
        )}
      </Box>

      {/* Calendar */}
      <Box sx={{
        display: 'flex', justifyContent: 'center',
        '& .rdp': { margin: 0 },
        '& .rdp-day_button': {
          borderRadius: '8px',
          width: 36, height: 36,
          fontSize: 13,
          transition: 'all 0.1s',
        },
        '& .rdp-selected .rdp-day_button': {
          backgroundColor: 'var(--rdp-accent-color)',
          color: '#fff',
          fontWeight: 700,
        },
        '& .rdp-day_button:hover': { transform: 'scale(1.1)' },
        '& .rdp-day[data-weekend] .rdp-day_button': {
          opacity: 0.75,
        },
      }}>
        <DayPicker
          key={count === 0 ? 'empty' : 'filled'}
          mode="multiple"
          selected={selectedDays}
          onDayClick={handleDayClick}
          locale={fr}
          showOutsideDays
          numberOfMonths={1}
          styles={{
            root: {
              '--rdp-accent-color': '#1976d2',
              '--rdp-accent-background-color': '#e3f2fd',
            },
          }}
        />
      </Box>

      {count === 0 && (
        <Typography variant="caption" color="text.secondary"
          display="block" textAlign="center" mt={1}>
          Cliquez sur les jours de formation pour les sélectionner.
          Les week-ends peuvent être inclus si nécessaire.
        </Typography>
      )}
    </Box>
  );
}
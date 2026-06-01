import { useEffect, useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  TextField,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Collapse,
  CircularProgress,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ExpandLessIcon from '@mui/icons-material/ExpandLess';
import { MONTH_KEYS, MONTH_LABELS } from './planificationConstants';

export default function PlanificationObjectivesModal({
  open,
  onClose,
  planData,
  selectedYear,
  onSave,
  saving,
}) {
  const [objectivesData, setObjectivesData] = useState([]);
  const [expandedMonths, setExpandedMonths] = useState({});

  useEffect(() => {
    if (!open || !planData) return;
    const initialData = MONTH_KEYS.map((key, i) => ({
      month: key,
      label: MONTH_LABELS[i],
      sessions: Array(planData.months[i]?.planifie || 0).fill(0).map(() => ({ participants: 0 })),
    }));

    setObjectivesData(initialData);
    setExpandedMonths(MONTH_KEYS.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
  }, [open, planData]);

  const handleAddSession = (monthIndex) => {
    setObjectivesData(prev => {
      const clone = [...prev];
      clone[monthIndex] = {
        ...clone[monthIndex],
        sessions: [...clone[monthIndex].sessions, { participants: 0 }],
      };
      return clone;
    });
  };

  const handleSetSessionCount = (monthIndex, count) => {
    const newCount = Math.max(0, parseInt(count, 10) || 0);
    setObjectivesData(prev => {
      const clone = [...prev];
      const month = clone[monthIndex];
      const currentCount = month.sessions.length;
      if (newCount > currentCount) {
        month.sessions = [...month.sessions, ...Array(newCount - currentCount).fill(0).map(() => ({ participants: 0 }))];
      } else if (newCount < currentCount) {
        month.sessions = month.sessions.slice(0, newCount);
      }
      clone[monthIndex] = month;
      return clone;
    });
  };

  const handleRemoveSession = (monthIndex, sessionIndex) => {
    setObjectivesData(prev => {
      const clone = [...prev];
      clone[monthIndex] = {
        ...clone[monthIndex],
        sessions: clone[monthIndex].sessions.filter((_, index) => index !== sessionIndex),
      };
      return clone;
    });
  };

  const handleSetParticipants = (monthIndex, sessionIndex, participants) => {
    const value = Math.max(0, parseInt(participants, 10) || 0);
    setObjectivesData(prev => {
      const clone = [...prev];
      const month = { ...clone[monthIndex] };
      month.sessions = [...month.sessions];
      month.sessions[sessionIndex] = {
        ...month.sessions[sessionIndex],
        participants: value,
      };
      clone[monthIndex] = month;
      return clone;
    });
  };

  const toggleMonth = (monthKey) => {
    setExpandedMonths(prev => ({
      ...prev,
      [monthKey]: !prev[monthKey],
    }));
  };

  const collapseAll = () => {
    setExpandedMonths(MONTH_KEYS.reduce((acc, key) => ({ ...acc, [key]: false }), {}));
  };

  const expandAll = () => {
    setExpandedMonths(MONTH_KEYS.reduce((acc, key) => ({ ...acc, [key]: true }), {}));
  };

  const handleSave = () => {
    onSave(objectivesData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Modifier les objectifs mensuels — {selectedYear}</DialogTitle>
      <DialogContent sx={{ pt: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, flexWrap: 'wrap', mb: 2 }}>
          <Button size="small" onClick={expandAll}>Tout développer</Button>
          <Button size="small" onClick={collapseAll}>Tout réduire</Button>
        </Box>

        {objectivesData.map((monthData, monthIndex) => (
          <Box key={monthData.month} sx={{ mb: 4, p: 2, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2, flexWrap: 'wrap', gap: 1 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <IconButton
                  size="small"
                  onClick={() => toggleMonth(monthData.month)}
                  sx={{ p: 0.5 }}
                >
                  {expandedMonths[monthData.month] ? <ExpandLessIcon fontSize="small" /> : <ExpandMoreIcon fontSize="small" />}
                </IconButton>
                <Typography variant="subtitle2" fontWeight={700}>
                  {monthData.label}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap' }}>
                <TextField
                  type="number"
                  size="small"
                  label="Nombre de sessions"
                  value={monthData.sessions.length}
                  onChange={e => handleSetSessionCount(monthIndex, e.target.value)}
                  inputProps={{ min: 0, step: 1 }}
                  sx={{ width: 150 }}
                />
                <Button size="small" startIcon={<AddIcon />} onClick={() => handleAddSession(monthIndex)} variant="outlined">
                  Ajouter
                </Button>
              </Box>
            </Box>

            <Collapse in={expandedMonths[monthData.month]} timeout="auto" unmountOnExit>
              {monthData.sessions.length > 0 ? (
                <Box sx={{ width: '100%', overflowX: 'auto' }}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'background.default' }}>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Session</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Participants</TableCell>
                        <TableCell align="center" sx={{ fontWeight: 700 }}>Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {monthData.sessions.map((session, sessionIndex) => (
                        <TableRow key={sessionIndex}>
                          <TableCell align="center">{sessionIndex + 1}</TableCell>
                          <TableCell>
                            <TextField
                              type="number"
                              size="small"
                              value={session.participants}
                              onChange={e => handleSetParticipants(monthIndex, sessionIndex, e.target.value)}
                              inputProps={{ min: 0, step: 1 }}
                              sx={{ maxWidth: 100 }}
                            />
                          </TableCell>
                          <TableCell align="center">
                            <IconButton size="small" color="error" onClick={() => handleRemoveSession(monthIndex, sessionIndex)}>
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>
              ) : (
                <Typography variant="caption" color="text.secondary">
                  Aucune session pour ce mois. Cliquez sur "Ajouter" pour commencer.
                </Typography>
              )}
            </Collapse>
          </Box>
        ))}
      </DialogContent>
      <DialogActions sx={{ p: 2, gap: 1, flexWrap: 'wrap' }}>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
          onClick={handleSave}
          disabled={saving}
        >
          {saving ? 'Enregistrement...' : 'Enregistrer'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

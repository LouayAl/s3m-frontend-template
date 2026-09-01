// views/equipment-manager/components/DailyProgramPanel.jsx
import { useState, useEffect } from 'react';
import {
  Alert, Box, Button, Card, CardContent,
  CircularProgress, IconButton, TextField, Typography,
} from '@mui/material';
import AddIcon    from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon   from '@mui/icons-material/Save';
import { getDailyProgram, saveDailyProgram } from '../../../api/emApi';

// ── Time helpers ──────────────────────────────────────────────────────────────

const toInputDateTime = (value) => {
  if (!value) return '';
  return value.length > 16 ? value.slice(0, 16) : value;
};

const getDayDate = (sessionDateDebut, day) => {
  if (!sessionDateDebut || !day) return '';
  const date = new Date(`${sessionDateDebut}T00:00:00`);
  date.setDate(date.getDate() + day - 1);
  const y  = date.getFullYear();
  const m  = String(date.getMonth() + 1).padStart(2, '0');
  const d  = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

const emptyRow = (dateDebut = '', dateFin = '') => ({
  dateDebut,
  dateFin,
  activite: '',
});

// ── Activity row — stacked layout (mobile-first) ──────────────────────────────

function ActivityRow({ row, index, canEdit, onUpdate, onDelete }) {
  return (
    <Box sx={{
      p: 1.5, mb: 1.5, borderRadius: 1.5,
      border: '1px solid', borderColor: 'divider',
      bgcolor: 'background.default',
      display: 'flex', flexDirection: 'column', gap: 1,
    }}>
      {/* Row number + delete */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Typography variant="caption" color="text.secondary" fontWeight={700}>
          Activity {index + 1}
        </Typography>
        {canEdit && (
          <IconButton color="error" size="small" onClick={() => onDelete(index)}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        )}
      </Box>

      {/* Activité field — full width */}
      <TextField
        size="small"
        fullWidth
        label="Activity"
        value={row.activite}
        onChange={e => onUpdate(index, 'activite', e.target.value)}
        disabled={!canEdit}
        placeholder="Describe the activity..."
      />

      {/* Date début + fin — side by side on sm+, stacked on xs */}
      <Box sx={{ display: 'flex', gap: 1, flexDirection: { xs: 'column', sm: 'row' } }}>
        <TextField
          type="datetime-local"
          size="small"
          fullWidth
          label="Start"
          InputLabelProps={{ shrink: true }}
          value={row.dateDebut}
          onChange={e => onUpdate(index, 'dateDebut', e.target.value)}
          disabled={!canEdit}
        />
        <TextField
          type="datetime-local"
          size="small"
          fullWidth
          label="End"
          InputLabelProps={{ shrink: true }}
          value={row.dateFin}
          onChange={e => onUpdate(index, 'dateFin', e.target.value)}
          disabled={!canEdit}
        />
      </Box>
    </Box>
  );
}

// ── Main component ────────────────────────────────────────────────────────────

export default function DailyProgramPanel({ sessionId, activeDay, session, canEdit }) {
  const [rows,        setRows]        = useState([]);
  const [commentaire, setCommentaire] = useState('');
  const [loading,     setLoading]     = useState(false);
  const [saving,      setSaving]      = useState(false);
  const [message,     setMessage]     = useState(null);

  useEffect(() => {
    if (!sessionId || !activeDay) return;
    setLoading(true);
    setMessage(null);
    getDailyProgram(sessionId, activeDay)
      .then(data => {
        setRows((data.entries ?? []).map(entry => ({
          dateDebut: toInputDateTime(entry.dateDebut),
          dateFin:   toInputDateTime(entry.dateFin),
          activite:  entry.activite ?? '',
        })));
        setCommentaire(data.commentaire ?? '');
      })
      .catch(() => setMessage({ severity: 'error', text: 'Impossible to load the daily program.' }))
      .finally(() => setLoading(false));
  }, [sessionId, activeDay]);

  const handleAddRow = () => {
    const dayDate = getDayDate(session?.dateDebut, activeDay);
    setRows(prev => [
      ...prev,
      emptyRow(
        dayDate ? `${dayDate}T09:00` : '',
        dayDate ? `${dayDate}T10:00` : '',
      ),
    ]);
  };

  const handleUpdateRow = (index, field, value) =>
    setRows(prev => prev.map((row, i) => i === index ? { ...row, [field]: value } : row));

  const handleDeleteRow = (index) =>
    setRows(prev => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        commentaire,
        entries: rows
          .map((row, index) => ({
            dateDebut: row.dateDebut || null,
            dateFin:   row.dateFin   || null,
            activite:  row.activite,
            position:  index,
          }))
          .filter(row => row.activite.trim() !== ''),
      };
      const saved = await saveDailyProgram(sessionId, activeDay, payload);
      setRows((saved.entries ?? []).map(entry => ({
        dateDebut: toInputDateTime(entry.dateDebut),
        dateFin:   toInputDateTime(entry.dateFin),
        activite:  entry.activite ?? '',
      })));
      setCommentaire(saved.commentaire ?? '');
      setMessage({ severity: 'success', text: 'Daily program saved.' });
    } catch {
      setMessage({ severity: 'error', text: "Error occurred while saving the program." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 2 }}>
      <CardContent>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, gap: 1 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Daily Schedule — Day {activeDay}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Activities and remarks specific to this day.
            </Typography>
          </Box>
          {canEdit && (
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddRow}>
              Add
            </Button>
          )}
        </Box>

        {message && <Alert severity={message.severity} sx={{ mb: 2 }}>{message.text}</Alert>}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 3 }}>
            <CircularProgress size={24} />
          </Box>
        ) : (
          <>
            {/* Activity rows — stacked cards instead of a table */}
            {rows.length === 0 ? (
              <Box sx={{ py: 3, textAlign: 'center', color: 'text.secondary', mb: 2 }}>
                <Typography variant="body2">No daily program defined for this day.</Typography>
                {canEdit && (
                  <Typography variant="caption">Click on «Add» to get started.</Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ mb: 2 }}>
                {rows.map((row, index) => (
                  <ActivityRow
                    key={index}
                    row={row}
                    index={index}
                    canEdit={canEdit}
                    onUpdate={handleUpdateRow}
                    onDelete={handleDeleteRow}
                  />
                ))}
              </Box>
            )}

            {/* Commentaire */}
            <TextField
              label="Comment"
              value={commentaire}
              onChange={e => setCommentaire(e.target.value)}
              disabled={!canEdit}
              multiline
              minRows={3}
              fullWidth
              sx={{ mb: canEdit ? 2 : 0 }}
            />

            {canEdit && (
              <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="contained"
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Daily Program'}
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
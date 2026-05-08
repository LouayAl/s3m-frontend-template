import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CircularProgress,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save';
import { getDailyProgram, saveDailyProgram } from '../../../api/emApi';

const emptyRow = (dateDebut = '', dateFin = '') => ({
  dateDebut,
  dateFin,
  activite: '',
});

const toInputDateTime = (value) => {
  if (!value) return '';
  return value.length > 16 ? value.slice(0, 16) : value;
};

const getDayDate = (sessionDateDebut, day) => {
  if (!sessionDateDebut || !day) return '';
  const date = new Date(`${sessionDateDebut}T00:00:00`);
  date.setDate(date.getDate() + day - 1);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const dateOfMonth = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${dateOfMonth}`;
};

export default function DailyProgramPanel({ sessionId, activeDay, session, canEdit }) {
  const [rows, setRows] = useState([]);
  const [commentaire, setCommentaire] = useState('');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState(null);

  useEffect(() => {
    if (!sessionId || !activeDay) return;

    setLoading(true);
    setMessage(null);
    getDailyProgram(sessionId, activeDay)
      .then(data => {
        setRows((data.entries ?? []).map(entry => ({
          dateDebut: toInputDateTime(entry.dateDebut),
          dateFin: toInputDateTime(entry.dateFin),
          activite: entry.activite ?? '',
        })));
        setCommentaire(data.commentaire ?? '');
      })
      .catch(() => setMessage({ severity: 'error', text: 'Impossible de charger le programme du jour.' }))
      .finally(() => setLoading(false));
  }, [sessionId, activeDay]);

  const handleAddRow = () => {
    const dayDate = getDayDate(session?.dateDebut, activeDay);
    setRows(prev => [...prev, emptyRow(dayDate ? `${dayDate}T09:00` : '', dayDate ? `${dayDate}T10:00` : '')]);
  };

  const handleUpdateRow = (index, field, value) => {
    setRows(prev => prev.map((row, i) => (i === index ? { ...row, [field]: value } : row)));
  };

  const handleDeleteRow = (index) => {
    setRows(prev => prev.filter((_, i) => i !== index));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage(null);
    try {
      const payload = {
        commentaire,
        entries: rows
          .map((row, index) => ({
            dateDebut: row.dateDebut || null,
            dateFin: row.dateFin || null,
            activite: row.activite,
            position: index,
          }))
          .filter(row => row.activite.trim() !== ''),
      };

      const saved = await saveDailyProgram(sessionId, activeDay, payload);
      setRows((saved.entries ?? []).map(entry => ({
        dateDebut: toInputDateTime(entry.dateDebut),
        dateFin: toInputDateTime(entry.dateFin),
        activite: entry.activite ?? '',
      })));
      setCommentaire(saved.commentaire ?? '');
      setMessage({ severity: 'success', text: 'Programme du jour enregistre.' });
    } catch {
      setMessage({ severity: 'error', text: "Erreur lors de l'enregistrement du programme." });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider', mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, alignItems: 'center', mb: 2 }}>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              Programme journalier - Jour {activeDay}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Activites et remarques propres a ce jour.
            </Typography>
          </Box>
          {canEdit && (
            <Button variant="outlined" size="small" startIcon={<AddIcon />} onClick={handleAddRow}>
              Ajouter
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
            <Box sx={{ overflowX: 'auto', mb: 2 }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700, minWidth: 190 }}>Date de debut</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 190 }}>Date de fin</TableCell>
                    <TableCell sx={{ fontWeight: 700, minWidth: 260 }}>Activite</TableCell>
                    {canEdit && <TableCell align="right" sx={{ fontWeight: 700, width: 56 }}> </TableCell>}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {rows.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={canEdit ? 4 : 3} align="center" sx={{ py: 3, color: 'text.secondary' }}>
                        Aucun programme defini pour ce jour.
                      </TableCell>
                    </TableRow>
                  )}

                  {rows.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>
                        <TextField
                          type="datetime-local"
                          size="small"
                          fullWidth
                          value={row.dateDebut}
                          onChange={e => handleUpdateRow(index, 'dateDebut', e.target.value)}
                          disabled={!canEdit}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          type="datetime-local"
                          size="small"
                          fullWidth
                          value={row.dateFin}
                          onChange={e => handleUpdateRow(index, 'dateFin', e.target.value)}
                          disabled={!canEdit}
                        />
                      </TableCell>
                      <TableCell>
                        <TextField
                          size="small"
                          fullWidth
                          value={row.activite}
                          onChange={e => handleUpdateRow(index, 'activite', e.target.value)}
                          disabled={!canEdit}
                          placeholder="Activite"
                        />
                      </TableCell>
                      {canEdit && (
                        <TableCell align="right">
                          <IconButton color="error" size="small" onClick={() => handleDeleteRow(index)}>
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Box>

            <TextField
              label="Commentaire"
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
                  {saving ? 'Enregistrement...' : 'Enregistrer le programme'}
                </Button>
              </Box>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

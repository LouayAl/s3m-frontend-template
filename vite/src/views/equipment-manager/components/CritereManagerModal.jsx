// TODO: enhance reordering with drag-and-drop using @dnd-kit/sortable or react-beautiful-dnd
//       once the basic app is complete

import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton, TextField,
  Alert, CircularProgress, Divider, Tooltip,
} from '@mui/material';
import AddIcon        from '@mui/icons-material/Add';
import DeleteIcon     from '@mui/icons-material/Delete';
import ArrowUpwardIcon   from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon  from '@mui/icons-material/WarningAmber';
import { getSessionCriteres, saveSessionCriteres } from '../../../api/emApi';

export default function CritereManagerModal({ open, onClose, sessionId, jour, hasEvaluations, onSaved }) {
  const [criteres, setCriteres] = useState([]); // list of { id, libelle }
  const [loading,  setLoading]  = useState(false);
  const [saving,   setSaving]   = useState(false);
  const [error,    setError]    = useState('');

  // ─── Load existing criteria on open ────────────────────────────────────────
  useEffect(() => {
    if (!open || !sessionId || !jour) return;
    setLoading(true);
    setError('');
    getSessionCriteres(sessionId, jour)
      .then(data => {
        setCriteres(data.map(c => ({ id: c.id, libelle: c.libelle })));
      })
      .catch(() => setError('Erreur lors du chargement des critères.'))
      .finally(() => setLoading(false));
  }, [open, sessionId, jour]);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleAdd = () => {
    setCriteres(prev => [...prev, { id: null, libelle: '' }]);
  };

  const handleDelete = (idx) => {
    setCriteres(prev => prev.filter((_, i) => i !== idx));
  };

  const handleChange = (idx, value) => {
    setCriteres(prev => prev.map((c, i) => i === idx ? { ...c, libelle: value } : c));
  };

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    setCriteres(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const handleMoveDown = (idx) => {
    setCriteres(prev => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  };

  const handleSave = async () => {
    const libelles = criteres.map(c => c.libelle.trim()).filter(l => l !== '');
    if (libelles.length === 0) {
      setError('Veuillez ajouter au moins un critère.');
      return;
    }
    setSaving(true);
    setError('');
    try {
      await saveSessionCriteres(sessionId, jour, libelles);
      onSaved(); // refresh criteria in parent
      onClose();
    } catch {
      setError('Erreur lors de la sauvegarde des critères.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setError('');
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb: 1 }}>
        <Typography component="span" display="block" fontWeight={700}>
          Gérer les critères — Jour {jour}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Définissez les compétences évaluées pour ce jour de formation.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        {/* Warning when evaluations already exist */}
        {hasEvaluations && (
          <Alert
            severity="warning"
            icon={<WarningAmberIcon />}
            sx={{ mb: 2 }}
          >
            Des évaluations existent déjà pour ce jour. Modifier les critères recalculera
            les scores existants selon le nouvel ordre.
          </Alert>
        )}

        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
        )}

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {criteres.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                Aucun critère défini. Cliquez sur "Ajouter" pour commencer.
              </Typography>
            )}

            {criteres.map((c, idx) => (
              <Box
                key={idx}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 1,
                  mb: 1, p: 1, borderRadius: 1,
                  border: '1px solid', borderColor: 'divider',
                  bgcolor: 'background.default',
                }}
              >
                {/* Index badge */}
                <Typography
                  variant="caption" fontWeight={700}
                  sx={{
                    minWidth: 24, height: 24, borderRadius: '50%',
                    bgcolor: 'primary.main', color: '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  {idx + 1}
                </Typography>

                {/* Text input */}
                <TextField
                  fullWidth
                  size="small"
                  placeholder={`Critère ${idx + 1}...`}
                  value={c.libelle}
                  onChange={e => handleChange(idx, e.target.value)}
                  variant="outlined"
                />

                {/* Up / Down */}
                {/* TODO: replace with drag handle once @dnd-kit/sortable is added */}
                <Tooltip title="Monter">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveUp(idx)}
                      disabled={idx === 0}
                    >
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>
                <Tooltip title="Descendre">
                  <span>
                    <IconButton
                      size="small"
                      onClick={() => handleMoveDown(idx)}
                      disabled={idx === criteres.length - 1}
                    >
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span>
                </Tooltip>

                {/* Delete */}
                <Tooltip title="Supprimer">
                  <IconButton
                    size="small" color="error"
                    onClick={() => handleDelete(idx)}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </Tooltip>
              </Box>
            ))}

            <Divider sx={{ my: 1.5 }} />

            <Button
              startIcon={<AddIcon />}
              variant="outlined"
              size="small"
              onClick={handleAdd}
              fullWidth
            >
              Ajouter un critère
            </Button>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={handleClose} disabled={saving}>Annuler</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {saving ? 'Sauvegarde...' : 'Enregistrer les critères'}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
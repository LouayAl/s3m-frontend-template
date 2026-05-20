// views/equipment-manager/components/CritereManagerModal.jsx
import { useState, useEffect } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Box, Typography, Button, IconButton, TextField,
  Alert, CircularProgress, Divider, Tooltip, Chip,
} from '@mui/material';
import AddIcon           from '@mui/icons-material/Add';
import DeleteIcon        from '@mui/icons-material/Delete';
import ArrowUpwardIcon   from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import WarningAmberIcon  from '@mui/icons-material/WarningAmber';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import { getSessionCriteres, saveSessionCriteres } from '../../../api/emApi';

// ── Rebuild items list from loaded criteres ────────────────────────────────────
// Each critere has { id, libelle, categorie }.
// We reconstruct category header rows so they appear correctly on re-open.
function buildItems(rawCriteres) {
  const items = [];
  let lastCategorie = undefined; // undefined = "not started yet"

  for (const c of rawCriteres) {
    const cat = c.categorie ?? null; // null = no category

    // Insert a category header row when the category changes
    if (cat !== lastCategorie) {
      if (cat !== null) {
        // Real category name — insert a header row
        items.push({ type: 'category', id: null, libelle: cat, categorie: null });
      }
      lastCategorie = cat;
    }

    items.push({
      type:      'critere',
      id:        c.id,
      libelle:   c.libelle,
      categorie: cat,
    });
  }

  return items;
}

export default function CritereManagerModal({
  open, onClose, sessionId, jour, hasEvaluations, onSaved,
}) {
  const [items,   setItems]   = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState('');

  // ── Load on open ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open || !sessionId || !jour) return;
    setLoading(true);
    setError('');
    getSessionCriteres(sessionId, jour)
      .then(data => setItems(buildItems(data)))
      .catch(() => setError('Erreur lors du chargement des critères.'))
      .finally(() => setLoading(false));
  }, [open, sessionId, jour]);

  // ── Item handlers ─────────────────────────────────────────────────────────
  const handleAddCritere  = () =>
    setItems(prev => [...prev, { type:'critere',   id:null, libelle:'', categorie:'' }]);

  const handleAddCategory = () =>
    setItems(prev => [...prev, { type:'category',  id:null, libelle:'', categorie:null }]);

  const handleDelete = (idx) =>
    setItems(prev => prev.filter((_, i) => i !== idx));

  const handleChange = (idx, field, value) =>
    setItems(prev => prev.map((item, i) => i === idx ? { ...item, [field]: value } : item));

  const handleMoveUp = (idx) => {
    if (idx === 0) return;
    setItems(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };

  const handleMoveDown = (idx) => {
    setItems(prev => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });
  };

  // ── Save ──────────────────────────────────────────────────────────────────
  const handleSave = async () => {
    // Walk the items list, tracking the current category heading.
    // Build a flat array of { libelle, categorie } for the backend.
    let currentCategory = null;
    const criteres = [];

    for (const item of items) {
      if (item.type === 'category') {
        currentCategory = item.libelle.trim() || null;
      } else {
        const libelle = item.libelle.trim();
        if (libelle) {
          criteres.push({ libelle, categorie: currentCategory });
        }
      }
    }

    if (criteres.length === 0) {
      setError('Veuillez ajouter au moins un critère.');
      return;
    }

    setSaving(true);
    setError('');
    try {
      // Pass the full criteres array — emApi must forward { libelle, categorie } pairs
      await saveSessionCriteres(sessionId, jour, criteres);
      onSaved();
      onClose();
    } catch {
      setError('Erreur lors de la sauvegarde des critères.');
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => { setError(''); onClose(); };

  const critereCount = items.filter(i => i.type === 'critere' && i.libelle.trim()).length;

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ pb:1 }}>
        <Typography component="span" display="block" fontWeight={700}>
          Gérer les critères — Jour {jour}
        </Typography>
        <Typography variant="caption" color="text.secondary">
          Définissez les compétences évaluées pour ce jour de formation.
        </Typography>
      </DialogTitle>

      <DialogContent dividers>
        <Alert severity="info" sx={{ mb:2 }}>
          Les critères enregistrés ici seront appliqués à tous les jours de cette session.
          Les catégories servent uniquement à organiser l'affichage.
        </Alert>

        {hasEvaluations && (
          <Alert severity="warning" icon={<WarningAmberIcon />} sx={{ mb:2 }}>
            Des évaluations existent déjà pour ce jour. Modifier les critères recalculera
            les scores existants selon le nouvel ordre.
          </Alert>
        )}

        {error && <Alert severity="error" sx={{ mb:2 }}>{error}</Alert>}

        {loading ? (
          <Box sx={{ display:'flex', justifyContent:'center', py:4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <Box>
            {items.length === 0 && (
              <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                Aucun critère défini. Cliquez sur "Ajouter" pour commencer.
              </Typography>
            )}

            {items.map((item, idx) =>
              item.type === 'category' ? (
                // ── Category header row ──────────────────────────────────────
                <Box key={idx} sx={{
                  display:'flex', alignItems:'center', gap:1,
                  mb:1, mt: idx > 0 ? 1.5 : 0, p:1, borderRadius:1,
                  border:'1px dashed', borderColor:'warning.main',
                  bgcolor:'rgba(255,152,0,0.06)',
                }}>
                  <LabelOutlinedIcon sx={{ color:'warning.main', fontSize:18, flexShrink:0 }} />
                  <TextField
                    fullWidth size="small"
                    placeholder="Nom de la catégorie..."
                    value={item.libelle}
                    onChange={e => handleChange(idx, 'libelle', e.target.value)}
                    sx={{ '& .MuiInputBase-input':{ fontWeight:700, fontSize:13 } }}
                  />
                  <Chip label="Catégorie" size="small" color="warning" variant="outlined"
                    sx={{ flexShrink:0, fontSize:10 }} />
                  <Tooltip title="Monter"><span>
                    <IconButton size="small" onClick={() => handleMoveUp(idx)} disabled={idx === 0}>
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span></Tooltip>
                  <Tooltip title="Descendre"><span>
                    <IconButton size="small" onClick={() => handleMoveDown(idx)} disabled={idx === items.length - 1}>
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span></Tooltip>
                  <Tooltip title="Supprimer la catégorie">
                    <IconButton size="small" color="error" onClick={() => handleDelete(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              ) : (
                // ── Critere row ──────────────────────────────────────────────
                <Box key={idx} sx={{
                  display:'flex', alignItems:'center', gap:1,
                  mb:1, p:1, borderRadius:1,
                  border:'1px solid', borderColor:'divider',
                  bgcolor:'background.default',
                  ml: items.slice(0, idx).some(i => i.type === 'category') ? 2 : 0,
                }}>
                  <Typography variant="caption" fontWeight={700} sx={{
                    minWidth:24, height:24, borderRadius:'50%',
                    bgcolor:'primary.main', color:'#fff',
                    display:'flex', alignItems:'center', justifyContent:'center',
                    flexShrink:0, fontSize:11,
                  }}>
                    {items.slice(0, idx + 1).filter(i => i.type === 'critere').length}
                  </Typography>

                  <TextField
                    fullWidth size="small"
                    placeholder="Critère..."
                    value={item.libelle}
                    onChange={e => handleChange(idx, 'libelle', e.target.value)}
                  />

                  <Tooltip title="Monter"><span>
                    <IconButton size="small" onClick={() => handleMoveUp(idx)} disabled={idx === 0}>
                      <ArrowUpwardIcon fontSize="small" />
                    </IconButton>
                  </span></Tooltip>
                  <Tooltip title="Descendre"><span>
                    <IconButton size="small" onClick={() => handleMoveDown(idx)} disabled={idx === items.length - 1}>
                      <ArrowDownwardIcon fontSize="small" />
                    </IconButton>
                  </span></Tooltip>
                  <Tooltip title="Supprimer">
                    <IconButton size="small" color="error" onClick={() => handleDelete(idx)}>
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              )
            )}

            <Divider sx={{ my:1.5 }} />

            <Box sx={{ display:'flex', gap:1 }}>
              <Button startIcon={<AddIcon />} variant="outlined" size="small"
                onClick={handleAddCritere} sx={{ flex:1 }}>
                Ajouter un critère
              </Button>
              <Button startIcon={<LabelOutlinedIcon />} variant="outlined" size="small"
                color="warning" onClick={handleAddCategory} sx={{ flex:1 }}>
                Ajouter une catégorie
              </Button>
            </Box>
          </Box>
        )}
      </DialogContent>

      <DialogActions sx={{ px:3, py:2 }}>
        <Button onClick={handleClose} disabled={saving}>Annuler</Button>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || loading || critereCount === 0}
          startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
        >
          {saving ? 'Sauvegarde...' : `Enregistrer (${critereCount} critère${critereCount > 1 ? 's' : ''})`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
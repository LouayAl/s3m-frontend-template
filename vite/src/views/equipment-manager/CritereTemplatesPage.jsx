// frontend-template/vite/src/views/equipment-manager/CritereTemplatesPage.jsx
import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, IconButton, TextField,
  Alert, CircularProgress, Divider, Tooltip, Chip, Tabs, Tab,
  ToggleButtonGroup, ToggleButton, MenuItem, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from '@mui/material';
import AddIcon           from '@mui/icons-material/Add';
import DeleteIcon        from '@mui/icons-material/Delete';
import ArrowUpwardIcon   from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import LabelOutlinedIcon from '@mui/icons-material/LabelOutlined';
import {
  listCritereTemplates, createCritereTemplate, deleteCritereTemplate,
  getCritereTemplateEntries, saveCritereTemplateEntries,
} from '../../api/emApi';

function buildItems(rawEntries) {
  const items = [];
  let lastCategorie = undefined;
  for (const c of rawEntries) {
    const cat = c.categorie ?? null;
    if (cat !== lastCategorie) {
      if (cat !== null) items.push({ type: 'category', libelle: cat, categorie: null });
      lastCategorie = cat;
    }
    items.push({ type: 'critere', libelle: c.libelle, categorie: cat });
  }
  return items;
}

export default function CritereTemplatesPage() {
  const [sessionType, setSessionType] = useState('UPSKILLING');
  const [templates, setTemplates]     = useState([]);
  const [templatesLoading, setTemplatesLoading] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState('');

  const [activeDay, setActiveDay]   = useState(1);
  const [itemsByDay, setItemsByDay] = useState({});
  const [loading, setLoading]       = useState(false);
  const [saving, setSaving]         = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  const [newTemplateOpen, setNewTemplateOpen] = useState(false);
  const [newTemplateName, setNewTemplateName] = useState('');
  const [creating, setCreating] = useState(false);

  const [deleteTarget, setDeleteTarget] = useState(null);

  const currentDay = sessionType === 'UPSKILLING' ? 0 : activeDay;
  const items = itemsByDay[currentDay] ?? [];

  // ── Load templates when type changes ────────────────────────────────────────
  useEffect(() => {
    setTemplatesLoading(true);
    setSelectedTemplateId('');
    setItemsByDay({});
    setError('');
    setSuccess('');
    listCritereTemplates(sessionType)
      .then((list) => setTemplates(list))
      .catch(() => setTemplates([]))
      .finally(() => setTemplatesLoading(false));
  }, [sessionType]);

  // ── Load entries when a template is selected ────────────────────────────────
  useEffect(() => {
    if (!selectedTemplateId) { setItemsByDay({}); return; }
    setLoading(true);
    setError('');
    setSuccess('');
    getCritereTemplateEntries(selectedTemplateId)
      .then((data) => {
        if (sessionType === 'UPSKILLING') {
          setItemsByDay({ 0: buildItems(data) });
        } else {
          const grouped = {};
          data.forEach((e) => {
            if (!grouped[e.jour]) grouped[e.jour] = [];
            grouped[e.jour].push(e);
          });
          const byDay = {};
          Object.entries(grouped).forEach(([day, list]) => { byDay[day] = buildItems(list); });
          if (Object.keys(byDay).length === 0) byDay[1] = [];
          setItemsByDay(byDay);
          const firstDay = Object.keys(byDay).map(Number).sort((a, b) => a - b)[0] ?? 1;
          setActiveDay(firstDay);
        }
      })
      .catch(() => setError('Failed to load this template.'))
      .finally(() => setLoading(false));
  }, [selectedTemplateId, sessionType]);

  const setCurrentItems = (updater) => {
    setItemsByDay((prev) => ({
      ...prev,
      [currentDay]: typeof updater === 'function' ? updater(prev[currentDay] ?? []) : updater,
    }));
  };

  const handleAddCritere  = () => setCurrentItems((prev) => [...prev, { type: 'critere', libelle: '', categorie: '' }]);
  const handleAddCategory = () => setCurrentItems((prev) => [...prev, { type: 'category', libelle: '', categorie: null }]);
  const handleDelete   = (idx) => setCurrentItems((prev) => prev.filter((_, i) => i !== idx));
  const handleChange   = (idx, field, value) =>
    setCurrentItems((prev) => prev.map((item, i) => (i === idx ? { ...item, [field]: value } : item)));
  const handleMoveUp   = (idx) => {
    if (idx === 0) return;
    setCurrentItems((prev) => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      return next;
    });
  };
  const handleMoveDown = (idx) =>
    setCurrentItems((prev) => {
      if (idx === prev.length - 1) return prev;
      const next = [...prev];
      [next[idx + 1], next[idx]] = [next[idx], next[idx + 1]];
      return next;
    });

  const handleAddDay = () => {
    const days = Object.keys(itemsByDay).map(Number);
    const nextDay = days.length ? Math.max(...days) + 1 : 1;
    setItemsByDay((prev) => ({ ...prev, [nextDay]: [] }));
    setActiveDay(nextDay);
  };

  // ── Create a new template ───────────────────────────────────────────────────
  const handleCreateTemplate = async () => {
    if (!newTemplateName.trim()) return;
    setCreating(true);
    try {
      const created = await createCritereTemplate(newTemplateName.trim(), sessionType);
      setTemplates((prev) => [...prev, created].sort((a, b) => a.nom.localeCompare(b.nom)));
      setSelectedTemplateId(created.id);
      setNewTemplateOpen(false);
      setNewTemplateName('');
    } catch {
      setError('Failed to create the template.');
    } finally {
      setCreating(false);
    }
  };

  // ── Delete a template ────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteCritereTemplate(deleteTarget.id);
      setTemplates((prev) => prev.filter((t) => t.id !== deleteTarget.id));
      if (selectedTemplateId === deleteTarget.id) setSelectedTemplateId('');
    } catch {
      setError('Failed to delete the template.');
    } finally {
      setDeleteTarget(null);
    }
  };

  // ── Save entries for the selected template ──────────────────────────────────
  const handleSave = async () => {
    setError('');
    setSuccess('');

    const entries = [];
    Object.entries(itemsByDay).forEach(([day, dayItems]) => {
      let currentCategory = null;
      dayItems.forEach((item) => {
        if (item.type === 'category') {
          currentCategory = item.libelle.trim() || null;
        } else {
          const libelle = item.libelle.trim();
          if (libelle) {
            entries.push({
              jour: sessionType === 'UPSKILLING' ? null : Number(day),
              libelle,
              categorie: currentCategory,
            });
          }
        }
      });
    });

    if (entries.length === 0) {
      setError('Please add at least one criterion.');
      return;
    }

    setSaving(true);
    try {
      await saveCritereTemplateEntries(selectedTemplateId, entries);
      setSuccess('Template saved successfully.');
    } catch {
      setError('Failed to save the template.');
    } finally {
      setSaving(false);
    }
  };

  const dayTabs = Object.keys(itemsByDay).map(Number).sort((a, b) => a - b);
  const critereCount = items.filter((i) => i.type === 'critere' && i.libelle.trim()).length;

  return (
    <Box sx={{ maxWidth: 760, mx: 'auto', p: 3 }}>
      <Typography variant="h4" fontWeight={700} mb={1}>Evaluation Criteria Templates</Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Create named templates for Upskilling and Training sessions. When you create a session,
        you'll pick one of these by name — its questions get copied into the session automatically.
        Editing a template here never affects sessions that already used it.
      </Typography>

      <ToggleButtonGroup
        value={sessionType}
        exclusive
        onChange={(e, val) => val && setSessionType(val)}
        sx={{ mb: 3 }}
      >
        <ToggleButton value="UPSKILLING">Upskilling</ToggleButton>
        <ToggleButton value="TRAINING">Training</ToggleButton>
      </ToggleButtonGroup>

      {/* ── Template selector ──────────────────────────────────────────────── */}
      <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 3 }}>
        <TextField
          select
          size="small"
          label="Template"
          value={selectedTemplateId}
          onChange={(e) => setSelectedTemplateId(e.target.value)}
          disabled={templatesLoading}
          sx={{ minWidth: 280 }}
        >
          <MenuItem value=""><em>Select a template...</em></MenuItem>
          {templates.map((t) => (
            <MenuItem key={t.id} value={t.id}>{t.nom}</MenuItem>
          ))}
        </TextField>
        <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={() => setNewTemplateOpen(true)}>
          New template
        </Button>
        {selectedTemplateId && (
          <Button
            startIcon={<DeleteIcon />} variant="outlined" color="error" size="small"
            onClick={() => setDeleteTarget(templates.find((t) => t.id === selectedTemplateId))}
          >
            Delete
          </Button>
        )}
      </Box>

      {!selectedTemplateId && !templatesLoading && (
        <Alert severity="info">Select an existing template above, or create a new one to get started.</Alert>
      )}

      {selectedTemplateId && (
        <>
          {sessionType === 'UPSKILLING' && (
            <Alert severity="info" sx={{ mb: 2 }}>
              Upskilling: one set of questions, applied to every day of the session.
            </Alert>
          )}

          {sessionType === 'TRAINING' && (
            <>
              <Alert severity="info" sx={{ mb: 2 }}>
                Training: each day can have its own questions. Session days beyond what's defined
                here will stay empty and can be filled in manually.
              </Alert>
              <Tabs
                value={dayTabs.includes(activeDay) ? activeDay : false}
                onChange={(e, val) => setActiveDay(val)}
                sx={{ mb: 2 }}
              >
                {dayTabs.map((d) => (
                  <Tab key={d} value={d} label={`Day ${d}`} />
                ))}
              </Tabs>
              <Button size="small" startIcon={<AddIcon />} onClick={handleAddDay} sx={{ mb: 2 }}>
                Add a day
              </Button>
            </>
          )}

          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
          {success && <Alert severity="success" sx={{ mb: 2 }}>{success}</Alert>}

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <Box>
              {items.length === 0 && (
                <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                  No criteria defined yet. Click "Add criterion" to get started.
                </Typography>
              )}

              {items.map((item, idx) =>
                item.type === 'category' ? (
                  <Box key={idx} sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    mb: 1, mt: idx > 0 ? 1.5 : 0, p: 1, borderRadius: 1,
                    border: '1px dashed', borderColor: 'warning.main',
                    bgcolor: 'rgba(255,152,0,0.06)',
                  }}>
                    <LabelOutlinedIcon sx={{ color: 'warning.main', fontSize: 18, flexShrink: 0 }} />
                    <TextField
                      fullWidth size="small"
                      placeholder="Category name..."
                      value={item.libelle}
                      onChange={(e) => handleChange(idx, 'libelle', e.target.value)}
                      sx={{ '& .MuiInputBase-input': { fontWeight: 700, fontSize: 13 } }}
                    />
                    <Chip label="Category" size="small" color="warning" variant="outlined" sx={{ flexShrink: 0, fontSize: 10 }} />
                    <Tooltip title="Move up"><span>
                      <IconButton size="small" onClick={() => handleMoveUp(idx)} disabled={idx === 0}>
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                    </span></Tooltip>
                    <Tooltip title="Move down"><span>
                      <IconButton size="small" onClick={() => handleMoveDown(idx)} disabled={idx === items.length - 1}>
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </span></Tooltip>
                    <Tooltip title="Delete category">
                      <IconButton size="small" color="error" onClick={() => handleDelete(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                ) : (
                  <Box key={idx} sx={{
                    display: 'flex', alignItems: 'center', gap: 1,
                    mb: 1, p: 1, borderRadius: 1,
                    border: '1px solid', borderColor: 'divider',
                    bgcolor: 'background.default',
                    ml: items.slice(0, idx).some((i) => i.type === 'category') ? 2 : 0,
                  }}>
                    <Typography variant="caption" fontWeight={700} sx={{
                      minWidth: 24, height: 24, borderRadius: '50%',
                      bgcolor: 'primary.main', color: '#fff',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      flexShrink: 0, fontSize: 11,
                    }}>
                      {items.slice(0, idx + 1).filter((i) => i.type === 'critere').length}
                    </Typography>
                    <TextField
                      fullWidth size="small"
                      placeholder="Criterion..."
                      value={item.libelle}
                      onChange={(e) => handleChange(idx, 'libelle', e.target.value)}
                    />
                    <Tooltip title="Move up"><span>
                      <IconButton size="small" onClick={() => handleMoveUp(idx)} disabled={idx === 0}>
                        <ArrowUpwardIcon fontSize="small" />
                      </IconButton>
                    </span></Tooltip>
                    <Tooltip title="Move down"><span>
                      <IconButton size="small" onClick={() => handleMoveDown(idx)} disabled={idx === items.length - 1}>
                        <ArrowDownwardIcon fontSize="small" />
                      </IconButton>
                    </span></Tooltip>
                    <Tooltip title="Delete criterion">
                      <IconButton size="small" color="error" onClick={() => handleDelete(idx)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                )
              )}

              <Divider sx={{ my: 1.5 }} />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button startIcon={<AddIcon />} variant="outlined" size="small" onClick={handleAddCritere} sx={{ flex: 1 }}>
                  Add criterion
                </Button>
                <Button startIcon={<LabelOutlinedIcon />} variant="outlined" size="small" color="warning" onClick={handleAddCategory} sx={{ flex: 1 }}>
                  Add category
                </Button>
              </Box>

              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={saving || critereCount === 0}
                  startIcon={saving ? <CircularProgress size={16} color="inherit" /> : null}
                >
                  {saving ? 'Saving...' : `Save template (${critereCount} criterion${critereCount > 1 ? 's' : ''})`}
                </Button>
              </Box>
            </Box>
          )}
        </>
      )}

      {/* ── New template dialog ─────────────────────────────────────────────── */}
      <Dialog open={newTemplateOpen} onClose={() => setNewTemplateOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle>New {sessionType === 'UPSKILLING' ? 'Upskilling' : 'Training'} template</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus fullWidth
            label="Template name"
            placeholder="e.g. Forklift Safety Refresher"
            value={newTemplateName}
            onChange={(e) => setNewTemplateName(e.target.value)}
            sx={{ mt: 1 }}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setNewTemplateOpen(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreateTemplate}
            disabled={creating || !newTemplateName.trim()}
            startIcon={creating ? <CircularProgress size={16} color="inherit" /> : null}
          >
            {creating ? 'Creating...' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* ── Delete confirmation ──────────────────────────────────────────────── */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>Delete template</DialogTitle>
        <DialogContent>
          Are you sure you want to delete "{deleteTarget?.nom}"? This cannot be undone.
          Sessions that already used this template are not affected.
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)}>Cancel</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Delete</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
// frontend-template/vite/src/views/equipment-manager/components/EMParticipantsModal.jsx
//
// Drop-in replacement for ParticipantsModal in the EM branch.
// The ONLY difference: fetches employees via GET /api/em/employes
// (scoped to the logged-in user's entreprise) instead of GET /api/employes (all).
// Every other feature — search, select-all, Excel import, confirmation — is identical.
//

import { useEffect, useState, useMemo, useRef } from 'react';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Stack, CircularProgress,
  Chip, Typography, Checkbox, Alert, Tooltip,
} from '@mui/material';
import { DataGrid }     from '@mui/x-data-grid';
import UploadFileIcon   from '@mui/icons-material/UploadFile';
import * as XLSX        from 'xlsx';
import { getEmEmployes } from '../../../api/emApi';   // ← scoped endpoint

const EMParticipantsModal = ({
  open,
  onClose,
  onSelectParticipants,
  preSelectedParticipants = [],
  // employeesList prop still accepted for compatibility (e.g. pre-filtered lists passed by caller)
  employeesList = null,
}) => {
  const [employees,       setEmployees]       = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState('');
  const [selectedIds,     setSelectedIds]     = useState([]);
  const [importWarnings,  setImportWarnings]  = useState([]);
  const fileInputRef = useRef(null);

  const isSelected    = (id) => selectedIds.includes(id);
  const selectedCount = selectedIds.length;

  // ── Fetch scoped employees ────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return;

    if (employeesList) {
      // Caller passed a pre-filtered list — use it directly, no fetch needed
      setEmployees(employeesList);
      setLoading(false);
      return;
    }

    setLoading(true);
    getEmEmployes()                              // GET /api/em/employes — already scoped
      .then(data => setEmployees(data))
      .catch(err  => console.error('EMParticipantsModal: erreur chargement employés', err))
      .finally(()  => setLoading(false));
  }, [open]);

  // ── Pre-select ────────────────────────────────────────────────────────────
  useEffect(() => {
    const source = employeesList || employees;
    if (loading || source.length === 0) return;
    const validIds = (preSelectedParticipants || [])
      .map(p => Number(p.idEmploye))
      .filter(id => source.some(e => Number(e.idEmploye) === id));
    setSelectedIds(validIds);
  }, [loading, employees]);

  // ── Reset on close ────────────────────────────────────────────────────────
  useEffect(() => {
    if (!open) {
      setSearch('');
      setSelectedIds([]);
      setImportWarnings([]);
    }
  }, [open]);

  // ── Filtered rows ─────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => {
    const source = employeesList || employees;
    if (!search) return source;
    const kw = search.toLowerCase();
    return source.filter(emp =>
      emp.nom?.toLowerCase().includes(kw)       ||
      emp.prenom?.toLowerCase().includes(kw)    ||
      emp.cin?.toLowerCase().includes(kw)       ||
      emp.matricule?.toLowerCase().includes(kw)
    );
  }, [search, employees, employeesList]);

  const visibleIds     = useMemo(() => filteredRows.map(r => Number(r.idEmploye)), [filteredRows]);
  const allVisibleSel  = visibleIds.length > 0 && visibleIds.every(id => selectedIds.includes(id));
  const someVisibleSel = visibleIds.some(id => selectedIds.includes(id));

  const toggleRow = (id) =>
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );

  const toggleAllVisible = () => {
    if (allVisibleSel) {
      setSelectedIds(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      setSelectedIds(prev => [...new Set([...prev, ...visibleIds])]);
    }
  };

  // ── Excel import (match by matricule) ─────────────────────────────────────
  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb     = XLSX.read(evt.target.result, { type: 'binary' });
        const ws     = wb.Sheets[wb.SheetNames[0]];
        const rows   = XLSX.utils.sheet_to_json(ws, { header: 1 });
        const values = rows.flat().map(v => String(v ?? '').trim()).filter(Boolean);

        const source   = employeesList || employees;
        const matched  = [];
        const notFound = [];

        values.forEach(val => {
          const emp = source.find(
            e => String(e.cin ?? '').trim().toLowerCase() === val.toLowerCase()
          );
          if (emp) matched.push(Number(emp.idEmploye));
          else     notFound.push(val);
        });

        if (matched.length > 0) {
          setSelectedIds(prev => [...new Set([...prev, ...matched])]);
        }
        setImportWarnings(notFound);
      } catch (err) {
        console.error('Erreur lecture Excel:', err);
      }
    };
    reader.readAsBinaryString(file);
  };

  // ── Confirm ───────────────────────────────────────────────────────────────
  const handleConfirm = () => {
    const source   = employeesList || employees;
    const selected = source.filter(e => selectedIds.includes(Number(e.idEmploye)));
    onSelectParticipants(selected);
    setSelectedIds([]);
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    {
      field: 'select', width: 58, sortable: false, disableColumnMenu: true,
      headerAlign: 'center', align: 'center',
      renderHeader: () => (
        <Checkbox
          size="small"
          checked={allVisibleSel}
          indeterminate={!allVisibleSel && someVisibleSel}
          onChange={toggleAllVisible}
        />
      ),
      renderCell: (params) => (
        <Checkbox
          size="small"
          checked={isSelected(Number(params.row.idEmploye))}
          onChange={() => toggleRow(Number(params.row.idEmploye))}
        />
      ),
    },
    { field: 'nom',       headerName: 'Nom',       flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
    { field: 'prenom',    headerName: 'Prénom',    flex: 1, minWidth: 120, headerAlign: 'center', align: 'center' },
    { field: 'cin',       headerName: 'CIN',       width: 120, headerAlign: 'center', align: 'center' },
    { field: 'matricule', headerName: 'Matricule', width: 130, headerAlign: 'center', align: 'center' },
  ], [allVisibleSel, someVisibleSel, selectedIds]);

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <span>Choisir des Participants</span>
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedCount > 0 && (
              <Chip
                label={`${selectedCount} sélectionné(s)`}
                color="primary"
                size="small"
                onDelete={() => setSelectedIds([])}
              />
            )}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: 'none' }}
              onChange={handleImportExcel}
            />
            <Tooltip title="Importer des CIN depuis un fichier Excel. Les participants correspondants seront auto-sélectionnés.">
              <Button
                size="small"
                variant="outlined"
                startIcon={<UploadFileIcon />}
                onClick={() => fileInputRef.current?.click()}
                disabled={loading}
              >
                Importer Excel
              </Button>
            </Tooltip>
          </Stack>
        </Stack>
      </DialogTitle>

      <DialogContent>
        {/* Import warnings */}
        {importWarnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setImportWarnings([])}>
            CIN non trouvés : <strong>{importWarnings.join(', ')}</strong>
          </Alert>
        )}

        <Box mb={2}>
          <TextField
            fullWidth
            label="Rechercher par nom, prénom, CIN ou matricule"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {search && selectedCount > 0 && (
            <Typography variant="caption" color="text.secondary" sx={{ mt: 0.5, display: 'block' }}>
              {selectedCount} participant(s) sélectionné(s) au total, même hors de la recherche.
            </Typography>
          )}
        </Box>

        {loading ? (
          <Stack alignItems="center" py={3}><CircularProgress /></Stack>
        ) : (
          <Box sx={{ height: '60vh' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={row => Number(row.idEmploye)}
              pageSizeOptions={[10, 20, 50, 100]}
              disableRowSelectionOnClick
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button
          variant="contained"
          color="primary"
          onClick={handleConfirm}
          disabled={selectedCount === 0}
        >
          Confirmer ({selectedCount})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EMParticipantsModal;

// frontend-template/vite/src/views/sessions/ParticipantsModal.jsx
import { useEffect, useState, useMemo, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Box, Stack, CircularProgress,
  Chip, Typography, Checkbox, Alert, Tooltip, MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import * as XLSX from "xlsx";
import { getAllEmployes } from "../../api/employeApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import { useAuth } from "../../contexts/auth/AuthContext";

const ParticipantsModal = ({
  open, onClose, onSelectParticipants,
  preSelectedParticipants = [], employeesList = null,
  // The entreprise the session belongs to. When provided, only employees from
  // this entreprise can actually be added — everyone else is shown (so the
  // admin isn't confused about why a same-named employee is missing) but
  // greyed out and unselectable, since a session can't mix participants from
  // different entreprises.
  sessionEntrepriseId = null,
}) => {
  const { user } = useAuth();
  const isAdmin  = user?.role === "ADMIN";

  // Whether this modal fetches its own employee list, vs. receiving one from
  // a parent (e.g. SessionParticipantsPanel, which pre-excludes already-added
  // participants). Only affects whether we hit the network — filtering by
  // entreprise works client-side either way, since entreprise info travels
  // with each employee record regardless of who fetched it.
  const selfFetching = !employeesList;

  const [employees, setEmployees] = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const [importWarnings, setImportWarnings] = useState([]); // CIN values not found
  const [confirmError, setConfirmError] = useState("");     // entreprise-mismatch guard on confirm
  const fileInputRef = useRef(null);

  // Admin-only: entreprise filter dropdown
  const [entreprises,        setEntreprises]        = useState([]);
  const [filterEntrepriseId, setFilterEntrepriseId] = useState(""); // '' = all

  const isSelected    = (id) => selectedIds.includes(id);
  const selectedCount = selectedIds.length;

  // Load entreprises for the admin dropdown
  useEffect(() => {
    if (!open || !isAdmin) return;
    getAllEntreprises().then(setEntreprises).catch(() => {});
  }, [open, isAdmin]);

  // Fetch (only when self-fetching — otherwise we use the given employeesList as-is)
  useEffect(() => {
    if (!open) return;
    if (employeesList) { setEmployees(employeesList); setLoading(false); }
    else {
      setLoading(true);
      getAllEmployes(isAdmin ? (filterEntrepriseId || null) : undefined)
        .then(data => setEmployees(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filterEntrepriseId]);

  // Pre-select
  useEffect(() => {
    const source = employeesList || employees;
    if (loading || source.length === 0) return;
    const validIds = (preSelectedParticipants || [])
      .map(p => Number(p.idEmploye))
      .filter(id => source.some(e => Number(e.idEmploye) === id));
    setSelectedIds(validIds);
  }, [loading, employees]);

  // Reset on open/close — default the entreprise filter to the session's own
  // entreprise when we know it, so the admin sees the relevant employees first.
  useEffect(() => {
    if (!open) { setSearch(""); setSelectedIds([]); setImportWarnings([]); setConfirmError(""); return; }
    setFilterEntrepriseId(sessionEntrepriseId != null ? String(sessionEntrepriseId) : "");
  }, [open, sessionEntrepriseId]);

  // Filtered rows: entreprise filter (client-side, works regardless of data source) + search
  const filteredRows = useMemo(() => {
    const source = employeesList || employees;
    let rows = source;

    if (isAdmin && filterEntrepriseId) {
      rows = rows.filter(e => Number(e.entrepriseId) === Number(filterEntrepriseId));
    }

    if (search) {
      const kw = search.toLowerCase();
      rows = rows.filter(emp =>
        emp.nom?.toLowerCase().includes(kw) ||
        emp.prenom?.toLowerCase().includes(kw) ||
        emp.cin?.toLowerCase().includes(kw) ||
        emp.matricule?.toLowerCase().includes(kw)
      );
    }

    return rows;
  }, [search, employees, employeesList, isAdmin, filterEntrepriseId]);

  const isMismatched = (emp) =>
    sessionEntrepriseId != null &&
    emp?.entrepriseId != null &&
    Number(emp.entrepriseId) !== Number(sessionEntrepriseId);

  const visibleIds           = useMemo(() => filteredRows.map(r => Number(r.idEmploye)), [filteredRows]);
  // Only rows matching the session's entreprise (or all, if no session entreprise is known yet)
  // count toward "select all" — mismatched rows are never selectable.
  const selectableVisibleIds = useMemo(
    () => filteredRows.filter(r => !isMismatched(r)).map(r => Number(r.idEmploye)),
    [filteredRows, sessionEntrepriseId]
  );
  const allVisibleSel  = selectableVisibleIds.length > 0 && selectableVisibleIds.every(id => selectedIds.includes(id));
  const someVisibleSel = selectableVisibleIds.some(id => selectedIds.includes(id));

  const toggleRow = (id) => {
    const source = employeesList || employees;
    const emp = source.find(e => Number(e.idEmploye) === id);
    if (isMismatched(emp)) return; // guard against any programmatic bypass
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const toggleAllVisible = () => {
    if (allVisibleSel) setSelectedIds(prev => prev.filter(id => !selectableVisibleIds.includes(id)));
    else setSelectedIds(prev => [...new Set([...prev, ...selectableVisibleIds])]);
  };

  // Excel import
  const handleImportExcel = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = ""; // reset so same file can be re-imported

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb   = XLSX.read(evt.target.result, { type: "binary" });
        const ws   = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(ws, { header: 1 });

        // Collect all cell values that look like CIN values (non-empty strings/numbers)
        const allValues = rows.flat().map(v => String(v ?? "").trim()).filter(Boolean);

        const source = employeesList || employees;

        const matched         = [];
        const notFound        = [];
        const wrongEntreprise = [];

        allValues.forEach(val => {
          const emp = source.find(
            e => String(e.cin ?? "").trim().toLowerCase() === val.toLowerCase()
          );
          if (!emp) { notFound.push(val); return; }
          if (isMismatched(emp)) { wrongEntreprise.push(`${emp.nom} ${emp.prenom} (CIN ${val})`); return; }
          matched.push(Number(emp.idEmploye));
        });

        if (matched.length > 0) {
          setSelectedIds(prev => [...new Set([...prev, ...matched])]);
        }

        setImportWarnings([
          ...notFound,
          ...wrongEntreprise.map(label => `${label} — entreprise différente de la session`),
        ]);
      } catch (err) {
        console.error("Erreur lecture Excel:", err);
      }
    };
    reader.readAsBinaryString(file);
  };

  const handleConfirm = () => {
    const source = employeesList || employees;
    const selected = source.filter(e => selectedIds.includes(Number(e.idEmploye)));

    // Defense in depth: checkboxes are already disabled for mismatched
    // employees, but double-check before confirming.
    const invalid = selected.filter(isMismatched);
    if (invalid.length > 0) {
      setConfirmError(
        `${invalid.length} participant(s) sélectionné(s) n'appartiennent pas à l'entreprise de cette session : ` +
        invalid.map(e => `${e.nom} ${e.prenom}`).join(", ") +
        ". Retirez-les avant de confirmer."
      );
      return;
    }

    onSelectParticipants(selected);
    setSelectedIds([]);
  };

  const columns = useMemo(() => [
    {
      field: "select", width: 58, sortable: false, disableColumnMenu: true,
      headerAlign: "center", align: "center",
      renderHeader: () => (
        <Checkbox size="small" checked={allVisibleSel}
          indeterminate={!allVisibleSel && someVisibleSel}
          onChange={toggleAllVisible} />
      ),
      renderCell: (params) => {
        const mismatched = isMismatched(params.row);
        const checkbox = (
          <Checkbox size="small"
            checked={isSelected(Number(params.row.idEmploye))}
            onChange={() => toggleRow(Number(params.row.idEmploye))}
            disabled={mismatched}
          />
        );
        return mismatched ? (
          <Tooltip title="Cet employé appartient à une autre entreprise que la session — il ne peut pas être ajouté.">
            <span>{checkbox}</span>
          </Tooltip>
        ) : checkbox;
      },
    },
    { field: "nom",       headerName: "Nom",       flex: 1, minWidth: 120, headerAlign: "center", align: "center" },
    { field: "prenom",    headerName: "Prenom",    flex: 1, minWidth: 120, headerAlign: "center", align: "center" },
    // Entreprise column only makes sense once an admin can browse across companies
    ...(isAdmin
      ? [{ field: "entrepriseNom", headerName: "Entreprise", flex: 1, minWidth: 140, headerAlign: "center", align: "center" }]
      : []),
    { field: "cin",       headerName: "CIN",       width: 120, headerAlign: "center", align: "center" },
    { field: "matricule", headerName: "Matricule", width: 130, headerAlign: "center", align: "center" },
  ], [allVisibleSel, someVisibleSel, selectedIds, isAdmin, sessionEntrepriseId]);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>
        <Stack direction="row" alignItems="center" justifyContent="space-between" flexWrap="wrap" gap={1}>
          <span>Choisir des Participants</span>
          <Stack direction="row" spacing={1} alignItems="center">
            {selectedCount > 0 && (
              <Chip label={`${selectedCount} selectionne(s)`} color="primary" size="small" />
            )}
            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              style={{ display: "none" }}
              onChange={handleImportExcel}
            />
            <Tooltip title="Importer des CIN depuis un fichier Excel (.xlsx). Les participants correspondants seront auto-selectionnés.">
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
        {/* Entreprise restriction reminder */}
        {sessionEntrepriseId != null && (
          <Alert severity="info" sx={{ mb: 2 }}>
            Seuls les employés de l'entreprise de cette session peuvent être ajoutés.
            Les employés d'une autre entreprise apparaissent grisés.
          </Alert>
        )}

        {/* Confirm-time mismatch guard */}
        {confirmError && (
          <Alert severity="error" sx={{ mb: 2 }} onClose={() => setConfirmError("")}>
            {confirmError}
          </Alert>
        )}

        {/* Import warnings */}
        {importWarnings.length > 0 && (
          <Alert severity="warning" sx={{ mb: 2 }} onClose={() => setImportWarnings([])}>
            Problèmes détectés lors de l'import :{" "}
            <strong>{importWarnings.join(", ")}</strong>
          </Alert>
        )}

        <Box mb={2} display="flex" gap={2} flexWrap="wrap">
          <TextField
            sx={{ flex: 1, minWidth: 240 }}
            label="Rechercher par nom, prenom, CIN ou matricule"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />

          {/* Entreprise dropdown — ADMIN only */}
          {isAdmin && (
            <TextField
              select
              sx={{ minWidth: 220 }}
              label="Filtrer par entreprise"
              value={filterEntrepriseId}
              onChange={e => setFilterEntrepriseId(e.target.value)}
            >
              <MenuItem value=""><em>Toutes les entreprises</em></MenuItem>
              {entreprises.map(ent => (
                <MenuItem key={ent.idEntreprise} value={ent.idEntreprise}>
                  {ent.nomEntreprise}
                </MenuItem>
              ))}
            </TextField>
          )}
        </Box>
        {search && selectedCount > 0 && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: -1.5, mb: 1.5, display: "block" }}>
            {selectedCount} participant(s) selectionne(s) au total, meme hors de la recherche.
          </Typography>
        )}

        {loading ? (
          <Stack alignItems="center" py={3}><CircularProgress /></Stack>
        ) : (
          <Box sx={{ height: "60vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={row => Number(row.idEmploye)}
              pageSizeOptions={[10, 20, 50, 100]}
              disableRowSelectionOnClick
              getRowClassName={(params) => isMismatched(params.row) ? "row-entreprise-mismatch" : ""}
              sx={{
                "& .row-entreprise-mismatch": {
                  opacity: 0.5,
                },
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" color="primary"
          onClick={handleConfirm} disabled={selectedCount === 0}>
          Confirmer ({selectedCount})
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParticipantsModal;
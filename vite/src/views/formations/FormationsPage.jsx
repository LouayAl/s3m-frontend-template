// frontend-template/vite/src/views/formations/FormationsPage.jsx
import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Stack, IconButton, MenuItem,
  Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import FormationsModal from "./FormationsModal";
import { getAllFormations, deleteFormation, importFormations } from "../../api/formationApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import { useAuth } from "../../contexts/auth/AuthContext";
import { useGlobalFilter } from "../../contexts/filters/GlobalFilterContext";

const importButtonSx = { backgroundColor: "#4CAF50", "&:hover": { backgroundColor: "#43A047" } };
const exportButtonSx = { backgroundColor: "#ff5e00", "&:hover": { backgroundColor: "#ff3c00" } };

// Roles that can mutate data
const CAN_MUTATE = new Set(["ADMIN", "MANAGER", "EQUIPMENT_MANAGER"]);

const FormationsPage = () => {
  const { user } = useAuth();
  const canEdit = CAN_MUTATE.has(user?.role);   // false for VISITOR, TRAINER, etc.
  const isAdmin = user?.role === "ADMIN";

  const [formations,        setFormations]        = useState([]);
  const [loading,           setLoading]           = useState(true);
  const [search,            setSearch]            = useState("");

  // Admin-only: entreprise filter dropdown
  const [entreprises,        setEntreprises]        = useState([]);
  const { selectedEntrepriseId: filterEntrepriseId, setSelectedEntrepriseId: setFilterEntrepriseId } = useGlobalFilter();
  const [modalOpen,         setModalOpen]         = useState(false);
  const [editingFormation,  setEditingFormation]  = useState(null);

  const [openDeleteDialog,  setOpenDeleteDialog]  = useState(false);
  const [selectedFormationId, setSelectedFormationId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar        = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // ── Load entreprises for admin dropdown ──────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    getAllEntreprises('CLIENT')
      .then(setEntreprises)
      .catch(() => showSnackbar("Erreur chargement entreprises", "error"));
  }, [isAdmin]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  // For non-admins: backend enforces their own entreprise via JWT — no param sent.
  // For admins: pass filterEntrepriseId (null/'' = every formation in the DB).
  useEffect(() => { fetchFormations(); }, [filterEntrepriseId, isAdmin]);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const data = await getAllFormations(isAdmin ? (filterEntrepriseId || null) : undefined);
      setFormations(data);
    } catch {
      showSnackbar("Erreur lors du chargement des formations.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Modal ─────────────────────────────────────────────────────────────────
  const handleModalOpen  = (formation = null) => { setEditingFormation(formation); setModalOpen(true); };
  const handleModalClose = () => { setEditingFormation(null); setModalOpen(false); };

  const handleSave = async () => {
    // Reload because an admin may have moved the formation outside the active company filter.
    await fetchFormations();
    handleModalClose();
  };

  // ── Import / Export ───────────────────────────────────────────────────────
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const res = await importFormations(file);
      showSnackbar(res?.data || "Import Excel terminé avec succès !", "success");
      await fetchFormations();
    } catch (err) {
      showSnackbar(err.response?.data?.message || err.response?.data || "Erreur import Excel", "error");
    } finally {
      e.target.value = "";
    }
  };

  const handleExportExcel = () => {
    if (!formations.length) { showSnackbar("Aucune formation à exporter.", "warning"); return; }
    const data = formations.map(f => ({
      "Module":          f.module,
      "Entreprise":      f.entrepriseNom,
      "Famille":         f.familleFormation,
      "Type":            f.typeFormation,
      "Sous-famille":    f.sousFamille,
      "Interne/Externe": f.interneExterne,
      "Référence":       f.referenceFormation,
      "Année":           f.annee,
      "Durée (h)":       f.dureeHeures,
      "Durée (j)":       f.dureeJours,
      "Prix / h (MAD)":  f.prixHeureMad,
      "Prix / j (MAD)":  f.prixJourMad,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Formations");
    const today = new Date().toISOString().split("T")[0];
    saveAs(
      new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })],
        { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `Export_Formations_${today}.xlsx`
    );
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleOpenDeleteDialog  = (id) => { setSelectedFormationId(id); setOpenDeleteDialog(true); };
  const handleCloseDeleteDialog = () => { setOpenDeleteDialog(false); setSelectedFormationId(null); };

  const confirmDelete = async () => {
    try {
      await deleteFormation(selectedFormationId);
      setFormations(prev => prev.filter(f => f.id !== selectedFormationId));
      showSnackbar("Formation supprimée avec succès !");
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Impossible de supprimer cette formation.", "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const baseColumns = [
    { field: "module",             headerName: "Module",          flex: 1, minWidth: 160 },
    // Entreprise column only makes sense once an admin can see formations from several companies
    ...(isAdmin ? [{ field: "entrepriseNom", headerName: "Entreprise", flex: 1, minWidth: 150 }] : []),
    { field: "familleFormation",   headerName: "Famille",         flex: 1, minWidth: 120 },
    { field: "typeFormation",      headerName: "Type",            flex: 1, minWidth: 120 },
    { field: "sousFamille",        headerName: "Sous-famille",    flex: 1, minWidth: 120 },
    { field: "interneExterne",     headerName: "Interne/Externe", flex: 1, minWidth: 140 },
    { field: "referenceFormation", headerName: "Référence",       flex: 1, minWidth: 120 },
    { field: "annee",              headerName: "Année",           width: 100 },
    { field: "dureeHeures",        headerName: "Durée (h)",       width: 120 },
    { field: "dureeJours",         headerName: "Durée (j)",       width: 120 },
    { field: "prixHeureMad",       headerName: "Prix / h (MAD)",  width: 140 },
    { field: "prixJourMad",        headerName: "Prix / j (MAD)",  width: 140 },
  ];

  const actionsColumn = {
    field: "actions", headerName: "Actions", width: 120, sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton color="primary" size="small" onClick={() => handleModalOpen(params.row)}>
          <EditIcon />
        </IconButton>
        <IconButton color="error" size="small" onClick={() => handleOpenDeleteDialog(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  };

  // Only add actions column for users who can mutate
  const columns = canEdit ? [...baseColumns, actionsColumn] : baseColumns;

  const filteredRows = formations.filter(f =>
    f.module?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Catalogue des Formations</Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid size={{ xs: 12, md: isAdmin ? 4 : 6 }}>
              <TextField
                fullWidth
                label="Rechercher par module"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>

            {/* Entreprise dropdown — ADMIN only */}
            {isAdmin && (
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select fullWidth
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
              </Grid>
            )}

            <Grid size={{ xs: 12, md: isAdmin ? 5 : 6 }}
              sx={{ display: "flex", justifyContent: "flex-start", gap: 1, flexWrap: "wrap" }}>

              {/* Create — mutators only */}
              {canEdit && (
                <Button variant="contained" color="primary" onClick={() => handleModalOpen()}>
                  Créer Formation
                </Button>
              )}

              {/* Import — mutators only */}
              {canEdit && (
                <Button variant="contained" component="label" sx={importButtonSx}>
                  Importer Excel
                  <input type="file" hidden accept=".xlsx,.xls" onChange={handleImportExcel} />
                </Button>
              )}

              {/* Export — everyone can export */}
              <Button variant="contained" sx={exportButtonSx} onClick={handleExportExcel}>
                Export Excel
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={row => row.id}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Modal — only rendered when canEdit to prevent any bypass */}
      {canEdit && (
        <FormationsModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
          showSnackbar={showSnackbar}
          initialData={editingFormation}
          entreprises={entreprises}
          allowEntrepriseSelection={isAdmin}
        />
      )}

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default FormationsPage;

// frontend-template/vite/src/views/employes/EmployesPage.jsx
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Stack, IconButton,
  Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions,
  Button, MenuItem,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import EmployeModal from "./EmployesModal";
import { getEmployesPaginated, deleteEmploye, importEmployes } from "../../api/employeApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import { useAuth } from "../../contexts/auth/AuthContext";

const importButtonSx = { backgroundColor: "#4CAF50", "&:hover": { backgroundColor: "#43A047" } };
const exportButtonSx = { backgroundColor: "#ff5e00", "&:hover": { backgroundColor: "#ff3c00" } };

const EmployesPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";

  const [employes,        setEmployes]        = useState([]);
  const [loading,         setLoading]         = useState(true);
  const [search,          setSearch]          = useState("");
  const [sortModel, setSortModel] = useState([{ field: "nom", sort: "asc" }]);
  const [paginationModel, setPaginationModel] = useState({ pageSize: 20, page: 0 });
  const [totalEmployes,   setTotalEmployes]   = useState(0);

  // Admin-only: entreprise filter dropdown
  const [entreprises,        setEntreprises]        = useState([]);
  const [filterEntrepriseId, setFilterEntrepriseId] = useState('');  // '' = all

  const [modalOpen,      setModalOpen]      = useState(false);
  const [editingEmploye, setEditingEmploye] = useState(null);

  const [openDeleteDialog,  setOpenDeleteDialog]  = useState(false);
  const [selectedEmployeId, setSelectedEmployeId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar        = (msg, sev = "success") => setSnackbar({ open: true, message: msg, severity: sev });
  const handleCloseSnackbar = () => setSnackbar(p => ({ ...p, open: false }));

  const isMountedRef          = useRef(false);
  const pendingPaginationRef  = useRef(null);
  const pendingSortRef        = useRef(null);

  // ── Load entreprises for admin dropdown ──────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    getAllEntreprises()
      .then(setEntreprises)
      .catch(() => showSnackbar("Erreur chargement entreprises", "error"));
  }, [isAdmin]);

  // ── Fetch employees ───────────────────────────────────────────────────────
  // For non-admins: backend enforces their own entreprise via JWT — no param needed.
  // For admins: pass filterEntrepriseId (null = all companies).
  const fetchEmployes = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const sortBy  = sortModel[0]?.field || "idEmploye";
      const sortDir = sortModel[0]?.sort === "asc" ? "asc" : "desc";
      const data = await getEmployesPaginated({
        page:         paginationModel.page,
        size:         paginationModel.pageSize,
        search:       search.trim(),
        sortBy,
        sortDir,
        // Only pass entrepriseId for ADMIN (scoping for others is done server-side via JWT)
        entrepriseId: isAdmin ? (filterEntrepriseId || null) : undefined,
      });
      setEmployes(data.content || []);
      setTotalEmployes(data.totalElements || 0);
    } catch {
      showSnackbar("Erreur lors du chargement des employés", "error");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [paginationModel, sortModel, search, isAdmin, filterEntrepriseId]);

  useEffect(() => { fetchEmployes(true); }, [fetchEmployes]);

  useEffect(() => {
    isMountedRef.current = true;
    if (pendingPaginationRef.current) { setPaginationModel(pendingPaginationRef.current); pendingPaginationRef.current = null; }
    if (pendingSortRef.current)       { setSortModel(pendingSortRef.current);              pendingSortRef.current = null;       }
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (modalOpen) return;
    const interval = setInterval(() => fetchEmployes(false), 30000);
    return () => clearInterval(interval);
  }, [modalOpen, fetchEmployes]);


  // ── Modal ─────────────────────────────────────────────────────────────────
  const handleModalOpen  = (employe = null) => { setEditingEmploye(employe); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setEditingEmploye(null); };

  const handleSaveFromModal = (saved) => {
    if (!saved) return;
    setEmployes(prev => {
      const idx = prev.findIndex(e => e.idEmploye === saved.idEmploye);
      if (idx >= 0) { const u = [...prev]; u[idx] = saved; return u; }
      return [saved, ...prev];
    });
    handleModalClose();
  };

  // ── Import / Export ───────────────────────────────────────────────────────
  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const msg = await importEmployes(file);
      showSnackbar(msg, "success");
      fetchEmployes(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Erreur import Excel.", "error");
    } finally { e.target.value = null; }
  };

  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const allData = await getEmployesPaginated({
        page: 0, size: 10000,
        search: search.trim(),
        entrepriseId: isAdmin ? (filterEntrepriseId || null) : undefined,
      });
      const rows = allData.content || [];
      if (!rows.length) { showSnackbar("Aucun employé à exporter.", "warning"); return; }
      const data = rows.map(e => ({
        "Entreprise": e.entrepriseNom, "Département": e.departementNom,
        "Nom": e.nom, "Prénom": e.prenom, "CSP": e.csp, "Genre": e.f_h,
        "CIN": e.cin, "CNSS": e.cnss, "Matricule": e.matricule,
        "Email": e.email, "Téléphone": e.telephone, "Fonction": e.fonction,
        "Type Contrat": e.typeContrat, "Date Embauche": e.dateEmbauche,
        "Date Naissance": e.dateNaissance,
      }));
      const ws = XLSX.utils.json_to_sheet(data);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Employés");
      const today = new Date().toISOString().split("T")[0];
      saveAs(
        new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })],
          { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        `Export_Employes_${today}.xlsx`
      );
      showSnackbar("Export réussi !", "success");
    } catch { showSnackbar("Erreur lors de l'export", "error"); }
    finally   { setLoading(false); }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleOpenDeleteDialog  = (id) => { setSelectedEmployeId(id);  setOpenDeleteDialog(true);  };
  const handleCloseDeleteDialog = ()   => { setSelectedEmployeId(null); setOpenDeleteDialog(false); };

  const handleDelete = async () => {
    try {
      await deleteEmploye(selectedEmployeId);
      showSnackbar("Employé supprimé avec succès !");
      setEmployes(prev => prev.filter(e => e.idEmploye !== selectedEmployeId));
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Impossible de supprimer l'employé.", "error");
    } finally { handleCloseDeleteDialog(); }
  };

  // ── Pagination + sort handlers ────────────────────────────────────────────
  const handlePaginationModelChange = useCallback((newModel) => {
    if (!isMountedRef.current) { pendingPaginationRef.current = newModel; return; }
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setPaginationModel(prev =>
        prev.page === newModel.page && prev.pageSize === newModel.pageSize ? prev : newModel
      );
    }, 0);
  }, []);

  const handleSortModelChange = useCallback((newModel) => {
    if (!isMountedRef.current) { pendingSortRef.current = newModel; return; }
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setSortModel(prev => {
        const n = newModel?.[0] || {}; const c = prev?.[0] || {};
        return n.field === c.field && n.sort === c.sort ? prev : newModel;
      });
    }, 0);
  }, []);

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = useMemo(() => [
    { field: "entrepriseNom",  headerName: "Entreprise",     flex: 1, minWidth: 150 },
    { field: "departementNom", headerName: "Département",    flex: 1, minWidth: 150 },
    { field: "nom",            headerName: "Nom",            flex: 1, minWidth: 150 },
    { field: "prenom",         headerName: "Prénom",         flex: 1, minWidth: 150 },
    { field: "csp",            headerName: "CSP",            flex: 1, minWidth: 120 },
    { field: "f_h",            headerName: "Genre",          flex: 0.7, minWidth: 80 },
    { field: "cin",            headerName: "CIN",            flex: 1, minWidth: 120 },
    { field: "cnss",           headerName: "CNSS",           flex: 1, minWidth: 120 },
    { field: "matricule",      headerName: "Matricule",      flex: 1, minWidth: 120 },
    { field: "email",          headerName: "Email",          flex: 1, minWidth: 200 },
    { field: "telephone",      headerName: "Téléphone",      flex: 1, minWidth: 150 },
    { field: "fonction",       headerName: "Fonction",       flex: 1, minWidth: 150 },
    { field: "typeContrat",    headerName: "Type Contrat",   flex: 1, minWidth: 120 },
    { field: "dateEmbauche",   headerName: "Date Embauche",  flex: 1, minWidth: 120 },
    { field: "dateNaissance",  headerName: "Date Naissance", flex: 1, minWidth: 120 },
  ], []);

  const actionsColumn = useMemo(() => ({
    field: "actions", headerName: "Actions", width: 120, sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton color="primary" size="small" onClick={() => handleModalOpen(params.row)}>
          <EditIcon />
        </IconButton>
        <IconButton color="error" size="small" onClick={() => handleOpenDeleteDialog(params.row.idEmploye)}>
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  }), []); // eslint-disable-line

  const columnsWithActions = useMemo(() =>
    isAdmin ? [...columns, actionsColumn] : columns,
  [columns, actionsColumn, isAdmin]);

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Liste des Employés</Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">

            {/* Text search */}
            <Grid size={{ xs: 12, md: isAdmin ? 3 : 6 }}>
              <TextField
                fullWidth
                label="Rechercher par nom, prénom, CIN ou matricule"
                value={search}
                onChange={e => {
                  setSearch(e.target.value);
                  setPaginationModel(prev => ({ ...prev, page: 0 }));
                }}
              />
            </Grid>

            {/* Entreprise dropdown — ADMIN only */}
            {isAdmin && (
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select fullWidth
                  label="Filtrer par entreprise"
                  value={filterEntrepriseId}
                  onChange={e => {
                    setFilterEntrepriseId(e.target.value);
                    setPaginationModel(prev => ({ ...prev, page: 0 }));
                  }}
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

            {/* Action buttons */}
            <Grid size={{ xs: 12, md: isAdmin ? 6 : 6 }}
              sx={{ display: "flex", justifyContent: "flex-start", gap: 1, flexWrap: "wrap" }}>
              {isAdmin && (
                <Button variant="contained" color="primary" onClick={() => handleModalOpen()}>
                  Créer Employé
                </Button>
              )}
              <Button variant="contained" component="label" sx={importButtonSx}>
                Importer Excel
                <input type="file" hidden accept=".xlsx,.xls" onChange={handleImportExcel} />
              </Button>
              <Button variant="contained" sx={exportButtonSx} onClick={handleExportExcel}>
                Export Excel
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ height: "70vh", width: "100%" }}>
            <DataGrid
              rows={employes}
              columns={columnsWithActions}
              getRowId={row => row.idEmploye}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              rowCount={totalEmployes}
              paginationMode="server"
              sortingMode="server"
              initialState={{
                columns: {
                  columnVisibilityModel: { email: false, telephone: false, fonction: false },
                },
              }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: false } }}
            />
          </Box>
        </CardContent>
      </Card>

      <EmployeModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSaveFromModal}
        showSnackbar={showSnackbar}
        initialData={editingEmploye}
      />

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployesPage;
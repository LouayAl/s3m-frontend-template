// frontend-template/vite/src/views/employes/EmployesPage.jsx
import { useEffect, useState, useCallback, useMemo } from "react";
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Stack, IconButton,
  Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button,
} from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import EmployeModal from "./EmployesModal";
import {
  getAllEmployes,
  deleteEmploye,
  importEmployes,
} from "../../api/employeApi";
import { useAuth } from "../../contexts/auth/AuthContext";

const importButtonSx = {
  backgroundColor: "#4CAF50",
  "&:hover": { backgroundColor: "#43A047" },
};

const exportButtonSx = {
  backgroundColor: "#ff5e00",
  "&:hover": { backgroundColor: "#ff3c00" },
};

const EmployesPage = () => {
  const { user } = useAuth();

  const [employes, setEmployes]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");
  const [sortModel, setSortModel] = useState([{ field: "idEmploye", sort: "desc" }]);

  const [modalOpen, setModalOpen]           = useState(false);
  const [editingEmploye, setEditingEmploye] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog]   = useState(false);
  const [selectedEmployeId, setSelectedEmployeId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar        = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const fetchEmployes = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const data = await getAllEmployes();
      setEmployes(data);
    } catch (err) {
      showSnackbar("Erreur lors du chargement des employés", "error");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchEmployes(true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (modalOpen) return;
    const interval = setInterval(() => fetchEmployes(false), 30000);
    return () => clearInterval(interval);
  }, [modalOpen, fetchEmployes]);

  const handleModalOpen  = (employe = null) => { setEditingEmploye(employe); setModalOpen(true); };
  const handleModalClose = () => { setModalOpen(false); setEditingEmploye(null); };

  const handleSaveFromModal = (savedEmploye) => {
    if (!savedEmploye) return;
    setEmployes(prev => {
      const index = prev.findIndex(e => e.idEmploye === savedEmploye.idEmploye);
      if (index >= 0) {
        const updated = [...prev];
        updated[index] = savedEmploye;
        return updated;
      }
      return [savedEmploye, ...prev];
    });
    handleModalClose();
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const message = await importEmployes(file);
      showSnackbar(message, "success");
      fetchEmployes(false);
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Erreur import Excel.", "error");
    } finally {
      e.target.value = null;
    }
  };

  const handleExportExcel = () => {
    if (!employes.length) { showSnackbar("Aucun employé à exporter.", "warning"); return; }
    const data = employes.map(e => ({
      "Entreprise":      e.entrepriseNom,
      "Département":     e.departementNom,
      "Nom":             e.nom,
      "Prénom":          e.prenom,
      "CSP":             e.csp,
      "Genre":           e.f_h,
      "CIN":             e.cin,
      "CNSS":            e.cnss,
      "Matricule":       e.matricule,
      "Email":           e.email,
      "Téléphone":       e.telephone,
      "Fonction":        e.fonction,
      "Type Contrat":    e.typeContrat,
      "Date Embauche":   e.dateEmbauche,
      "Date Naissance":  e.dateNaissance,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Employés");
    const today = new Date().toISOString().split("T")[0];
    saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `Export_Employes_${today}.xlsx`);
  };

  const handleOpenDeleteDialog  = (id) => { setSelectedEmployeId(id); setOpenDeleteDialog(true); };
  const handleCloseDeleteDialog = () => { setOpenDeleteDialog(false); setSelectedEmployeId(null); };

  const handleDelete = async () => {
    try {
      await deleteEmploye(selectedEmployeId);
      showSnackbar("Employé supprimé avec succès !");
      setEmployes(prev => prev.filter(e => e.idEmploye !== selectedEmployeId));
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Impossible de supprimer l'employé.", "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

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
    field: "actions",
    headerName: "Actions",
    width: 120,
    sortable: false,
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
  }), []); // eslint-disable-line react-hooks/exhaustive-deps

  const columnsWithActions = useMemo(() =>
    user?.role === "ADMIN" ? [...columns, actionsColumn] : columns,
  [columns, actionsColumn, user?.role]);

  const filteredRows = useMemo(() => employes.filter(e =>
    e.nom?.toLowerCase().includes(search.toLowerCase()) ||
    e.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    e.cin?.toLowerCase().includes(search.toLowerCase()) ||
    e.matricule?.toLowerCase().includes(search.toLowerCase())
  ), [employes, search]);

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Liste des Employés</Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField
                fullWidth
                label="Rechercher par nom, prénom, CIN ou matricule"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", justifyContent: "flex-start", gap: 1, flexWrap: "wrap" }}>
              {user?.role === "ADMIN" && (
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
              rows={filteredRows}
              columns={columnsWithActions}
              getRowId={row => row.idEmploye}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
              sortModel={sortModel}
              onSortModelChange={(model) => setTimeout(() => setSortModel(model), 0)}
              initialState={{
                pagination: { paginationModel: { pageSize: 20 } },
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
          <DialogContentText>Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est irréversible.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployesPage;

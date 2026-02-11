// frontend-template/vite/src/views/employes/EmployesPage.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Stack,
  IconButton,
  Snackbar,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import EmployeModal from "./EmployesModal";
import {
  getAllEmployes,
  updateEmploye,
  deleteEmploye,
} from "../../api/employeApi";
import { useAuth } from "../../contexts/auth/AuthContext";

const EmployesPage = () => {
  const { user } = useAuth();
  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingEmploye, setEditingEmploye] = useState(null);
  const [isSaving, setIsSaving] = useState(false); // prevent double save

  // Delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployeId, setSelectedEmployeId] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const showSnackbar = (message, severity = "success") =>
    setSnackbar({ open: true, message, severity });

  const handleCloseSnackbar = () =>
    setSnackbar((prev) => ({ ...prev, open: false }));

  // Fetch employees
  useEffect(() => {
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployes();
      setEmployes(data);
    } catch (err) {
      showSnackbar("Erreur lors du chargement des employés", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open modal
  const handleModalOpen = (employe = null) => {
    setEditingEmploye(employe);
    setModalOpen(true);
  };

  const handleModalClose = () => {
    setModalOpen(false);
    setEditingEmploye(null);
  };

  // Called by modal after successful save
  const handleSaveFromModal = (savedEmploye) => {
    if (!savedEmploye) return;
    setEmployes((prev) => {
      const index = prev.findIndex((e) => e.idEmploye === savedEmploye.idEmploye);
      if (index >= 0) {
        // update
        const updated = [...prev];
        updated[index] = savedEmploye;
        return updated;
      }
      // create
      return [...prev, savedEmploye];
    });
    handleModalClose();
  };

  // Delete
  const handleOpenDeleteDialog = (id) => {
    setSelectedEmployeId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEmployeId(null);
  };

  const handleDelete = async () => {
    try {
      await deleteEmploye(selectedEmployeId);
      setEmployes((prev) =>
        prev.filter((e) => e.idEmploye !== selectedEmployeId)
      );
      showSnackbar("Employé supprimé avec succès !");
    } catch (err) {
      const message =
        err.response?.data?.message || "Impossible de supprimer l'employé.";
      showSnackbar(message, "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

// Columns for DataGrid showing all employe fields
const columns = [
  { field: "nom", headerName: "Nom", flex: 1, minWidth: 150 },
  { field: "prenom", headerName: "Prénom", flex: 1, minWidth: 150 },
  { field: "email", headerName: "Email", flex: 1, minWidth: 200 },
  { field: "telephone", headerName: "Téléphone", flex: 1, minWidth: 150 },
  { field: "cin", headerName: "CIN", flex: 1, minWidth: 120 },
  { field: "cnss", headerName: "CNSS", flex: 1, minWidth: 120 },
  { field: "matricule", headerName: "Matricule", flex: 1, minWidth: 120 },
  { field: "csp", headerName: "CSP", flex: 1, minWidth: 120 },
  { field: "fonction", headerName: "Fonction", flex: 1, minWidth: 150 },
  { field: "typeContrat", headerName: "Type Contrat", flex: 1, minWidth: 120 },
  { field: "f_h", headerName: "Genre", flex: 0.7, minWidth: 80 },
  { field: "dateEmbauche", headerName: "Date Embauche", flex: 1, minWidth: 120 },
  { field: "dateNaissance", headerName: "Date Naissance", flex: 1, minWidth: 120 },
  { field: "entrepriseNom", headerName: "Entreprise", flex: 1, minWidth: 150 },
  { field: "departementNom", headerName: "Département", flex: 1, minWidth: 150 },
  
];

const actionsColumn = {
  field: "actions",
  headerName: "Actions",
  width: 120,
  sortable: false,
  renderCell: (params) => (
    <Stack direction="row" spacing={1}>
      <IconButton
        color="primary"
        size="small"
        onClick={() => handleModalOpen(params.row)}
      >
        <EditIcon />
      </IconButton>

      <IconButton
        color="error"
        size="small"
        onClick={() => handleOpenDeleteDialog(params.row.idEmploye)}
      >
        <DeleteIcon />
      </IconButton>
    </Stack>
  ),
};
const isAdmin = user?.role === "ADMIN";

const columnsWithActions = isAdmin
  ? [...columns, actionsColumn]
  : columns;


  const filteredRows = employes.filter(
    (e) =>
      e.nom?.toLowerCase().includes(search.toLowerCase()) ||
      e.prenom?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Liste des Employés
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rechercher par nom ou prénom"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6} textAlign="right">
            {user?.role === 'ADMIN' && (
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleModalOpen()}
              >
                Créer Employé
              </Button>
            )}
            </Grid>
          </Grid>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={columnsWithActions}
              getRowId={(row) => row.idEmploye}
              loading={loading}
              pageSizeOptions={[10, 20, 50]}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create/Edit Modal */}
      <EmployeModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSaveFromModal} // only one save call
        showSnackbar={showSnackbar}
        initialData={editingEmploye}
      />

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cet employé ? Cette action est
            irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button variant="contained" color="error" onClick={handleDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EmployesPage;

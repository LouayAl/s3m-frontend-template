// frontend-template/vite/src/views/formations/FormationsPage.jsx
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
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FormationsModal from "./FormationsModal";
import { getAllFormations, deleteFormation } from "../../api/formationApi";
import { useAuth } from "../../contexts/auth/AuthContext";

const FormationsPage = () => {
  const theme = useTheme();
  const { token } = useAuth();

  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFormation, setEditingFormation] = useState(null);

  // Delete dialog state
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFormationId, setSelectedFormationId] = useState(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // Fetch formations
  useEffect(() => {
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const data = await getAllFormations(token);
      setFormations(data);
    } catch {
      showSnackbar("Erreur lors du chargement des formations.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open create/edit modal
  const handleModalOpen = (formation = null) => {
    setEditingFormation(formation);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setEditingFormation(null);
    setModalOpen(false);
  };

  const handleSave = (savedFormation) => {
    if (editingFormation) {
      // Update
      setFormations((prev) => prev.map((f) => (f.id === savedFormation.id ? savedFormation : f)));
    } else {
      // Create
      setFormations((prev) => [...prev, savedFormation]);
    }
    handleModalClose();
  };

  // Delete
  const handleOpenDeleteDialog = (id) => {
    setSelectedFormationId(id);
    setOpenDeleteDialog(true);
  };
  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedFormationId(null);
  };
  const confirmDelete = async () => {
    try {
      await deleteFormation(selectedFormationId);
      setFormations((prev) => prev.filter((f) => f.id !== selectedFormationId));
      showSnackbar("Formation supprimée avec succès !");
    } catch (err) {
      const message = err.response?.data?.message || "Impossible de supprimer cette formation.";
      showSnackbar(message, "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // Columns
  const columns = [
    { field: "module", headerName: "Module", flex: 1, minWidth: 160 },
    { field: "familleFormation", headerName: "Famille", flex: 1, minWidth: 120 },
    { field: "typeFormation", headerName: "Type", flex: 1, minWidth: 120 },
    { field: "sousFamille", headerName: "Sous-famille", flex: 1, minWidth: 120 },
    { field: "interneExterne", headerName: "Interne/Externe", flex: 1, minWidth: 140 },
    { field: "referenceFormation", headerName: "Référence", flex: 1, minWidth: 120 },
    { field: "annee", headerName: "Année", width: 100 },
    { field: "dureeHeures", headerName: "Durée (h)", width: 120 },
    { field: "dureeJours", headerName: "Durée (j)", width: 120 },
    { field: "prixHeureMad", headerName: "Prix / h (MAD)", width: 140 },
    { field: "prixJourMad", headerName: "Prix / j (MAD)", width: 140 },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      sortable: false,
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
    },
  ];

  const filteredRows = formations.filter((f) => f.module?.toLowerCase().includes(search.toLowerCase()));

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Catalogue des Formations
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid size={{xs:12, md:6}}>
              <TextField
                fullWidth
                label="Rechercher par module"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid size={{xs:12, md:6, textAlign:"right"}}>
              <Button variant="contained" color="primary" onClick={() => handleModalOpen()}>
                Créer Formation
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row.id}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </Box>
        </CardContent>
      </Card>

      {/* CREATE/EDIT MODAL */}
      <FormationsModal
        open={modalOpen}
        onClose={handleModalClose}
        onSave={handleSave}
        showSnackbar={showSnackbar}
        initialData={editingFormation}
      />

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette formation ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog} color="inherit">
            Annuler
          </Button>
          <Button onClick={confirmDelete} color="error" variant="contained">
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* SNACKBAR */}
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

export default FormationsPage;

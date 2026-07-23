import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Stack, IconButton,
  Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogContentText, DialogActions, Button, Chip,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import FormateursModal from "./FormateursModal";
import { getAllFormateurs, deleteFormateur } from "../../api/formateurApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import { useAuth } from "../../contexts/auth/AuthContext";

const FormateursPage = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "ADMIN";
  const canEdit = isAdmin; // only admin can create/update/delete — everyone else sees the list only

  const [formateurs, setFormateurs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [entreprises, setEntreprises] = useState([]);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFormateur, setEditingFormateur] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedFormateurId, setSelectedFormateurId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  useEffect(() => { fetchFormateurs(); }, []);

  useEffect(() => {
    if (!isAdmin) return;
    getAllEntreprises()
      .then(setEntreprises)
      .catch(() => showSnackbar("Erreur chargement entreprises", "error"));
  }, [isAdmin]);

  const fetchFormateurs = async () => {
    try {
      setLoading(true);
      const data = await getAllFormateurs();
      setFormateurs(data);
    } catch {
      showSnackbar("Erreur lors du chargement des formateurs.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleModalOpen = (formateur = null) => { setEditingFormateur(formateur); setModalOpen(true); };
  const handleModalClose = () => { setEditingFormateur(null); setModalOpen(false); };

  const handleSave = (saved) => {
    if (editingFormateur) {
      setFormateurs((prev) => prev.map((f) => (f.idFormateur === saved.idFormateur ? saved : f)));
    } else {
      setFormateurs((prev) => [saved, ...prev]);
    }
    handleModalClose();
  };

  const handleOpenDeleteDialog = (id) => { setSelectedFormateurId(id); setOpenDeleteDialog(true); };
  const handleCloseDeleteDialog = () => { setOpenDeleteDialog(false); setSelectedFormateurId(null); };

  const confirmDelete = async () => {
    try {
      await deleteFormateur(selectedFormateurId);
      setFormateurs((prev) => prev.filter((f) => f.idFormateur !== selectedFormateurId));
      showSnackbar("Formateur supprimé avec succès !");
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Impossible de supprimer ce formateur.", "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const baseColumns = [
    { field: "nom", headerName: "Nom", flex: 1, minWidth: 140 },
    { field: "prenom", headerName: "Prénom", flex: 1, minWidth: 140 },
    { field: "email", headerName: "Email", flex: 1, minWidth: 180 },
    { field: "telephone", headerName: "Téléphone", flex: 1, minWidth: 140 },
    { field: "entrepriseNom", headerName: "Entreprise", flex: 1, minWidth: 160 },
    {
      field: "actif", headerName: "Statut", width: 110,
      renderCell: (params) => (
        <Chip label={params.value ? "Actif" : "Inactif"} color={params.value ? "success" : "default"} size="small" />
      ),
    },
  ];

  const actionsColumn = {
    field: "actions", headerName: "Actions", width: 120, sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        <IconButton color="primary" size="small" onClick={() => handleModalOpen(params.row)}>
          <EditIcon />
        </IconButton>
        <IconButton color="error" size="small" onClick={() => handleOpenDeleteDialog(params.row.idFormateur)}>
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  };

  const columns = canEdit ? [...baseColumns, actionsColumn] : baseColumns;

  const filteredRows = formateurs.filter((f) =>
    `${f.nom} ${f.prenom}`.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Formateurs</Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid size={{ xs: 12, md: canEdit ? 8 : 12 }}>
              <TextField fullWidth label="Rechercher par nom" value={search} onChange={(e) => setSearch(e.target.value)} />
            </Grid>

            {canEdit && (
              <Grid size={{ xs: 12, md: 4 }} sx={{ display: "flex", justifyContent: "flex-end" }}>
                <Button variant="contained" color="primary" onClick={() => handleModalOpen()}>
                  Créer Formateur
                </Button>
              </Grid>
            )}
          </Grid>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row.idFormateur}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
            />
          </Box>
        </CardContent>
      </Card>

      {canEdit && (
        <FormateursModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
          showSnackbar={showSnackbar}
          initialData={editingFormateur}
          entreprises={entreprises}
        />
      )}

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce formateur ? Cette action est irréversible.
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

export default FormateursPage;
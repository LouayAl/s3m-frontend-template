// frontend-template/vite/src/views/entreprises/EntreprisesPage.jsx
import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Card,
  CardContent,
  TextField,
  Grid,
  Button,
  Stack,
  Snackbar,
  Alert,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import {
  getAllEntreprises,
  createEntreprise,
  deleteEntreprise,
  updateEntreprise
} from "../../api/entrepriseApi";
import { useAuth } from "../../contexts/auth/AuthContext";
import EntrepriseModal from "./EntreprisesModal";

const EntreprisesPage = () => {
  const theme = useTheme();
  const { token } = useAuth();

  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Create Modal
  const [openCreateModal, setOpenCreateModal] = useState(false);

  // Editing
  const [editRowId, setEditRowId] = useState(null);
  const [editNom, setEditNom] = useState("");

  // Delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEntrepriseId, setSelectedEntrepriseId] = useState(null); 

  const handleOpenDeleteDialog = (id) => {
    setSelectedEntrepriseId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEntrepriseId(null);
  };

  // Snackbar
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success"
  });

  const showSnackbar = (message, severity = "success") => {
    setSnackbar({ open: true, message, severity });
  };

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  useEffect(() => {
    fetchEntreprises();
  }, []);

  const fetchEntreprises = async () => {
    try {
      setLoading(true);
      const data = await getAllEntreprises(token);
      setEntreprises(data);
    } catch (err) {
      console.error("Error loading entreprises:", err);
      showSnackbar("Erreur lors du chargement des entreprises.", "error");
    } finally {
      setLoading(false);
    }
  };

  // UPDATE
  const handleSave = async (id) => {
    try {
      await updateEntreprise(id, { nomEntreprise: editNom });

      setEntreprises((prev) =>
        prev.map((e) =>
          e.idEntreprise === id ? { ...e, nomEntreprise: editNom } : e
        )
      );

      setEditRowId(null);
      showSnackbar("Entreprise mise à jour avec succès !", "success");
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      if (err.response && err.response.data) {
        showSnackbar(
          err.response.data.message || "Erreur lors de la mise à jour.",
          "error"
        );
      } else {
        showSnackbar("Une erreur est survenue, veuillez réessayer.", "error");
      }
    }
  };

  // REAL DELETE (called after confirmation)
  const confirmDelete = async () => {
    try {
      await deleteEntreprise(selectedEntrepriseId);
      setEntreprises((prev) => prev.filter((e) => e.idEntreprise !== selectedEntrepriseId));
      showSnackbar("Entreprise supprimée avec succès !");
    } catch (err) {
      const message =
        err.response?.data?.message || "Impossible de supprimer cette entreprise.";
      showSnackbar(message, "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };


  // DELETE
  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette entreprise ?"))
      return;

    try {
      await deleteEntreprise(id);
      setEntreprises((prev) =>
        prev.filter((e) => e.idEntreprise !== id)
      );
      showSnackbar("Entreprise supprimée avec succès !", "success");
    } catch (err) {
      if (err.response && err.response.data) {
        showSnackbar(
          err.response.data.message ||
            "Impossible de supprimer cette entreprise.",
          "error"
        );
      } else {
        showSnackbar("Une erreur est survenue, veuillez réessayer.", "error");
      }
    }
  };

    const columns = [
    {
        field: "nomEntreprise",
        headerName: "Nom",
        flex: 1,
        align: "center",
        headerAlign: "center",
        renderCell: (params) => {
        if (editRowId === params.row.idEntreprise) {
            return (
            <Box
                sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                width: "100%"
                }}
            >
                <TextField
                value={editNom}
                onChange={(e) => setEditNom(e.target.value)}
                size="small"
                sx={{
                    width: 200 // 👈 fixed small width instead of full column
                }}
                />
            </Box>
            );
        }
        return (
            <Box
            sx={{
                width: "100%",
                textAlign: "center",
                display: "flex",
                justifyContent: "center",
                alignItems: "center"
            }}
            >
            {params.value}
            </Box>
        );
        }
    },
    {
        field: "actions",
        headerName: "Actions",
        width: 140,
        align: "center",
        headerAlign: "center",
        sortable: false,
        renderCell: (params) => {
        if (editRowId === params.row.idEntreprise) {
            return (
            <Box
                sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                width: "100%"
                }}
            >
                <IconButton
                color="success"
                onClick={() => handleSave(params.row.idEntreprise)}
                >
                <SaveIcon />
                </IconButton>
                <IconButton
                color="secondary"
                onClick={() => setEditRowId(null)}
                >
                <CloseIcon />
                </IconButton>
            </Box>
            );
        }

        return (
            <Box
            sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                gap: 1,
                width: "100%"
            }}
            >
            <IconButton
                color="primary"
                onClick={() => {
                setEditRowId(params.row.idEntreprise);
                setEditNom(params.row.nomEntreprise);
                }}
            >
                <EditIcon />
            </IconButton>
            <IconButton
                color="error"
                size="small"
                onClick={() => handleOpenDeleteDialog(params.row.idEntreprise)}
            >
                <DeleteIcon />
            </IconButton>
            </Box>
        );
        }
    }
    ];


  const filteredRows = entreprises.filter((e) =>
    e.nomEntreprise?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Liste des Entreprises
      </Typography>

      <Card
        sx={{
          background: theme.palette.background.paper,
          borderRadius: "16px",
          boxShadow: theme.shadows[4]
        }}
      >
        <CardContent>
          {/* Filter */}
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rechercher par nom"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6} textAlign={{ xs: "left", md: "right" }}>
            <Button
              variant="contained"
              color="primary"
              sx={{ height: "100%" }}
              onClick={() => setOpenCreateModal(true)}
              >
              Créer une entreprise
            </Button>
            </Grid>
          </Grid>

          {/* Table */}
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ minWidth: 500, height: "50vh" }}>
                <DataGrid
                rows={filteredRows}
                columns={columns}
                getRowId={(row) => row.idEntreprise}
                loading={loading}
                pageSizeOptions={[10, 20, 50]}
                initialState={{
                    pagination: { paginationModel: { pageSize: 10, page: 0 } }
                }}
                sx={{
                    border: "none",
                    "& .MuiDataGrid-cell": {
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center"
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: theme.palette.background.default,
                        fontWeight: "bold"
                    },
                    "& .MuiDataGrid-row:hover": {
                        backgroundColor: theme.palette.action.hover
                    }
                }}
                />
            </Box>
          </Box>
        </CardContent>
      </Card>


      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cette entreprise ?
            <br />
            Cette action est irréversible.
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

      {/* CREATE ENTREPRISE MODAL */}
      <EntrepriseModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSave={async (data) => {
        try {
        await createEntreprise(data);
        fetchEntreprises();   // reload table
        setOpenCreateModal(false);
        showSnackbar("Entreprise créée avec succès !");
        } catch (err) {
        showSnackbar("Erreur lors de la création de l’entreprise", "error");
        }
        }}
      />


      {/* Snackbar Notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EntreprisesPage;

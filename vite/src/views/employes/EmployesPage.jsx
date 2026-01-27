// frontend-template/vite/src/views/employes/EmployesPage.jsx
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
  IconButton
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import {
  getAllEntreprises,
  deleteEntreprise,
  updateEntreprise
} from "../../api/entrepriseApi";
import { useAuth } from "../../contexts/auth/AuthContext";

const EntreprisesPage = () => {
  const theme = useTheme();
  const { token } = useAuth();

  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Editing
  const [editRowId, setEditRowId] = useState(null);
  const [editNom, setEditNom] = useState("");

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
        field: "idEntreprise",
        headerName: "ID",
        width: 100,
        align: "center",
        headerAlign: "center"
    },
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
                onClick={() => handleDelete(params.row.idEntreprise)}
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
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher par nom"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
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

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
  Alert
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { getAllFormations, deleteFormation, updateFormation } from "../../api/formationApi";
import { useAuth } from "../../contexts/auth/AuthContext";

const FormationsPage = () => {
  const theme = useTheme();
  const { token } = useAuth();

  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Row editing state
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});

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
    fetchFormations();
  }, []);

  const fetchFormations = async () => {
    try {
      setLoading(true);
      const data = await getAllFormations(token);
      setFormations(data);
    } catch (err) {
      console.error("Error loading formations:", err);
      showSnackbar("Erreur lors du chargement des formations.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id) => {
    try {
      await updateFormation(id, editRowData);
      setFormations((prev) =>
        prev.map((f) => (f.id === id ? { ...editRowData } : f))
      );
      setEditRowId(null);
      setEditRowData({});
      showSnackbar("Formation mise à jour avec succès !");
    } catch (err) {
      console.error("Erreur lors de la mise à jour:", err);
      const message = err.response?.data?.message || "Erreur lors de la mise à jour.";
      showSnackbar(message, "error");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Voulez-vous vraiment supprimer cette formation ?")) return;

    try {
      await deleteFormation(id);
      setFormations((prev) => prev.filter((f) => f.id !== id));
      showSnackbar("Formation supprimée avec succès !");
    } catch (err) {
      console.error("Erreur lors de la suppression:", err);
      const message = err.response?.data?.message || "Impossible de supprimer cette formation.";
      showSnackbar(message, "error");
    }
  };

  const columns = [
    { field: "module", headerName: "Module", flex: 1, minWidth: 160, headerAlign: "center", align: "center" },
    { field: "familleFormation", headerName: "Famille", flex: 1, minWidth: 120, headerAlign: "center", align: "center" },
    { field: "typeFormation", headerName: "Type", flex: 1, minWidth: 120, headerAlign: "center", align: "center" },
    { field: "sousFamille", headerName: "Sous-famille", flex: 1, minWidth: 120, headerAlign: "center", align: "center" },
    { field: "referenceFormation", headerName: "Référence", flex: 1, minWidth: 120, headerAlign: "center", align: "center" },
    { field: "annee", headerName: "Année", width: 100, headerAlign: "center", align: "center" },
    { field: "dureeHeures", headerName: "Durée (h)", width: 120, headerAlign: "center", align: "center" },
    { field: "dureeJours", headerName: "Durée (j)", width: 120, headerAlign: "center", align: "center" },

    // Actions
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        if (editRowId === params.row.id) {
          return (
            <Stack direction="row" spacing={1} justifyContent="center">
              <IconButton color="success" size="small" onClick={() => handleSave(params.row.id)}>
                <SaveIcon />
              </IconButton>
              <IconButton color="secondary" size="small" onClick={() => {
                setEditRowId(null);
                setEditRowData({});
              }}>
                <CancelIcon />
              </IconButton>
            </Stack>
          );
        }
        return (
          <Stack direction="row" spacing={1} justifyContent="center">
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setEditRowId(params.row.id);
                setEditRowData(params.row); // copy all row data
              }}
            >
              <EditIcon />
            </IconButton>
            <IconButton
              color="error"
              size="small"
              onClick={() => handleDelete(params.row.id)}
            >
              <DeleteIcon />
            </IconButton>
          </Stack>
        );
      }
    }
  ];

  // Make all columns editable in edit mode
  const editableColumns = columns.map((col) => {
    if (col.field === "actions") return col; // actions stay the same
    return {
      ...col,
      renderCell: (params) =>
        editRowId === params.row.id ? (
          <TextField
            value={editRowData[params.field] ?? ""}
            onChange={(e) =>
              setEditRowData((prev) => ({ ...prev, [params.field]: e.target.value }))
            }
            size="small"
            sx={{ width: 120 }}
          />
        ) : (
          params.value
        )
    };
  });

  const filteredRows = formations.filter((f) =>
    f.module?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Catalogue des Formations
      </Typography>

      <Card sx={{ background: theme.palette.background.paper, borderRadius: "16px", boxShadow: theme.shadows[4] }}>
        <CardContent>
          {/* Filters */}
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher par module"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
          </Grid>

          {/* Table responsive */}
          <Box sx={{ width: "100%", overflowX: "auto" }}>
            <Box sx={{ minWidth: 900, height: "70vh" }}>
              <DataGrid
                rows={filteredRows}
                columns={editableColumns}
                getRowId={(row) => row.id}
                loading={loading}
                pageSizeOptions={[10, 20, 50]}
                initialState={{ pagination: { paginationModel: { pageSize: 10, page: 0 } } }}
                sx={{
                  border: "none",
                  "& .MuiDataGrid-columnHeaders": {
                    backgroundColor: theme.palette.background.default,
                    fontWeight: "bold"
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: theme.palette.action.hover
                  },
                  "& .MuiDataGrid-cell": {
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center"
                  }
                }}
              />
            </Box>
          </Box>
        </CardContent>
      </Card>

      {/* Snackbar notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default FormationsPage;

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
  Button
} from "@mui/material";

import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import { getAllEmployes, deleteEmploye, updateEmploye } from "../../api/employeApi";
import { useAuth } from "../../contexts/auth/AuthContext";

const EmployesPage = () => {
  const theme = useTheme();
  const { token } = useAuth();

  const [employes, setEmployes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Row editing
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});

  // Delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedEmployeId, setSelectedEmployeId] = useState(null);

  const handleOpenDeleteDialog = (id) => {
    setSelectedEmployeId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setOpenDeleteDialog(false);
    setSelectedEmployeId(null);
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
    fetchEmployes();
  }, []);

  const fetchEmployes = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployes(token);
      setEmployes(data);
    } catch {
      showSnackbar("Erreur lors du chargement des employés.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id) => {
    try {
      await updateEmploye(id, editRowData);
      setEmployes((prev) =>
        prev.map((e) => (e.idEmploye === id ? { ...editRowData } : e))
      );
      setEditRowId(null);
      setEditRowData({});
      showSnackbar("Employé mis à jour avec succès !");
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de la mise à jour.";
      showSnackbar(message, "error");
    }
  };

  // REAL DELETE (called after confirmation)
  const confirmDelete = async () => {
    try {
      await deleteEmploye(selectedEmployeId);
      setEmployes((prev) => prev.filter((e) => e.idEmploye !== selectedEmployeId));
      showSnackbar("Employé supprimé avec succès !");
    } catch (err) {
      const message =
        err.response?.data?.message || "Impossible de supprimer cet employé.";
      showSnackbar(message, "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const columns = [
    { field: "nom", headerName: "Nom", flex: 1, minWidth: 150, headerAlign: "center", align: "center" },
    { field: "prenom", headerName: "Prénom", flex: 1, minWidth: 150, headerAlign: "center", align: "center" },
    { field: "email", headerName: "Email", flex: 1, minWidth: 200, headerAlign: "center", align: "center" },
    { field: "telephone", headerName: "Téléphone", flex: 1, minWidth: 150, headerAlign: "center", align: "center" },
    {
      field: "actions",
      headerName: "Actions",
      width: 150,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        if (editRowId === params.row.idEmploye) {
          return (
            <Stack direction="row" spacing={1}>
              <IconButton color="success" size="small" onClick={() => handleSave(params.row.idEmploye)}>
                <SaveIcon />
              </IconButton>
              <IconButton
                color="secondary"
                size="small"
                onClick={() => {
                  setEditRowId(null);
                  setEditRowData({});
                }}
              >
                <CancelIcon />
              </IconButton>
            </Stack>
          );
        }

        return (
          <Stack direction="row" spacing={1}>
            <IconButton
              color="primary"
              size="small"
              onClick={() => {
                setEditRowId(params.row.idEmploye);
                setEditRowData(params.row);
              }}
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
        );
      }
    }
  ];

  const editableColumns = columns.map((col) => {
    if (col.field === "actions") return col;
    return {
      ...col,
      renderCell: (params) =>
        editRowId === params.row.idEmploye ? (
          <TextField
            value={editRowData[params.field] ?? ""}
            onChange={(e) =>
              setEditRowData((prev) => ({ ...prev, [params.field]: e.target.value }))
            }
            size="small"
            sx={{ width: 150 }}
          />
        ) : (
          params.value
        )
    };
  });

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
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher par nom ou prénom"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>
          </Grid>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={editableColumns}
              getRowId={(row) => row.idEmploye}
              loading={loading}
              pageSizeOptions={[10, 20, 50]}
            />
          </Box>
        </CardContent>
      </Card>

      {/* DELETE CONFIRMATION DIALOG */}
      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer cet employé ?
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

export default EmployesPage;

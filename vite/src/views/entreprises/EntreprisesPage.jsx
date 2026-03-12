// frontend-template/vite/src/views/entreprises/EntreprisesPage.jsx
import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Button, Stack,
  Snackbar, Alert, IconButton,
  Dialog, DialogTitle, DialogContent, DialogContentText, DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CloseIcon from "@mui/icons-material/Close";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  getAllEntreprises, createEntreprise, deleteEntreprise,
  updateEntreprise, importEntreprises,
} from "../../api/entrepriseApi";
import { useAuth } from "../../contexts/auth/AuthContext";
import EntrepriseModal from "./EntreprisesModal";

const importButtonSx = {
  backgroundColor: "#4CAF50",
  "&:hover": { backgroundColor: "#43A047" },
};

const exportButtonSx = {
  backgroundColor: "#ff5e00",
  "&:hover": { backgroundColor: "#ff3c00" },
};


const EntreprisesPage = () => {
  const theme = useTheme();
  const { user } = useAuth();

  const [entreprises, setEntreprises] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [search, setSearch]           = useState("");

  const [openCreateModal, setOpenCreateModal] = useState(false);
  const [editRowId, setEditRowId]             = useState(null);
  const [editNom, setEditNom]                 = useState("");

  const [openDeleteDialog, setOpenDeleteDialog]       = useState(false);
  const [selectedEntrepriseId, setSelectedEntrepriseId] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar        = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  useEffect(() => { fetchEntreprises(); }, []);

  const fetchEntreprises = async () => {
    try {
      setLoading(true);
      const data = await getAllEntreprises();
      setEntreprises(data);
    } catch {
      showSnackbar("Erreur lors du chargement des entreprises.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (id) => {
    try {
      await updateEntreprise(id, { nomEntreprise: editNom });
      setEntreprises(prev => prev.map(e => e.idEntreprise === id ? { ...e, nomEntreprise: editNom } : e));
      setEditRowId(null);
      showSnackbar("Entreprise mise à jour avec succès !");
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Erreur lors de la mise à jour.", "error");
    }
  };

  const handleImportExcel = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await importEntreprises(file);
      showSnackbar("Import Excel réussi !", "success");
      fetchEntreprises();
    } catch (err) {
      showSnackbar(err.response?.status === 409
        ? err.response.data.message
        : "Erreur import Excel.", "error");
    } finally {
      e.target.value = "";
    }
  };

  const handleExportExcel = () => {
    if (!entreprises.length) { showSnackbar("Aucune entreprise à exporter.", "warning"); return; }
    const data = entreprises.map(e => ({ "Nom Entreprise": e.nomEntreprise }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Entreprises");
    const today = new Date().toISOString().split("T")[0];
    saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `Export_Entreprises_${today}.xlsx`);
  };

  const handleOpenDeleteDialog  = (id) => { setSelectedEntrepriseId(id); setOpenDeleteDialog(true); };
  const handleCloseDeleteDialog = () => { setOpenDeleteDialog(false); setSelectedEntrepriseId(null); };

  const confirmDelete = async () => {
    try {
      await deleteEntreprise(selectedEntrepriseId);
      setEntreprises(prev => prev.filter(e => e.idEntreprise !== selectedEntrepriseId));
      showSnackbar("Entreprise supprimée avec succès !");
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Impossible de supprimer cette entreprise.", "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  const columns = [
    {
      field: "nomEntreprise",
      headerName: "Nom",
      flex: 1,
      renderCell: (params) => {
        if (editRowId === params.row.idEntreprise) {
          return (
            <TextField
              value={editNom}
              onChange={e => setEditNom(e.target.value)}
              size="small"
              sx={{ width: 200 }}
            />
          );
        }
        return params.value;
      },
    },
  ];

  const actionsColumn = {
    field: "actions",
    headerName: "Actions",
    width: 140,
    sortable: false,
    renderCell: (params) => {
      if (editRowId === params.row.idEntreprise) {
        return (
          <Stack direction="row" spacing={1}>
            <IconButton color="success" onClick={() => handleSave(params.row.idEntreprise)}>
              <SaveIcon />
            </IconButton>
            <IconButton color="secondary" onClick={() => setEditRowId(null)}>
              <CloseIcon />
            </IconButton>
          </Stack>
        );
      }
      return (
        <Stack direction="row" spacing={1}>
          <IconButton color="primary" onClick={() => { setEditRowId(params.row.idEntreprise); setEditNom(params.row.nomEntreprise); }}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => handleOpenDeleteDialog(params.row.idEntreprise)}>
            <DeleteIcon />
          </IconButton>
        </Stack>
      );
    },
  };

  const columnsWithActions = user?.role === "ADMIN" ? [...columns, actionsColumn] : columns;

  const filteredRows = entreprises.filter(e =>
    e.nomEntreprise?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Liste des Fournisseurs</Typography>

      <Card sx={{ borderRadius: "16px", boxShadow: theme.shadows[4] }}>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid size={{ xs: 12, md: 6 }}>
              <TextField fullWidth label="Rechercher par nom" value={search} onChange={e => setSearch(e.target.value)} />
            </Grid>
            <Grid size={{ xs: 12, md: 6 }} sx={{ display: "flex", justifyContent: "flex-start", gap: 1, flexWrap: "wrap" }}>
              {user?.role === "ADMIN" && (
                <Button variant="contained" color="primary" onClick={() => setOpenCreateModal(true)}>
                  Créer une entreprise
                </Button>
              )}
              {user?.role === "ADMIN" && (
                <Button variant="contained" component="label" sx={importButtonSx}>
                  Importer Excel
                  <input type="file" hidden accept=".xlsx,.xls" onChange={handleImportExcel} />
                </Button>
              )}
              <Button variant="contained" sx={exportButtonSx} onClick={handleExportExcel}>
                Export Excel
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ height: "50vh", width: "100%" }}>
            <DataGrid
              rows={filteredRows}
              columns={columnsWithActions}
              getRowId={row => row.idEntreprise}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 10 } } }}
              sx={{
                border: "none",
                "& .MuiDataGrid-columnHeaders": {
                  backgroundColor: theme.palette.background.default,
                  fontWeight: "bold",
                },
                "& .MuiDataGrid-row:hover": { backgroundColor: theme.palette.action.hover },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>Êtes-vous sûr de vouloir supprimer cette entreprise ? Cette action est irréversible.</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>

      <EntrepriseModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        onSave={async (data) => {
          try {
            await createEntreprise(data);
            fetchEntreprises();
            setOpenCreateModal(false);
            showSnackbar("Entreprise créée avec succès !");
          } catch {
            showSnackbar("Erreur lors de la création de l'entreprise", "error");
          }
        }}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} variant="filled" sx={{ width: "100%" }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default EntreprisesPage;
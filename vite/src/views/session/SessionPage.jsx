// frontend-template/vite/src/views/sessions/SessionPage.jsx
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
  DialogActions,
  Button
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { useTheme } from "@mui/material/styles";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import SaveIcon from "@mui/icons-material/Save";
import CancelIcon from "@mui/icons-material/Cancel";
import AddIcon from "@mui/icons-material/Add";

import {
  getAllSessions,
  createSession,
  updateSession,
  deleteSession
} from "../../api/sessionApi";

import SessionModal from "./SessionModal";

const SessionPage = () => {
  const theme = useTheme();
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Row editing state
  const [editRowId, setEditRowId] = useState(null);
  const [editRowData, setEditRowData] = useState({});

  // Delete dialog
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  // Create session modal
  const [openCreateModal, setOpenCreateModal] = useState(false);

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
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleOpenDeleteDialog = (id) => {
    setSelectedSessionId(id);
    setOpenDeleteDialog(true);
  };

  const handleCloseDeleteDialog = () => {
    setSelectedSessionId(null);
    setOpenDeleteDialog(false);
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      const data = await getAllSessions();
      setSessions(data);
    } catch (err) {
      showSnackbar("Erreur lors du chargement des sessions.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ---------------- Inline Editing ----------------
  const handleSave = async (id) => {
    try {
      await updateSession(id, editRowData);
      setSessions(prev =>
        prev.map(s => s.idSession === id ? { ...editRowData, idSession: id } : s)
      );
      setEditRowId(null);
      setEditRowData({});
      showSnackbar("Session mise à jour avec succès !");
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de la mise à jour.";
      showSnackbar(message, "error");
    }
  };

  // ---------------- Delete ----------------
  const confirmDelete = async () => {
    try {
      await deleteSession(selectedSessionId);
      setSessions(prev => prev.filter(s => s.idSession !== selectedSessionId));
      showSnackbar("Session supprimée avec succès !");
    } catch {
      showSnackbar("Impossible de supprimer cette session.", "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // ---------------- DataGrid Columns ----------------
  const columns = [
    { field: "referenceSession", headerName: "Réf. session", flex: 1, minWidth: 140, headerAlign: "center", align: "center" },
    { field: "formation", headerName: "Formation", flex: 1, minWidth: 160, headerAlign: "center", align: "center" },
    { field: "entrepriseNom", headerName: "Entreprise", flex: 1, minWidth: 140, headerAlign: "center", align: "center" },
    { field: "fournisseurNom", headerName: "Fournisseur", flex: 1, minWidth: 140, headerAlign: "center", align: "center" },
    { field: "formateurNomComplet", headerName: "Formateur", flex: 1, minWidth: 140, headerAlign: "center", align: "center" },
    { field: "dateDebut", headerName: "Début", width: 120, headerAlign: "center", align: "center" },
    { field: "dateFin", headerName: "Fin", width: 120, headerAlign: "center", align: "center" },
    { field: "dHeures", headerName: "Durée (h)", width: 100, headerAlign: "center", align: "center" },
    { field: "dJours", headerName: "Durée (j)", width: 100, headerAlign: "center", align: "center" },
    { field: "statut", headerName: "Statut", width: 120, headerAlign: "center", align: "center" },
    {
      field: "actions",
      headerName: "Actions",
      width: 180,
      align: "center",
      headerAlign: "center",
      sortable: false,
      renderCell: (params) => {
        if (editRowId === params.row.idSession) {
          return (
            <Stack direction="row" spacing={1}>
              <IconButton color="success" size="small" onClick={() => handleSave(params.row.idSession)}>
                <SaveIcon />
              </IconButton>
              <IconButton color="secondary" size="small" onClick={() => { setEditRowId(null); setEditRowData({}); }}>
                <CancelIcon />
              </IconButton>
            </Stack>
          );
        }

        return (
          <Stack direction="row" spacing={1}>
            <IconButton color="primary" size="small" onClick={() => { setEditRowId(params.row.idSession); setEditRowData(params.row); }}>
              <EditIcon />
            </IconButton>
            <IconButton color="error" size="small" onClick={() => handleOpenDeleteDialog(params.row.idSession)}>
              <DeleteIcon />
            </IconButton>
          </Stack>
        );
      }
    }
  ];

  const editableColumns = columns.map(col => {
    if (col.field === "actions") return col;
    return {
      ...col,
      renderCell: params =>
        editRowId === params.row.idSession ? (
          <TextField
            value={editRowData[params.field] ?? ""}
            onChange={e => setEditRowData(prev => ({ ...prev, [params.field]: e.target.value }))}
            size="small"
            sx={{ width: 120 }}
          />
        ) : params.value
    };
  });

  const filteredRows = sessions.filter(s =>
    s.formation?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Sessions de Formation
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2}>
            <Grid item xs={12} md={4}>
              <TextField
                fullWidth
                label="Rechercher par formation"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={2}>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => setOpenCreateModal(true)}
              >
                Créer session
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={editableColumns}
              getRowId={row => row.idSession}
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
          Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* CREATE SESSION MODAL */}
      <SessionModal
        open={openCreateModal}
        onClose={() => setOpenCreateModal(false)}
        showSnackbar={showSnackbar}
        onSessionCreated={(createdSession) => {
          setSessions(prev => [...prev, createdSession]);
        }}
      />

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

export default SessionPage;

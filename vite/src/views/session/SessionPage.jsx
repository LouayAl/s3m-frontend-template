// frontend-template/vite/src/views/sessions/SessionPage.jsx
import { useEffect, useState, useMemo } from "react";
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Button, IconButton,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  getAllSessions, deleteSession, addParticipantsToSession,
  getAllFormateurs, getAllFormations, removeParticipantsFromSession,
} from "../../api/sessionApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import SessionModal from "./SessionModal";
import ParticipantsModal from "./ParticipantsModal";
import SessionParticipantsPanel from "./SessionParticipantsPanel";
import YearFilter from "../dashboard/Default/YearFilter";

const exportButtonSx = {
  backgroundColor: "#4CAF50",
  "&:hover": { backgroundColor: "#43A047" },
};

const SessionPage = () => {
  const [sessions, setSessions]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [search, setSearch]       = useState("");

  // Year filter — empty means "all years"
  const [selectedYears, setSelectedYears] = useState([]);

  const [openSessionModal, setOpenSessionModal]   = useState(false);
  const [editingSession, setEditingSession]       = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog]   = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [openParticipantsModal, setOpenParticipantsModal]           = useState(false);
  const [editingParticipantsSession, setEditingParticipantsSession] = useState(null);
  const [openParticipantsPanel, setOpenParticipantsPanel]           = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar        = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  useEffect(() => {
    fetchSessions(true);
    const interval = setInterval(() => fetchSessions(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchSessions = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const data = await getAllSessions();
      setSessions(data.sort((a, b) => b.idSession - a.idSession));
    } catch {
      showSnackbar("Erreur lors du chargement des sessions.", "error");
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  // Derive available years from loaded sessions
  const availableYears = useMemo(() => {
    const years = sessions
      .map(s => s.dateDebut ? new Date(s.dateDebut).getFullYear() : null)
      .filter(y => y !== null);
    return [...new Set(years)].sort((a, b) => b - a);
  }, [sessions]);

  const handleEdit = (row) => {
    setEditingSession({
      ...row,
      idFormation:  row.idFormation,
      idEntreprise: row.idEntreprise,
      idFournisseur: row.idFournisseur,
      idFormateur:  row.idFormateur,
      statut:       row.statut,
    });
    setOpenSessionModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteSession(selectedSessionId);
      await fetchSessions(false);
      showSnackbar("Session supprimée avec succès !");
    } catch {
      showSnackbar("Impossible de supprimer cette session.", "error");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const handleExportExcel = () => {
    if (!sessions.length) { showSnackbar("Aucune session à exporter.", "warning"); return; }

    const sessionsData = sessions.map(s => ({
      "ID Session":          s.idSession,
      "Réf. session":        s.referenceSession,
      "Formation":           s.formation,
      "Entreprise":          s.entrepriseNom,
      "Fournisseur":         s.fournisseurNom,
      "Formateur":           s.formateurNomComplet,
      "Date début":          s.dateDebut,
      "Date fin":            s.dateFin,
      "Durée (h)":           s.dHeures,
      "Durée (j)":           s.dJours,
      "Statut":              s.statut,
      "Nombre participants": s.participants?.length || 0,
    }));

    const participantsData = [];
    sessions.forEach(s => {
      (s.participants || []).forEach(p => {
        participantsData.push({
          "ID Session":   s.idSession,
          "Réf. session": s.referenceSession,
          "Formation":    s.formation,
          "Nom":          p.nom,
          "Prénom":       p.prenom,
          "Email":        p.email,
          "Téléphone":    p.telephone,
          "Entreprise":   s.entrepriseNom,
        });
      });
    });

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sessionsData), "Sessions");
    XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(participantsData), "Participants");
    const today = new Date().toISOString().split("T")[0];
    saveAs(new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })],
      { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
      `Export_Sessions_IFMIA_${today}.xlsx`);
  };

  // Apply search + year filter
  const filteredRows = useMemo(() => sessions.filter(s => {
    const matchesSearch = s.formation?.toLowerCase().includes(search.toLowerCase());
    const matchesYear   = selectedYears.length === 0 || (
      s.dateDebut && selectedYears.includes(new Date(s.dateDebut).getFullYear())
    );
    return matchesSearch && matchesYear;
  }), [sessions, search, selectedYears]);

  const columns = [
    { field: "referenceSession",    headerName: "Réf. session", flex: 1, minWidth: 140 },
    { field: "formation",           headerName: "Formation",    flex: 1, minWidth: 160 },
    { field: "entrepriseNom",       headerName: "Entreprise",   flex: 1, minWidth: 140 },
    { field: "fournisseurNom",      headerName: "Fournisseur",  flex: 1, minWidth: 140 },
    { field: "formateurNomComplet", headerName: "Formateur",    flex: 1, minWidth: 140 },
    { field: "dateDebut",           headerName: "Début",        width: 120 },
    { field: "dateFin",             headerName: "Fin",          width: 120 },
    { field: "dHeures",             headerName: "Durée (h)",    width: 110 },
    { field: "dJours",              headerName: "Durée (j)",    width: 100 },
    { field: "statut",              headerName: "Statut",       width: 120 },
    {
      field: "participantsCount",
      headerName: "Participants",
      width: 130,
      renderCell: (params) => (
        <Button
          variant="outlined"
          size="small"
          onClick={() => { setEditingParticipantsSession(params.row); setOpenParticipantsPanel(true); }}
        >
          {params.row.participants?.length || 0}
        </Button>
      ),
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton color="primary" size="small" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => { setSelectedSessionId(params.row.idSession); setOpenDeleteDialog(true); }}>
            <DeleteIcon />
          </IconButton>
        </>
      ),
    },
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Sessions de Formation</Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            {/* Search */}
            <Grid size={{ xs: 12, md: 3 }}>
              <TextField
                fullWidth
                label="Rechercher par formation"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>

            {/* Buttons */}
            <Grid size={{ xs: 12, md: "auto" }} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              <Button variant="contained" onClick={() => { setEditingSession(null); setOpenSessionModal(true); }}>
                Créer session
              </Button>
              <Button variant="contained" sx={exportButtonSx} onClick={handleExportExcel}>
                Export Excel
              </Button>
            </Grid>

            {/* Year filter — right on desktop, full width on mobile */}
            <Grid size={{ xs: 12, md: "grow" }} sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
              <YearFilter
                availableYears={availableYears}
                selectedYears={selectedYears}
                onChange={setSelectedYears}
                loading={loading}
              />
            </Grid>
          </Grid>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={row => row.idSession}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
              initialState={{ pagination: { paginationModel: { pageSize: 20 } } }}
            />
          </Box>
        </CardContent>
      </Card>

      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>Êtes-vous sûr de vouloir supprimer cette session ?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      <SessionModal
        open={openSessionModal}
        onClose={() => setOpenSessionModal(false)}
        onSessionCreated={() => fetchSessions(false)}
        onCompleted={() => { setOpenSessionModal(false); setEditingSession(null); }}
        initialData={editingSession}
        showSnackbar={showSnackbar}
      />

      {editingParticipantsSession && (
        <ParticipantsModal
          open={openParticipantsModal}
          onClose={() => setOpenParticipantsModal(false)}
          preSelectedParticipants={editingParticipantsSession.participants || []}
          onSelectParticipants={async (selected) => {
            try {
              const oldIds = (editingParticipantsSession.participants || []).map(p => Number(p.idEmploye));
              const newIds = selected.map(p => Number(p.idEmploye));
              const toAdd    = newIds.filter(id => !oldIds.includes(id));
              const toRemove = oldIds.filter(id => !newIds.includes(id));
              if (toAdd.length > 0)    await addParticipantsToSession(editingParticipantsSession.idSession, toAdd);
              if (toRemove.length > 0) await removeParticipantsFromSession(editingParticipantsSession.idSession, toRemove);
              showSnackbar(`${selected.length} participants mis à jour avec succès !`);
              fetchSessions(false);
            } catch {
              showSnackbar("Erreur lors de la mise à jour des participants.", "error");
            } finally {
              setOpenParticipantsModal(false);
            }
          }}
        />
      )}

      <Dialog open={openParticipantsPanel} onClose={() => setOpenParticipantsPanel(false)} maxWidth="sm" fullWidth>
        <DialogContent>
          {editingParticipantsSession && (
            <SessionParticipantsPanel
              session={editingParticipantsSession}
              onClose={() => setOpenParticipantsPanel(false)}
              onUpdated={() => fetchSessions(false)}
              showSnackbar={showSnackbar}
            />
          )}
        </DialogContent>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar} anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SessionPage;
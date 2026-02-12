// frontend-template/vite/src/views/sessions/SessionPage.jsx
import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Button, IconButton,
  Snackbar, Alert, Dialog, DialogTitle, DialogContent, DialogActions
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";

import {
  getAllSessions,
  deleteSession,
  addParticipantsToSession
} from "../../api/sessionApi";

import { getAllFormateurs, getAllFormations, removeParticipantsFromSession } from "../../api/sessionApi";
import { getAllEntreprises } from "../../api/entrepriseApi";

import SessionModal from "./SessionModal";
import ParticipantsModal from "./ParticipantsModal";
import SessionParticipantsPanel from "./SessionParticipantsPanel";

const SessionPage = () => {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  // Modal states
  const [openSessionModal, setOpenSessionModal] = useState(false);
  const [editingSession, setEditingSession] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [openParticipantsModal, setOpenParticipantsModal] = useState(false);
  const [editingParticipantsSession, setEditingParticipantsSession] = useState(null);

  const [openParticipantsPanel, setOpenParticipantsPanel] = useState(false);


  // Dropdown lists
  const [formations, setFormations] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [entreprises, setEntreprises] = useState([]);

  // Snackbar
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // ---------------- Fetch Sessions and Lists ----------------
  useEffect(() => {
    fetchSessions();
    const fetchLists = async () => {
      try {
        const [f, fr, e] = await Promise.all([
          getAllFormations(),
          getAllFormateurs(),
          getAllEntreprises()
        ]);
        setFormations(f);
        setFormateurs(fr);
        setEntreprises(e);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLists();
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

  const handleEdit = (row) => {
    setEditingSession({
      ...row,
      idFormation: row.idFormation,
      idEntreprise: row.idEntreprise,
      idFournisseur: row.idFournisseur,
      idFormateur: row.idFormateur,
      statut: row.statut,
    });
    setOpenSessionModal(true);
  };

  const handleDelete = async () => {
    try {
      await deleteSession(selectedSessionId);
      setSessions(prev => prev.filter(s => s.idSession !== selectedSessionId));
      showSnackbar("Session supprimée avec succès !");
    } catch {
      showSnackbar("Impossible de supprimer cette session.", "error");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  const filteredRows = sessions.filter(s =>
    s.formation?.toLowerCase().includes(search.toLowerCase())
  );

  const columns = [
    { field: "referenceSession", headerName: "Réf. session", flex: 1, minWidth: 140, headerAlign: "center", align: "center" },
    { field: "formation", headerName: "Formation", flex: 1, minWidth: 160, headerAlign: "center", align: "center" },
    { field: "entrepriseNom", headerName: "Entreprise", flex: 1, minWidth: 140, headerAlign: "center", align: "center" },
    { field: "fournisseurNom", headerName: "Fournisseur", flex: 1, minWidth: 140, headerAlign: "center", align: "center" },
    { field: "formateurNomComplet", headerName: "Formateur", flex: 1, minWidth: 140, headerAlign: "center", align: "center" },
    { field: "dateDebut", headerName: "Début", width: 120, headerAlign: "center", align: "center" },
    { field: "dateFin", headerName: "Fin", width: 120, headerAlign: "center", align: "center" },
    { field: "dHeures", headerName: "Durée (h)", width: 110, headerAlign: "center", align: "center" },
    { field: "dJours", headerName: "Durée (j)", width: 100, headerAlign: "center", align: "center" },
    { field: "statut", headerName: "Statut", width: 120, headerAlign: "center", align: "center" },
    {
      field: "participantsCount",
      headerName: "Participants",
      width: 130,
      headerAlign: "center",
      align: "center",
      renderCell: (params) => (
      <Button
        variant="outlined"
        size="small"
        onClick={() => {
          setEditingParticipantsSession(params.row);
          setOpenParticipantsPanel(true); // open panel instead of modal
        }}
      >
        {params.row.participants?.length || 0}
      </Button>
    )
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 120,
      headerAlign: "center",
      align: "center",
      sortable: false,
      renderCell: (params) => (
        <>
          <IconButton color="primary" size="small" onClick={() => handleEdit(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" size="small" onClick={() => setSelectedSessionId(params.row.idSession) || setOpenDeleteDialog(true)}>
            <DeleteIcon />
          </IconButton>
        </>
      )
    }
  ];

  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>
        Sessions de Formation
      </Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid size={{xs:12, md:4}}>
              <TextField
                fullWidth
                label="Rechercher par formation"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>
            <Grid size={{xs:12, md:6, textAlign:"right"}}>
              <Button
                variant="contained"
                onClick={() => {
                  setEditingSession(null); 
                  setOpenSessionModal(true);
                }}
              >
                Créer session
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={row => row.idSession}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
            />
          </Box>
        </CardContent>
      </Card>

      {/* DELETE DIALOG */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>Êtes-vous sûr de vouloir supprimer cette session ?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* SESSION MODAL */}
      <SessionModal
        open={openSessionModal}
        onClose={() => setOpenSessionModal(false)}
        onSessionCreated={fetchSessions}
        onCompleted={() => {
          setOpenSessionModal(false);   // ✅ CLOSE SESSION MODAL
          setEditingSession(null);      // (optional but clean)
        }}
        initialData={editingSession}
        showSnackbar={showSnackbar}
      />

      {/* PARTICIPANTS MODAL */}
      {editingParticipantsSession && (
        <ParticipantsModal
          open={openParticipantsModal}
          onClose={() => setOpenParticipantsModal(false)}
          preSelectedParticipants={editingParticipantsSession.participants || []} 
          onSelectParticipants={async (selected) => {
            try {
              const oldIds = (editingParticipantsSession.participants || []).map(p => Number(p.idEmploye));
              const newIds = selected.map(p => Number(p.idEmploye));

              // Participants to add
              const toAdd = newIds.filter(id => !oldIds.includes(id));
              // Participants to remove
              const toRemove = oldIds.filter(id => !newIds.includes(id));

              

              // Call API to add participants
              if (toAdd.length > 0) {
                await addParticipantsToSession(editingParticipantsSession.idSession, toAdd);
                console.log(`${toAdd.length} participants added`);
              }

              // Call API to remove participants (assuming you have this endpoint)
              if (toRemove.length > 0) {
                await removeParticipantsFromSession(editingParticipantsSession.idSession, toRemove);
                console.log(`${toRemove.length} participants removed`);
              }

              showSnackbar(`${selected.length} participants mis à jour avec succès !`);
              fetchSessions(); // refresh session list and participant counts
            } catch (err) {
              console.error("Erreur lors de la mise à jour des participants:", err);
              showSnackbar("Erreur lors de la mise à jour des participants.", "error");
            } finally {
              setOpenParticipantsModal(false);
            }
          }}
        />
      )}

      {/* PARTICIPANTS PANEL DIALOG */}
      <Dialog
        open={openParticipantsPanel}
        onClose={() => setOpenParticipantsPanel(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogContent>
          {editingParticipantsSession && (
            <SessionParticipantsPanel
              session={editingParticipantsSession}
              onClose={() => setOpenParticipantsPanel(false)}
              onUpdated={fetchSessions} // refresh the session list after add/remove
              showSnackbar={showSnackbar} // pass snackbar to show messages
            />
          )}
        </DialogContent>
      </Dialog>



      {/* SNACKBAR */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SessionPage;

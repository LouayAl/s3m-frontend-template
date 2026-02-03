// frontend-template/vite/src/views/sessions/SessionParticipantsPanel.jsx
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, IconButton,
  Stack, Dialog, DialogTitle, DialogContent, DialogActions,
  Snackbar, Alert
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";

import ParticipantsModal from "./ParticipantsModal";
import { getSessionParticipants, addParticipantsToSession, removeParticipantsFromSession, getAllEmployees } from "../../api/sessionApi";

const SessionParticipantsPanel = ({ session, onClose, onUpdated, showSnackbar }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add participants modal
  const [openAddModal, setOpenAddModal] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);

  // Delete confirmation dialog
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);

  // Fetch participants when panel opens
  useEffect(() => {
    fetchParticipants();
  }, [session]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const data = await getSessionParticipants(session.idSession);
      setParticipants(data);
    } catch (err) {
      console.error("Erreur lors du chargement des participants :", err);
      showSnackbar?.("Impossible de charger les participants.", "error");
    } finally {
      setLoading(false);
    }
  };

  // Open modal and filter out already assigned participants
  const handleOpenAddModal = async () => {
    try {
      const allEmployees = await getAllEmployees();
      const assignedIds = participants.map(p => p.idEmploye);
      const filtered = allEmployees.filter(emp => !assignedIds.includes(emp.idEmploye));
      setAvailableEmployees(filtered);
      setOpenAddModal(true);
    } catch (err) {
      console.error("Erreur lors du chargement des employés :", err);
      showSnackbar?.("Impossible de charger les employés.", "error");
    }
  };

  // Add selected participants
  const handleAddParticipants = async (selected) => {
    try {
      const newIds = selected.map(p => p.idEmploye);
      if (newIds.length === 0) return;

      await addParticipantsToSession(session.idSession, newIds);
      setParticipants(prev => [...prev, ...selected]);
      showSnackbar?.(`${selected.length} participant(s) ajouté(s) avec succès !`);
      onUpdated?.(); // refresh parent data if needed
    } catch (err) {
      console.error("Erreur lors de l'ajout des participants :", err);
      showSnackbar?.("Impossible d'ajouter les participants.", "error");
    } finally {
      setOpenAddModal(false);
    }
  };

  // Delete participant
  const handleDeleteClick = (p) => {
    setParticipantToDelete(p);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!participantToDelete) return;
    try {
      await removeParticipantsFromSession(session.idSession, [participantToDelete.idEmploye]);
      setParticipants(prev => prev.filter(p => p.idEmploye !== participantToDelete.idEmploye));
      showSnackbar?.(`${participantToDelete.nom} ${participantToDelete.prenom} supprimé avec succès !`);
      onUpdated?.();
    } catch (err) {
      console.error("Erreur lors de la suppression du participant :", err);
      showSnackbar?.("Impossible de supprimer ce participant.", "error");
    } finally {
      setConfirmDeleteOpen(false);
      setParticipantToDelete(null);
    }
  };

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2}>
        Participants de la session "{session.referenceSession}"
      </Typography>

      {loading ? (
        <Typography>Chargement des participants...</Typography>
      ) : (
        <Stack spacing={1}>
          {participants.length === 0 && <Typography>Aucun participant assigné.</Typography>}
          {participants.map(p => (
            <Box key={p.idEmploye} display="flex" justifyContent="space-between" alignItems="center">
              <Typography>{p.nom} {p.prenom}</Typography>
              <IconButton color="error" size="small" onClick={() => handleDeleteClick(p)}>
                <DeleteIcon />
              </IconButton>
            </Box>
          ))}
        </Stack>
      )}

      <Box mt={2} display="flex" justifyContent="flex-end">
        <Button variant="contained" onClick={handleOpenAddModal}>Ajouter des participants</Button>
      </Box>

      {/* Add Participants Modal */}
      {openAddModal && (
        <ParticipantsModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          preSelectedParticipants={[]} // new participants, none preselected
          employeesList={availableEmployees} // only show unassigned employees
          onSelectParticipants={handleAddParticipants}
        />
      )}

      {/* Delete confirmation dialog */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Confirmer la suppression</DialogTitle>
        <DialogContent>
          Êtes-vous sûr de vouloir supprimer {participantToDelete?.nom} {participantToDelete?.prenom} ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionParticipantsPanel;

// frontend-template/vite/src/views/sessions/SessionModal.jsx
import { useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField
} from "@mui/material";
import FormationModal from "./FormationModal";
import ParticipantsModal from "./ParticipantsModal";

const SessionModal = ({
  open,
  onClose,
  onSave,
  initialData = {}
}) => {
  const [newSessionData, setNewSessionData] = useState({
    referenceSession: "",
    formation: "",
    idFormation: null,
    entreprise: "",
    idEntreprise: null,
    fournisseur: "",
    idFournisseur: null,
    formateurNomComplet: "",
    idFormateur: null,
    dateDebut: null,
    dateFin: null,
    dHeures: null,
    dJours: null,
    statut: "PLANIFIEE",
    participants: [],
    ...initialData
  });

  const [openFormationModal, setOpenFormationModal] = useState(false);
  const [openParticipantsModal, setOpenParticipantsModal] = useState(false);

  const handleSaveClick = () => {
    onSave(newSessionData);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Créer / Modifier une Session de Formation</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Référence session"
            fullWidth
            value={newSessionData.referenceSession}
            onChange={(e) => setNewSessionData(prev => ({ ...prev, referenceSession: e.target.value }))}
          />

          <Button variant="outlined" onClick={() => setOpenFormationModal(true)}>
            {newSessionData.formation ? newSessionData.formation : "Choisir Formation"}
          </Button>

          <TextField
            label="Durée (heures)"
            type="number"
            fullWidth
            value={newSessionData.dHeures ?? ""}
            onChange={(e) => setNewSessionData(prev => ({ ...prev, dHeures: Number(e.target.value) }))}
          />

          <TextField
            label="Durée (jours)"
            type="number"
            fullWidth
            value={newSessionData.dJours ?? ""}
            onChange={(e) => setNewSessionData(prev => ({ ...prev, dJours: Number(e.target.value) }))}
          />

          <Button variant="outlined" onClick={() => setOpenParticipantsModal(true)}>
            {newSessionData.participants.length > 0
              ? `${newSessionData.participants.length} participants sélectionnés`
              : "Choisir Participants"}
          </Button>
        </Stack>

        {/* Formation Modal */}
        <FormationModal
          open={openFormationModal}
          onClose={() => setOpenFormationModal(false)}
          onFormationSelected={(formation) => {
            setNewSessionData(prev => ({
              ...prev,
              formation: formation.module,
              idFormation: formation.id,
              dHeures: formation.dureeHeures,   // auto-fill
              dJours: formation.dureeJours      // auto-fill
            }));
            setOpenFormationModal(false);
          }}
        />

        {/* Participants Modal */}
        <ParticipantsModal
          open={openParticipantsModal}
          onClose={() => setOpenParticipantsModal(false)}
          onSelectParticipants={(selected) => {
            setNewSessionData(prev => ({ ...prev, participants: selected }));
            setOpenParticipantsModal(false);
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" color="primary" onClick={handleSaveClick}>Créer</Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionModal;

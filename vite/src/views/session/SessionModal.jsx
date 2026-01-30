// frontend-template/vite/src/views/sessions/SessionModal.jsx
import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stack,
  TextField,
  MenuItem,
} from "@mui/material";
import FormationModal from "./FormationModal";
import ParticipantsModal from "./ParticipantsModal";
import { createSession, addParticipantsToSession } from "../../api/sessionApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import { getAllFormateurs } from "../../api/sessionApi";

const SessionModal = ({ open, onClose, onSessionCreated, showSnackbar, initialData = {} }) => {
  const [newSessionData, setNewSessionData] = useState({
    referenceSession: "",
    idFormation: null,
    formation: "",
    idEntreprise: null,
    entreprise: "",
    idFournisseur: null,
    fournisseur: "",
    idFormateur: null,
    formateurNomComplet: "",
    dateDebut: "",
    dateFin: "",
    dHeures: "",
    dJours: "",
    statut: "PLANIFIEE",
    participants: [],
    ...initialData,
  });

  const [openFormationModal, setOpenFormationModal] = useState(false);
  const [openParticipantsModal, setOpenParticipantsModal] = useState(false);
  const [entreprises, setEntreprises] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load entreprises and formateurs on mount
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [e, f] = await Promise.all([getAllEntreprises(), getAllFormateurs()]);
        setEntreprises(e);
        setFormateurs(f);
      } catch (err) {
        console.error("Erreur loading entreprises/formateurs:", err);
      }
    };
    fetchData();
  }, []);

  // Auto-calculate dJours from dHeures
  useEffect(() => {
    if (newSessionData.dHeures) {
      setNewSessionData(prev => ({ ...prev, dJours: +(prev.dHeures / 8).toFixed(2) }));
    }
  }, [newSessionData.dHeures]);

  const handleSaveClick = async () => {
    if (!newSessionData.idFormation || !newSessionData.idEntreprise || !newSessionData.idFormateur || !newSessionData.dateDebut || !newSessionData.dateFin) {
      showSnackbar("Veuillez remplir tous les champs obligatoires.", "error");
      return;
    }

    if (newSessionData.dateFin < newSessionData.dateDebut) {
      showSnackbar("La date de fin doit être après la date de début.", "error");
      return;
    }

    try {
      setSaving(true);

      // 1️⃣ Create session
      const sessionPayload = {
        referenceSession: newSessionData.referenceSession,
        idFormation: newSessionData.idFormation,
        idEntreprise: newSessionData.idEntreprise,
        idFournisseur: newSessionData.idFournisseur,
        idFormateur: newSessionData.idFormateur,
        dateDebut: newSessionData.dateDebut,
        dateFin: newSessionData.dateFin,
        dHeures: newSessionData.dHeures,
        dJours: newSessionData.dJours,
        statut: newSessionData.statut,
      };

      const createdSession = await createSession(sessionPayload);

      // 2️⃣ Add participants if any
      if (newSessionData.participants.length > 0) {
        const participantIds = newSessionData.participants.map(p => p.idEmploye ?? p.id);
        await addParticipantsToSession(createdSession.idSession, participantIds);
      }

      // 3️⃣ Notify parent and show snackbar
      onSessionCreated?.(createdSession);
      showSnackbar("Session créée avec succès !");

      // 4️⃣ Reset modal
      setNewSessionData({
        referenceSession: "",
        idFormation: null,
        formation: "",
        idEntreprise: null,
        entreprise: "",
        idFournisseur: null,
        fournisseur: "",
        idFormateur: null,
        formateurNomComplet: "",
        dateDebut: "",
        dateFin: "",
        dHeures: "",
        dJours: "",
        statut: "PLANIFIEE",
        participants: [],
      });

      onClose();
    } catch (err) {
      console.error("Erreur création session:", err);
      showSnackbar("Erreur lors de la création de la session.", "error");
    } finally {
      setSaving(false);
    }
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
            onChange={e => setNewSessionData(prev => ({ ...prev, referenceSession: e.target.value }))}
          />

          <Button variant="outlined" onClick={() => setOpenFormationModal(true)}>
            {newSessionData.formation || "Choisir Formation"}
          </Button>

          <TextField
            select
            label="Entreprise"
            fullWidth
            value={newSessionData.idEntreprise || ""}
            onChange={e => {
              const selected = entreprises.find(en => en.idEntreprise === e.target.value);
              setNewSessionData(prev => ({
                ...prev,
                idEntreprise: e.target.value,
                entreprise: selected?.nomEntreprise ?? "",
              }));
            }}
          >
            {entreprises.map(en => (
              <MenuItem key={en.idEntreprise} value={en.idEntreprise}>{en.nomEntreprise}</MenuItem>
            ))}
          </TextField>
          <TextField
            select
            label="Fournisseur"
            fullWidth
            value={newSessionData.idFournisseur || ""}
            onChange={e => {
              const selected = entreprises.find(en => en.idEntreprise === e.target.value);
              setNewSessionData(prev => ({
                ...prev,
                idFournisseur: e.target.value,
                fournisseur: selected?.nomEntreprise ?? ""
              }));
            }}
          >
            {entreprises.map(en => (
              <MenuItem key={en.idEntreprise} value={en.idEntreprise}>
                {en.nomEntreprise}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            select
            label="Formateur"
            fullWidth
            value={newSessionData.idFormateur || ""}
            onChange={e => {
              const selected = formateurs.find(f => f.idFormateur === e.target.value);
              setNewSessionData(prev => ({
                ...prev,
                idFormateur: e.target.value,
                formateurNomComplet: selected ? `${selected.nom} ${selected.prenom}` : "",
              }));
            }}
          >
            {formateurs.map(f => (
              <MenuItem key={f.idFormateur} value={f.idFormateur}>{f.nom} {f.prenom}</MenuItem>
            ))}
          </TextField>

          <TextField
            label="Durée (heures)"
            type="number"
            fullWidth
            value={newSessionData.dHeures || ""}
            onChange={e => setNewSessionData(prev => ({ ...prev, dHeures: Number(e.target.value) }))}
          />

          <TextField
            label="Durée (jours)"
            type="number"
            fullWidth
            value={newSessionData.dJours || ""}
            onChange={e => setNewSessionData(prev => ({ ...prev, dJours: Number(e.target.value) }))}
          />

          <TextField
            label="Date début"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={newSessionData.dateDebut || ""}
            onChange={e => setNewSessionData(prev => ({ ...prev, dateDebut: e.target.value }))}
          />

          <TextField
            label="Date fin"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            inputProps={{ min: newSessionData.dateDebut || "" }}
            value={newSessionData.dateFin || ""}
            onChange={e => setNewSessionData(prev => ({ ...prev, dateFin: e.target.value }))}
          />

          <Button variant="outlined" onClick={() => setOpenParticipantsModal(true)}>
            {newSessionData.participants.length > 0
              ? `${newSessionData.participants.length} participant(s) sélectionné(s)`
              : "Choisir Participants"}
          </Button>
        </Stack>

        <FormationModal
          open={openFormationModal}
          onClose={() => setOpenFormationModal(false)}
          onFormationSelected={formation => {
            setNewSessionData(prev => ({
              ...prev,
              idFormation: formation.id,
              formation: formation.module,
              dHeures: formation.dureeHeures,
              dJours: formation.dureeJours,
            }));
            setOpenFormationModal(false);
          }}
        />

        <ParticipantsModal
          open={openParticipantsModal}
          onClose={() => setOpenParticipantsModal(false)}
          onSelectParticipants={selected => {
            setNewSessionData(prev => ({ ...prev, participants: selected }));
            setOpenParticipantsModal(false);
          }}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Annuler</Button>
        <Button variant="contained" color="primary" onClick={handleSaveClick} disabled={saving}>
          {saving ? "Création..." : "Créer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default SessionModal;

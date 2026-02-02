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
import { 
  createSession, 
  getAllFormateurs, 
  addParticipantsToSession 
} from "../../api/sessionApi";
import { getAllEntreprises } from "../../api/entrepriseApi";

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
    ...initialData,
  });

  const [createdSession, setCreatedSession] = useState(null);
  const [openFormationModal, setOpenFormationModal] = useState(false);
  const [openParticipantsModal, setOpenParticipantsModal] = useState(false);
  const [entreprises, setEntreprises] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [saving, setSaving] = useState(false);

  // Load entreprises and formateurs
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

  // Auto-generate reference when formation is selected
  useEffect(() => {
    if (newSessionData.idFormation && newSessionData.formation) {
      const generatedRef = `${newSessionData.formation.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*9000+1000)}`;
      setNewSessionData(prev => ({ ...prev, referenceSession: generatedRef }));
    }
  }, [newSessionData.idFormation, newSessionData.formation]);

  // Create session
  const handleSaveSession = async () => {
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

      const sessionPayload = {
        referenceSession: newSessionData.referenceSession,
        idFormation: newSessionData.idFormation,
        idEntreprise: newSessionData.idEntreprise,
        idFournisseur: newSessionData.idFournisseur,
        idFormateur: newSessionData.idFormateur,
        dateDebut: newSessionData.dateDebut,
        dateFin: newSessionData.dateFin,
        dHeures: Number(newSessionData.dHeures),
        dJours: Number(newSessionData.dJours),
        statut: newSessionData.statut,
      };

      console.log("📤 Creating session:", sessionPayload);
      const session = await createSession(sessionPayload);
      console.log("✅ Session created:", session);

      setCreatedSession(session);
      onSessionCreated?.(session);
      showSnackbar("Session créée avec succès !");
    } catch (err) {
      console.error("Erreur création session:", err);
      showSnackbar("Erreur lors de la création de la session.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{createdSession ? "Ajouter des participants" : "Créer une Session de Formation"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {!createdSession && (
            <>
              <Button variant="outlined" onClick={() => setOpenFormationModal(true)}>
                {newSessionData.formation || "Choisir Formation"}
              </Button>

              <TextField
                label="Référence session"
                fullWidth
                value={newSessionData.referenceSession}
                onChange={e => setNewSessionData(prev => ({ ...prev, referenceSession: e.target.value }))}
              />

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
                  <MenuItem key={en.idEntreprise} value={en.idEntreprise}>{en.nomEntreprise}</MenuItem>
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
            </>
          )}

          {/* Show Add Participants button only after session is created */}
          {createdSession && (
            <Button
              variant="outlined"
              onClick={() => setOpenParticipantsModal(true)}
            >
              Ajouter des participants
            </Button>
          )}
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
          onSelectParticipants={async (selected) => {
            console.log("📤 Participants selected in modal:", selected);

            // Update local state
            setNewSessionData(prev => ({ ...prev, participants: selected }));
            setOpenParticipantsModal(false);

            // Add participants to backend if session already created
            if (createdSession && selected.length > 0) {
              try {
                const participantIds = selected.map(p => p.idEmploye);
                console.log("📤 Adding participants to session:", participantIds);
                await addParticipantsToSession(createdSession.idSession, participantIds);
                showSnackbar(`${participantIds.length} participants ajoutés avec succès !`);
              } catch (err) {
                console.error("Erreur lors de l'ajout des participants :", err);
                showSnackbar("Erreur lors de l'ajout des participants.", "error");
              }
            }
          }}
          sessionId={createdSession?.idSession}
          showSnackbar={showSnackbar}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Annuler</Button>
        {!createdSession && (
          <Button variant="contained" color="primary" onClick={handleSaveSession} disabled={saving}>
            {saving ? "Création..." : "Créer"}
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SessionModal;

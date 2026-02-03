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
  updateSession,
  getAllFormateurs,
  updateParticipants,
} from "../../api/sessionApi";
import { getAllEntreprises } from "../../api/entrepriseApi";

const SessionModal = ({ open, onClose, onSessionCreated, onCompleted, showSnackbar, initialData = null }) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState({
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

  const [entreprises, setEntreprises] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [openFormationModal, setOpenFormationModal] = useState(false);
  const [openParticipantsModal, setOpenParticipantsModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newSessionCreated, setNewSessionCreated] = useState(null);

  // Load entreprises and formateurs
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [e, f] = await Promise.all([getAllEntreprises(), getAllFormateurs()]);
        setEntreprises(e);
        setFormateurs(f);
      } catch (err) {
        console.error(err);
      }
    };
    fetchLists();
  }, []);

  // Initialize form with initialData if editing
  useEffect(() => {
    if (initialData) {
      setFormData({
        referenceSession: initialData.referenceSession || "",
        idFormation: initialData.idFormation || null,
        formation: initialData.formation || "",
        idEntreprise: initialData.idEntreprise || null,
        entreprise: initialData.entreprise || "",
        idFournisseur: initialData.idFournisseur || null,
        fournisseur: initialData.fournisseur || "",
        idFormateur: initialData.idFormateur || null,
        formateurNomComplet: initialData.formateurNomComplet || "",
        dateDebut: initialData.dateDebut || "",
        dateFin: initialData.dateFin || "",
        dHeures: initialData.dHeures || "",
        dJours: initialData.dJours || "",
        statut: initialData.statut || "PLANIFIEE",
        participants: initialData.participants || [],
      });
    }
  }, [initialData]);

  // Auto-generate reference when formation changes (only if empty or creating)
  useEffect(() => {
    if (formData.idFormation && formData.formation && (!formData.referenceSession || !isEdit)) {
      const ref = `${formData.formation.substring(0, 3).toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;
      setFormData(prev => ({ ...prev, referenceSession: ref }));
    }
  }, [formData.idFormation, formData.formation, isEdit]);

  const handleSave = async () => {
    // Validation
    if (!formData.idFormation || !formData.idEntreprise || !formData.idFournisseur || !formData.idFormateur || !formData.dateDebut || !formData.dateFin) {
      showSnackbar("Veuillez remplir tous les champs obligatoires.", "error");
      return;
    }
    if (formData.dateFin < formData.dateDebut) {
      showSnackbar("La date de fin doit être après la date de début.", "error");
      return;
    }

    const payload = {
      referenceSession: formData.referenceSession,
      idFormation: formData.idFormation,
      idEntreprise: formData.idEntreprise,
      idFournisseur: formData.idFournisseur,
      idFormateur: formData.idFormateur,
      dateDebut: formData.dateDebut,
      dateFin: formData.dateFin,
      dHeures: Number(formData.dHeures),
      dJours: Number(formData.dJours),
      statut: formData.statut,
    };

    try {
      setSaving(true);

      let sessionId;
      if (isEdit) {
        // Update session
        await updateSession(initialData.idSession, payload);
        sessionId = initialData.idSession;
        showSnackbar("Session mise à jour avec succès !");
      } else {
        // Create session
        const created = await createSession(payload);
        sessionId = created.idSession;
        setNewSessionCreated(created);
        showSnackbar("Session créée avec succès !");
      }

      // Update participants if any
      if (formData.participants?.length > 0) {
        const participantIds = formData.participants.map(p => p.idEmploye);
        await updateParticipants(sessionId, participantIds);
        showSnackbar(`${participantIds.length} participants mis à jour avec succès !`);
      }

      // Notify parent to refresh session list
      onSessionCreated?.();
    } catch (err) {
      console.error(err);
      showSnackbar(isEdit ? "Erreur lors de la mise à jour." : "Erreur lors de la création.", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>{isEdit ? "Modifier une Session de Formation" : "Créer une Session de Formation"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {/* Formation */}
          <Button variant="outlined" onClick={() => setOpenFormationModal(true)}>
            {formData.formation || "Choisir Formation"}
          </Button>

          {/* Référence */}
          <TextField
            label="Référence session"
            fullWidth
            value={formData.referenceSession}
            onChange={e => setFormData(prev => ({ ...prev, referenceSession: e.target.value }))}
          />

          {/* Entreprise */}
          <TextField
            select
            label="Entreprise"
            fullWidth
            value={formData.idEntreprise || ""}
            onChange={e => {
              const selected = entreprises.find(en => en.idEntreprise === e.target.value);
              setFormData(prev => ({ ...prev, idEntreprise: e.target.value, entreprise: selected?.nomEntreprise ?? "" }));
            }}
          >
            {entreprises.map(en => (
              <MenuItem key={en.idEntreprise} value={en.idEntreprise}>{en.nomEntreprise}</MenuItem>
            ))}
          </TextField>

          {/* Fournisseur */}
          <TextField
            select
            label="Fournisseur"
            fullWidth
            value={formData.idFournisseur || ""}
            onChange={e => {
              const selected = entreprises.find(en => en.idEntreprise === e.target.value);
              setFormData(prev => ({ ...prev, idFournisseur: e.target.value, fournisseur: selected?.nomEntreprise ?? "" }));
            }}
          >
            {entreprises.map(en => (
              <MenuItem key={en.idEntreprise} value={en.idEntreprise}>{en.nomEntreprise}</MenuItem>
            ))}
          </TextField>

          {/* Formateur */}
          <TextField
            select
            label="Formateur"
            fullWidth
            value={formData.idFormateur || ""}
            onChange={e => {
              const selected = formateurs.find(f => f.idFormateur === e.target.value);
              setFormData(prev => ({ ...prev, idFormateur: e.target.value, formateurNomComplet: selected ? `${selected.nom} ${selected.prenom}` : "" }));
            }}
          >
            {formateurs.map(f => (
              <MenuItem key={f.idFormateur} value={f.idFormateur}>{f.nom} {f.prenom}</MenuItem>
            ))}
          </TextField>

          {/* Durée */}
          <TextField
            label="Durée (heures)"
            type="number"
            fullWidth
            value={formData.dHeures}
            onChange={e => setFormData(prev => ({ ...prev, dHeures: e.target.value }))}
          />
          <TextField
            label="Durée (jours)"
            type="number"
            fullWidth
            value={formData.dJours}
            onChange={e => setFormData(prev => ({ ...prev, dJours: e.target.value }))}
          />

          {/* Dates */}
          <TextField
            label="Date début"
            type="date"
            InputLabelProps={{ shrink: true }}
            fullWidth
            value={formData.dateDebut}
            onChange={e => setFormData(prev => ({ ...prev, dateDebut: e.target.value }))}
          />
          <TextField
            label="Date fin"
            type="date"
            InputLabelProps={{ shrink: true }}
            inputProps={{ min: formData.dateDebut || "" }}
            fullWidth
            value={formData.dateFin}
            onChange={e => setFormData(prev => ({ ...prev, dateFin: e.target.value }))}
          />

          {/* Statut */}
          <TextField
            select
            label="Statut"
            fullWidth
            value={formData.statut}
            onChange={e => setFormData(prev => ({ ...prev, statut: e.target.value }))}
          >
            {["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"].map(status => (
              <MenuItem key={status} value={status}>{status}</MenuItem>
            ))}
          </TextField>
        </Stack>

        {/* Formation Modal */}
        <FormationModal
          open={openFormationModal}
          onClose={() => setOpenFormationModal(false)}
          onFormationSelected={formation => {
            setFormData(prev => ({
              ...prev,
              idFormation: formation.id,
              formation: formation.module,
              dHeures: formation.dureeHeures,
              dJours: formation.dureeJours,
            }));
            if (!isEdit) {
              const ref = `${formation.module.substring(0,3).toUpperCase()}-${Math.floor(Math.random()*9000+1000)}`;
              setFormData(prev => ({ ...prev, referenceSession: ref }));
            }
            setOpenFormationModal(false);
          }}
        />

        {/* Participants Modal */}
        <ParticipantsModal
          open={openParticipantsModal}
          onClose={() => setOpenParticipantsModal(false)}
          preSelectedParticipants={formData.participants || []}
          onSelectParticipants={async (selected) => {
            setFormData(prev => ({ ...prev, participants: selected }));
            setOpenParticipantsModal(false);

            try {
              const participantIds = selected.map(p => p.idEmploye);
              const sessionIdToUpdate = isEdit ? initialData.idSession : newSessionCreated.idSession;
              await updateParticipants(sessionIdToUpdate, participantIds);
              showSnackbar(`${participantIds.length} participants mis à jour avec succès !`);
              // ✅ CLOSE MODAL AFTER SUCCESS
              setOpenParticipantsModal(false);
              onCompleted?.();
            } catch (err) {
              console.error(err);
              showSnackbar("Erreur lors de la mise à jour des participants.", "error");
            }
          }}
          sessionId={isEdit ? initialData.idSession : newSessionCreated?.idSession}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Annuler</Button>
        <Button variant="contained" color="primary" onClick={handleSave} disabled={saving}>
          {saving ? (isEdit ? "Mise à jour..." : "Création...") : (isEdit ? "Mettre à jour" : "Créer")}
        </Button>
        {newSessionCreated && (
          <Button
            variant="outlined"
            color="primary"
            onClick={() => setOpenParticipantsModal(true)}
          >
            Ajouter Participants à cette session
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SessionModal;

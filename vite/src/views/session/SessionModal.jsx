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

const SessionModal = ({
  open,
  onClose,
  onSessionCreated,
  showSnackbar,
  initialData = null,
}) => {
  const isEdit = Boolean(initialData);

  // ==========================
  // ✅ DEFAULT EMPTY FORM
  // ==========================
  const emptyForm = {
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
  };

  const [formData, setFormData] = useState(emptyForm);

  const [entreprises, setEntreprises] = useState([]);
  const [formateurs, setFormateurs] = useState([]);

  const [openFormationModal, setOpenFormationModal] = useState(false);
  const [openParticipantsModal, setOpenParticipantsModal] = useState(false);

  const [saving, setSaving] = useState(false);

  // ✅ Stores session after creation
  const [createdSession, setCreatedSession] = useState(null);

  // ==========================
  // ✅ LOAD LISTS ONCE
  // ==========================
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [e, f] = await Promise.all([
          getAllEntreprises(),
          getAllFormateurs(),
        ]);

        setEntreprises(e);
        setFormateurs(f);
      } catch (err) {
        console.error(err);
      }
    };

    fetchLists();
  }, []);

  // ==========================
  // ✅ RESET FORM ON OPEN
  // ==========================
  useEffect(() => {
    if (!open) return;

    if (isEdit) {
      // EDIT MODE → preload values
      setFormData({
        ...emptyForm,
        ...initialData,
        idFormation: Number(initialData.idFormation),
        idEntreprise: Number(initialData.idEntreprise),
        idFournisseur: Number(initialData.idFournisseur),
        idFormateur: Number(initialData.idFormateur),
        participants: initialData.participants || [],
      });

      setCreatedSession(null);
    } else {
      // CREATE MODE → reset clean
      setFormData(emptyForm);
      setCreatedSession(null);
    }
  }, [open, initialData]);

  // ==========================
  // ✅ AUTO REFERENCE GENERATION
  // ==========================
  useEffect(() => {
    if (!formData.idFormation || isEdit) return;

    if (!formData.referenceSession && formData.formation) {
      const ref = `${formData.formation
        .substring(0, 3)
        .toUpperCase()}-${Math.floor(Math.random() * 9000 + 1000)}`;

      setFormData((prev) => ({
        ...prev,
        referenceSession: ref,
      }));
    }
  }, [formData.idFormation, formData.formation]);

  // ==========================
  // ✅ SAVE SESSION
  // ==========================
  const handleSave = async () => {
    // Validation only for CREATE
    if (!isEdit && !createdSession) {
      if (
        !formData.idFormation ||
        !formData.idEntreprise ||
        !formData.idFournisseur ||
        !formData.idFormateur ||
        !formData.dateDebut ||
        !formData.dateFin
      ) {
        showSnackbar("Veuillez remplir tous les champs obligatoires.", "error");
        return;
      }
    }

    // Date validation
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

      // ==========================
      // ✅ EDIT MODE → UPDATE + CLOSE
      // ==========================
      if (isEdit) {
        await updateSession(initialData.idSession, payload);

        showSnackbar("Session mise à jour avec succès !");
        onSessionCreated?.();
        onClose();
        return;
      }

      // ==========================
      // ✅ CREATE MODE → CREATE + KEEP OPEN
      // ==========================
      if (!createdSession) {
        const created = await createSession(payload);

        setCreatedSession(created);

        showSnackbar(
          "Session créée ! Vous pouvez maintenant ajouter des participants."
        );

        // Refresh list (count still 0 until participants added)
        onSessionCreated?.();
        return;
      }
    } catch (err) {
      console.error(err);
      showSnackbar("Erreur lors de l'enregistrement.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ==========================
  // ✅ PARTICIPANTS SAVE
  // ==========================
  const handleParticipantsSave = async (selected) => {
    try {
      const participantIds = selected.map((p) => p.idEmploye);

      const sessionId =
        isEdit ? initialData.idSession : createdSession.idSession;

      await updateParticipants(sessionId, participantIds);

      setFormData((prev) => ({
        ...prev,
        participants: selected,
      }));

      showSnackbar(`${participantIds.length} participants ajoutés !`);

      // ✅ Refresh table → count updates instantly
      onSessionCreated?.();
      onClose();
    } catch (err) {
      console.error(err);
      showSnackbar("Erreur lors de la mise à jour des participants.", "error");
    }
  };

  // ==========================
  // ✅ RENDER
  // ==========================
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>
        {isEdit ? "Modifier une Session" : "Créer une Session"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={2}>
          {/* Formation */}
          <Button
            variant="outlined"
            onClick={() => setOpenFormationModal(true)}
          >
            {formData.formation || "Choisir Formation"}
          </Button>

          {/* Reference */}
          <TextField
            label="Référence"
            value={formData.referenceSession}
            fullWidth
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                referenceSession: e.target.value,
              }))
            }
          />

          {/* Entreprise */}
          <TextField
            select
            label="Entreprise"
            value={formData.idEntreprise || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                idEntreprise: Number(e.target.value),
              }))
            }
          >
            {entreprises.map((en) => (
              <MenuItem key={en.idEntreprise} value={en.idEntreprise}>
                {en.nomEntreprise}
              </MenuItem>
            ))}
          </TextField>

          {/* Fournisseur */}
          <TextField
            select
            label="Fournisseur"
            value={formData.idFournisseur || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                idFournisseur: Number(e.target.value),
              }))
            }
          >
            {entreprises.map((en) => (
              <MenuItem key={en.idEntreprise} value={en.idEntreprise}>
                {en.nomEntreprise}
              </MenuItem>
            ))}
          </TextField>

          {/* Formateur */}
          <TextField
            select
            label="Formateur"
            value={formData.idFormateur || ""}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                idFormateur: Number(e.target.value),
              }))
            }
          >
            {formateurs.map((f) => (
              <MenuItem key={f.idFormateur} value={f.idFormateur}>
                {f.nom} {f.prenom}
              </MenuItem>
            ))}
          </TextField>

          {/* Dates */}
          <TextField
            type="date"
            label="Date début"
            InputLabelProps={{ shrink: true }}
            value={formData.dateDebut}
            onChange={(e) => {
              const newStart = e.target.value;

              setFormData((prev) => ({
                ...prev,
                dateDebut: newStart,

                // ✅ Reset dateFin if it's before the new dateDebut
                dateFin:
                  prev.dateFin && prev.dateFin < newStart
                    ? ""
                    : prev.dateFin,
              }));
            }}
          />

          <TextField
            type="date"
            label="Date fin"
            InputLabelProps={{ shrink: true }}

            // ✅ Prevent selecting before dateDebut
            inputProps={{
              min: formData.dateDebut || "",
            }}

            value={formData.dateFin}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                dateFin: e.target.value,
              }))
            }
          />
          {/* Statut */}
          <TextField
            select
            label="Statut"
            fullWidth
            disabled={!isEdit} // Can't change status on create
            value={formData.statut}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                statut: e.target.value,
              }))
            }
          >
            {["PLANIFIEE", "EN_COURS", "TERMINEE", "ANNULEE"].map((status) => (
              <MenuItem key={status} value={status}>
                {status}
              </MenuItem>
            ))}
          </TextField>

        </Stack>

        {/* Formation Modal */}
        <FormationModal
          open={openFormationModal}
          onClose={() => setOpenFormationModal(false)}
          onFormationSelected={(formation) => {
            setFormData((prev) => ({
              ...prev,
              idFormation: formation.id,
              formation: formation.module,
              dHeures: formation.dureeHeures,
              dJours: formation.dureeJours,
            }));

            setOpenFormationModal(false);
          }}
        />

        {/* Participants Modal */}
        <ParticipantsModal
          open={openParticipantsModal}
          onClose={() => setOpenParticipantsModal(false)}
          preSelectedParticipants={formData.participants}
          sessionId={
            isEdit
              ? initialData.idSession
              : createdSession?.idSession
          }
          onSelectParticipants={(selected) => {
            setOpenParticipantsModal(false);
            handleParticipantsSave(selected);
          }}
        />
      </DialogContent>

      {/* ACTIONS */}
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>

        {/* Create / Update */}
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={saving || (!isEdit && createdSession)}
        >
          {isEdit ? "Mettre à jour" : "Créer"}
        </Button>

        {/* Add Participants AFTER creation */}
        {!isEdit && createdSession && (
          <Button
            variant="outlined"
            onClick={() => setOpenParticipantsModal(true)}
          >
            Ajouter Participants
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default SessionModal;

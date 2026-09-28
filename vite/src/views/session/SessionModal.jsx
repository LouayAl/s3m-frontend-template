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
  Alert,
} from "@mui/material";

import FormationModal from "./FormationModal";
import ParticipantsModal from "./ParticipantsModal";

import {
  createSession,
  updateSession,
  getAllFormateurs,
  updateParticipants,
} from "../../api/sessionApi";

import { getFormationById } from "../../api/formationApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import Step2Calendar from "../equipment-manager/components/EMSessionModal/Step2Calendar";


const toLocalDateStr = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const fromDateStr = (s) => {
  const [y, m, d] = s.split("-").map(Number);
  return new Date(y, m - 1, d); // local date, no UTC shift
};

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
    // The formation's OWN entreprise (from the formation catalogue) — used only to
    // cross-check against idEntreprise below, never sent to the backend as-is.
    formationEntrepriseId: null,

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
    lieu: "",
  };

  const [formData, setFormData] = useState(emptyForm);

  const [entreprises, setEntreprises] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);
  const [openFormationModal, setOpenFormationModal] = useState(false);
  const [openParticipantsModal, setOpenParticipantsModal] = useState(false);

  const [saving, setSaving] = useState(false);

  // ✅ Stores session after creation
  const [createdSession, setCreatedSession] = useState(null);

  const [selectedDays, setSelectedDays] = useState([]);


  // ==========================
  // ✅ LOAD LISTS ONCE
  // ==========================
  useEffect(() => {
    const fetchLists = async () => {
      try {
        const [clients, all, f] = await Promise.all([
          getAllEntreprises('CLIENT'),
          getAllEntreprises(),
          getAllFormateurs(),
        ]);
        setEntreprises(clients);
        setFournisseurs(all);
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
        formationEntrepriseId: null, // filled in by the effect below once fetched
      });

      const storedDays = initialData.jours?.length
        ? initialData.jours
        : (initialData.dateDebut && initialData.dateFin
          ? (() => {
              const days = [];
              const cursor = fromDateStr(initialData.dateDebut);
              const end = fromDateStr(initialData.dateFin);
              while (cursor <= end) {
                days.push(new Date(cursor));
                cursor.setDate(cursor.getDate() + 1);
              }
              return days;
            })()
          : []);
      setSelectedDays(storedDays.map(day => typeof day === "string" ? fromDateStr(day) : day));

      setCreatedSession(null);
    } else {
      // CREATE MODE → reset clean
      setFormData(emptyForm);
      setSelectedDays([]);
      setCreatedSession(null);
    }
  }, [open, initialData]);

  // ==========================
  // ✅ EDIT MODE: fetch the pre-selected formation's OWN entreprise, so we can
  // cross-check it against the session's entreprise even before the admin
  // touches anything.
  // ==========================
  useEffect(() => {
    if (!open || !isEdit || !initialData?.idFormation) return;

    getFormationById(initialData.idFormation)
      .then((f) => {
        setFormData((prev) => ({
          ...prev,
          formationEntrepriseId: f?.entrepriseId ?? null,
        }));
      })
      .catch(() => {
        // Non-critical: if this fails we just skip the pre-check until the
        // admin re-selects a formation manually.
      });
  }, [open, isEdit, initialData]);

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
  // ✅ ENTREPRISE / FORMATION MISMATCH CHECK
  // A formation can share the same name/module across several entreprises, so
  // matching by id_formation alone isn't enough — the formation's own
  // entreprise must match the session's entreprise.
  // ==========================
  const entrepriseMismatch =
    Boolean(formData.idFormation) &&
    Boolean(formData.idEntreprise) &&
    formData.formationEntrepriseId != null &&
    Number(formData.formationEntrepriseId) !== Number(formData.idEntreprise);
  
  // ==========================
  // ✅ SAVE SESSION
  // ==========================
  const handleSave = async () => {
    if (entrepriseMismatch) {
      showSnackbar(
        "La formation sélectionnée appartient à une autre entreprise que celle choisie pour la session. Changez la formation ou l'entreprise avant de continuer.",
        "error"
      );
      return;
    }

    const days = [...selectedDays].sort((a, b) => a - b);
    if (!days.length) {
      showSnackbar("Veuillez sélectionner au moins un jour de formation.", "error");
      return;
    }

    // Validation only for CREATE
    if (!isEdit && !createdSession) {
      if (
        !formData.idFormation ||
        !formData.idEntreprise ||
        !formData.idFournisseur ||
        !formData.idFormateur ||
        !days.length
      ) {
        showSnackbar("Veuillez remplir tous les champs obligatoires.", "error");
        return;
      }
    }

    // Date validation
    const payload = {
      referenceSession: formData.referenceSession,
      idFormation: formData.idFormation,
      idEntreprise: formData.idEntreprise,
      idFournisseur: formData.idFournisseur,
      idFormateur: formData.idFormateur,
      dateDebut: toLocalDateStr(days[0]),
      dateFin: toLocalDateStr(days[days.length - 1]),
      jours: days.map(toLocalDateStr),
      dHeures: Number(formData.dHeures),
      dJours: Number(formData.dJours),
      statut: formData.statut,
      lieu: formData.lieu || null,
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
      // Surface the backend's own message when available (e.g. the
      // entreprise-mismatch guard on the server, or a duplicate reference).
      const backendMessage = err?.response?.data?.message || err?.response?.data;
      showSnackbar(
        typeof backendMessage === "string" && backendMessage
          ? backendMessage
          : "Erreur lors de l'enregistrement.",
        "error"
      );
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
          {/* Mismatch warning */}
          {entrepriseMismatch && (
            <Alert severity="error">
              La formation « {formData.formation} » appartient à une autre entreprise
              que celle sélectionnée pour cette session. Choisissez une autre formation
              (appartenant à la bonne entreprise) ou changez l'entreprise de la session.
              La sauvegarde est bloquée tant que ce conflit n'est pas résolu.
            </Alert>
          )}

          {/* Formation */}
          <Button
            variant="outlined"
            color={entrepriseMismatch ? "error" : "primary"}
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
            error={entrepriseMismatch}
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
          {/* Fournisseur */}
          <TextField
            select
            label="Fournisseur"
            value={formData.idFournisseur || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, idFournisseur: Number(e.target.value) }))}
          >
            {fournisseurs.map((en) => (   // was entreprises.map
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

          <Step2Calendar selectedDays={selectedDays} onDaysChange={setSelectedDays} />

          {/* Lieu ← new */}
          <TextField
            label="Lieu"
            placeholder="Ex: Salle A, Site Casablanca..."
            value={formData.lieu}
            fullWidth
            onChange={(e) => setFormData((prev) => ({ ...prev, lieu: e.target.value }))}
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
              formationEntrepriseId: formation.entrepriseId ?? null,
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
          sessionEntrepriseId={formData.idEntreprise}
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
          disabled={saving || entrepriseMismatch || (!isEdit && createdSession)}
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

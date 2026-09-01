// frontend-template/vite/src/views/formations/FormationsModal.jsx
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
import { LocalizationProvider, DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { createFormation, updateFormation } from "../../api/formationApi";

const INTERNE_EXTERNE_OPTIONS = ["Interne", "Externe"];

const FormationsModal = ({
  open, onClose, onSave, showSnackbar, initialData,
  entreprises = [], allowEntrepriseSelection = false,
}) => {
  const [formData, setFormData] = useState({
    module: "",
    typeFormation: "",
    familleFormation: "",
    sousFamille: "",
    interneExterne: "",
    referenceFormation: "",
    annee: null,
    dureeHeures: "",
    dureeJours: "",
    prixHeureMad: "",
    prixJourMad: "",
    entrepriseId: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        module: initialData.module || "",
        typeFormation: initialData.typeFormation || "",
        familleFormation: initialData.familleFormation || "",
        sousFamille: initialData.sousFamille || "",
        interneExterne: initialData.interneExterne || "",
        referenceFormation: initialData.referenceFormation || "",
        annee: initialData.annee ? new Date(initialData.annee, 0, 1) : null,
        dureeHeures: initialData.dureeHeures || "",
        dureeJours: initialData.dureeJours || "",
        prixHeureMad: initialData.prixHeureMad || "",
        prixJourMad: initialData.prixJourMad || "",
        entrepriseId: initialData.entrepriseId || "",
      });
    } else {
      setFormData({
        module: "",
        typeFormation: "",
        familleFormation: "",
        sousFamille: "",
        interneExterne: "",
        referenceFormation: "",
        annee: null,
        dureeHeures: "",
        dureeJours: "",
        prixHeureMad: "",
        prixJourMad: "",
        entrepriseId: "",
      });
    }
  }, [initialData, open]);

  const handleChange = (field, value) => {
    let updatedData = { ...formData, [field]: value };

    // Auto calculate dureeJours if dureeHeures changes
    if (field === "dureeHeures" && value !== "") {
      const heures = parseFloat(value);
      if (!isNaN(heures)) {
        updatedData.dureeJours = (heures / 8).toFixed(2);
      }
    }

    setFormData(updatedData);
  };

  // Validate required fields
  const validateForm = () => {
    const requiredFields = [
      { field: "module", label: "Module" },
      ...(allowEntrepriseSelection ? [{ field: "entrepriseId", label: "une entreprise" }] : []),
    ];

    for (let rf of requiredFields) {
      if (!formData[rf.field] || formData[rf.field].toString().trim() === "") {
        showSnackbar(`Veuillez saisir ${rf.label}.`, "error");
        return false;
      }
    }

    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;

    try {
      const payload = {
        ...formData,
        annee: formData.annee ? formData.annee.getFullYear() : null,
        ...(allowEntrepriseSelection
          ? { entreprise: { idEntreprise: Number(formData.entrepriseId) } }
          : {}),
      };
      delete payload.entrepriseId;

      let savedFormation;
      if (initialData) {
        savedFormation = await updateFormation(initialData.id, payload);
      } else {
        savedFormation = await createFormation(payload);
      }

      onSave(savedFormation);
      showSnackbar(initialData ? "Formation mise à jour !" : "Formation créée avec succès !");
      onClose();
    } catch (err) {
      const message = err.response?.data?.detail || err.response?.data?.message || "Erreur lors de l'enregistrement de la formation.";
      showSnackbar(message, "error");
      console.error("FormationsModal error:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "Modifier une formation" : "Créer une formation"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          {allowEntrepriseSelection && (
            <TextField
              select
              label="Entreprise *"
              fullWidth
              value={formData.entrepriseId}
              onChange={(e) => handleChange("entrepriseId", e.target.value)}
            >
              {entreprises.map((entreprise) => (
                <MenuItem key={entreprise.idEntreprise} value={entreprise.idEntreprise}>
                  {entreprise.nomEntreprise}
                </MenuItem>
              ))}
            </TextField>
          )}
          <TextField
            label="Module *"
            fullWidth
            value={formData.module}
            onChange={(e) => handleChange("module", e.target.value)}
          />
          <TextField
            label="Type "
            fullWidth
            value={formData.typeFormation}
            onChange={(e) => handleChange("typeFormation", e.target.value)}
          />
          <TextField
            label="Famille "
            fullWidth
            value={formData.familleFormation}
            onChange={(e) => handleChange("familleFormation", e.target.value)}
          />
          <TextField
            label="Sous-famille"
            fullWidth
            value={formData.sousFamille}
            onChange={(e) => handleChange("sousFamille", e.target.value)}
          />

          <TextField
            select
            label="Interne / Externe"
            fullWidth
            value={formData.interneExterne}
            onChange={(e) => handleChange("interneExterne", e.target.value)}
          >
            {INTERNE_EXTERNE_OPTIONS.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Référence"
            fullWidth
            value={formData.referenceFormation}
            onChange={(e) => handleChange("referenceFormation", e.target.value)}
          />

          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <DatePicker
              views={["year"]}
              label="Année"
              value={formData.annee}
              onChange={(newValue) => handleChange("annee", newValue)}
              renderInput={(params) => <TextField {...params} fullWidth />}
            />
          </LocalizationProvider>

          <TextField
            label="Durée (heures)"
            type="number"
            fullWidth
            value={formData.dureeHeures}
            onChange={(e) => handleChange("dureeHeures", e.target.value)}
          />
          <TextField
            label="Durée (jours)"
            type="number"
            fullWidth
            value={formData.dureeJours}
            onChange={(e) => handleChange("dureeJours", e.target.value)}
          />

          <TextField
            label="Prix / heure (MAD)"
            type="number"
            fullWidth
            value={formData.prixHeureMad}
            onChange={(e) => handleChange("prixHeureMad", e.target.value)}
          />
          <TextField
            label="Prix / jour (MAD)"
            type="number"
            fullWidth
            value={formData.prixJourMad}
            onChange={(e) => handleChange("prixJourMad", e.target.value)}
          />
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {initialData ? "Mettre à jour" : "Créer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormationsModal;

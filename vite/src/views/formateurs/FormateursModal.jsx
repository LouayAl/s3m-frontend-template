import { useState, useEffect } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, TextField, MenuItem, FormControlLabel, Switch,
} from "@mui/material";
import { createFormateur, updateFormateur } from "../../api/formateurApi";

const FormateursModal = ({ open, onClose, onSave, showSnackbar, initialData, entreprises }) => {
  const [formData, setFormData] = useState({
    nom: "", prenom: "", email: "", telephone: "", actif: true, entrepriseId: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData({
        nom: initialData.nom || "",
        prenom: initialData.prenom || "",
        email: initialData.email || "",
        telephone: initialData.telephone || "",
        actif: initialData.actif ?? true,
        entrepriseId: initialData.entrepriseId || "",
      });
    } else {
      setFormData({ nom: "", prenom: "", email: "", telephone: "", actif: true, entrepriseId: "" });
    }
  }, [initialData, open]);

  const handleChange = (field, value) => setFormData((prev) => ({ ...prev, [field]: value }));

  const validateForm = () => {
    if (!formData.nom.trim()) { showSnackbar("Veuillez saisir le nom.", "error"); return false; }
    if (!formData.entrepriseId) { showSnackbar("Veuillez sélectionner une entreprise.", "error"); return false; }
    return true;
  };

  const handleSave = async () => {
    if (!validateForm()) return;
    try {
      let saved;
      if (initialData) {
        saved = await updateFormateur(initialData.idFormateur, formData);
      } else {
        saved = await createFormateur(formData);
      }
      onSave(saved);
      showSnackbar(initialData ? "Formateur mis à jour !" : "Formateur créé avec succès !");
      onClose();
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de l'enregistrement du formateur.";
      showSnackbar(message, "error");
      console.error("FormateursModal error:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{initialData ? "Modifier un formateur" : "Créer un formateur"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Nom *" fullWidth value={formData.nom} onChange={(e) => handleChange("nom", e.target.value)} />
          <TextField label="Prénom" fullWidth value={formData.prenom} onChange={(e) => handleChange("prenom", e.target.value)} />
          <TextField label="Email" fullWidth value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
          <TextField label="Téléphone" fullWidth value={formData.telephone} onChange={(e) => handleChange("telephone", e.target.value)} />
          <TextField
            select label="Entreprise *" fullWidth
            value={formData.entrepriseId}
            onChange={(e) => handleChange("entrepriseId", e.target.value)}
          >
            {entreprises.map((ent) => (
              <MenuItem key={ent.idEntreprise} value={ent.idEntreprise}>{ent.nomEntreprise}</MenuItem>
            ))}
          </TextField>
          <FormControlLabel
            control={<Switch checked={formData.actif} onChange={(e) => handleChange("actif", e.target.checked)} />}
            label="Actif"
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

export default FormateursModal;
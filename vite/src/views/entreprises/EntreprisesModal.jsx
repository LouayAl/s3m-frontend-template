// frontend-template/vite/src/views/entreprises/EntreprisesModal.jsx

import { useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Stack
} from "@mui/material";

const EntrepriseModal = ({ open, onClose, onSave, initialData }) => {
  const [entreprise, setEntreprise] = useState({
    nomEntreprise: ""
  });

  // If we use the modal later for edit, this makes it reusable
  useEffect(() => {
    if (initialData) {
      setEntreprise(initialData);
    } else {
      setEntreprise({ nomEntreprise: "" });
    }
  }, [initialData, open]);

  const handleChange = (e) => {
    setEntreprise({
      ...entreprise,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = () => {
    if (!entreprise.nomEntreprise.trim()) {
      alert("Le nom de l’entreprise est obligatoire");
      return;
    }
    onSave(entreprise);
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="sm">
      <DialogTitle>
        {initialData ? "Modifier une entreprise" : "Créer une entreprise"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Nom de l'entreprise"
            name="nomEntreprise"
            value={entreprise.nomEntreprise}
            onChange={handleChange}
            fullWidth
            required
          />
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSave}>
          {initialData ? "Mettre à jour" : "Créer"}
        </Button>
      </DialogActions>

      
    </Dialog>
  );
};

export default EntrepriseModal;

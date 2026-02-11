// frontend-template/vite/src/views/employes/EmployesModal.jsx
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
import { createEmploye, updateEmploye } from "../../api/employeApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import { getDepartementsByEntreprise } from "../../api/departementApi";

const EmployeModal = ({ open, onClose, onSave, showSnackbar, initialData }) => {
  const [formData, setFormData] = useState({
    idEmploye: null, // Add ID for updates
    nom: "",
    prenom: "",
    email: "",
    telephone: "",
    cin: "",
    cnss: "",
    matricule: "",
    csp: "",
    fonction: "",
    typeContrat: "",
    f_h: "H",
    dateEmbauche: "",
    dateNaissance: "",
    entreprise: null,
    departement: null,
  });

  const [entreprises, setEntreprises] = useState([]);
  const [departements, setDepartements] = useState([]);

  // Load entreprises once
  useEffect(() => {
    getAllEntreprises()
      .then(setEntreprises)
      .catch(() => showSnackbar("Erreur lors du chargement des entreprises", "error"));
  }, [showSnackbar]);

  // Prefill form in edit mode
  useEffect(() => {
    if (initialData) {
      setFormData({
        idEmploye: initialData.idEmploye || null,
        nom: initialData.nom || "",
        prenom: initialData.prenom || "",
        email: initialData.email || "",
        telephone: initialData.telephone || "",
        cin: initialData.cin || "",
        cnss: initialData.cnss || "",
        matricule: initialData.matricule || "",
        csp: initialData.csp || "",
        fonction: initialData.fonction || "",
        typeContrat: initialData.typeContrat || "",
        f_h: initialData.f_h || "H",
        dateEmbauche: initialData.dateEmbauche || "",
        dateNaissance: initialData.dateNaissance || "",
        entreprise: initialData.entrepriseId ? { idEntreprise: Number(initialData.entrepriseId) } : null,
        departement: initialData.departementId ? { id: Number(initialData.departementId) } : null,
      });
    } else {
      setFormData((prev) => ({
        ...prev,
        idEmploye: null,
        entreprise: null,
        departement: null,
      }));
    }
  }, [initialData, open]);

  // Load departements when entreprise changes
  useEffect(() => {
    if (formData.entreprise?.idEntreprise) {
      getDepartementsByEntreprise(formData.entreprise.idEntreprise)
        .then(setDepartements)
        .catch(() => showSnackbar("Erreur lors du chargement des départements", "error"));
    } else {
      setDepartements([]);
      setFormData((prev) => ({ ...prev, departement: null }));
    }
  }, [formData.entreprise, showSnackbar]);

  const handleChange = (field, value) => {
    if (field === "entreprise") {
      setFormData((prev) => ({
        ...prev,
        entreprise: { idEntreprise: Number(value) },
        departement: null, // reset departement when entreprise changes
      }));
    } else if (field === "departement") {
      setFormData((prev) => ({
        ...prev,
        departement: value ? { id: Number(value) } : null,
      }));
    } else {
      setFormData((prev) => ({ ...prev, [field]: value }));
    }
  };

  const handleSave = async () => {
    if (!formData.entreprise?.idEntreprise) {
      showSnackbar("Entreprise obligatoire", "error");
      return;
    }

    try {
      const payload = {
        ...formData,
        entreprise: { idEntreprise: Number(formData.entreprise.idEntreprise) },
        departement: formData.departement?.id ? { id: Number(formData.departement.id) } : null,
      };


      let saved;
      if (formData.idEmploye) {
        // Update existing employee
        saved = await updateEmploye(formData.idEmploye, payload);
        showSnackbar("Employé mis à jour !");
      } else {
        // Create new employee
        saved = await createEmploye(payload);
        showSnackbar("Employé créé avec succès !");
      }

      onSave(saved);

      // Reset form only AFTER success
      setFormData({
        idEmploye: null,
        nom: "",
        prenom: "",
        email: "",
        telephone: "",
        cin: "",
        cnss: "",
        matricule: "",
        csp: "",
        fonction: "",
        typeContrat: "",
        f_h: "H",
        dateEmbauche: "",
        dateNaissance: "",
        entreprise: null,
        departement: null,
      });

      onClose();
    } catch (err) {
      const message = err.response?.data?.message || "Erreur lors de la sauvegarde de l'employé.";
      showSnackbar(message, "error");
      console.error("Employe modal error:", err);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>{formData.idEmploye ? "Modifier un employé" : "Créer un employé"}</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField label="Nom" fullWidth value={formData.nom} onChange={(e) => handleChange("nom", e.target.value)} />
          <TextField label="Prénom" fullWidth value={formData.prenom} onChange={(e) => handleChange("prenom", e.target.value)} />
          <TextField label="Email" type="email" fullWidth value={formData.email} onChange={(e) => handleChange("email", e.target.value)} />
          <TextField label="Téléphone" fullWidth value={formData.telephone} onChange={(e) => handleChange("telephone", e.target.value)} />
          <TextField label="CIN" fullWidth value={formData.cin} onChange={(e) => handleChange("cin", e.target.value)} />
          <TextField label="CNSS" fullWidth value={formData.cnss} onChange={(e) => handleChange("cnss", e.target.value)} />
          <TextField label="Matricule" fullWidth value={formData.matricule} onChange={(e) => handleChange("matricule", e.target.value)} />
          <TextField label="CSP" fullWidth value={formData.csp} onChange={(e) => handleChange("csp", e.target.value)} />
          <TextField label="Fonction" fullWidth value={formData.fonction} onChange={(e) => handleChange("fonction", e.target.value)} />
          <TextField label="Type de contrat" fullWidth value={formData.typeContrat} onChange={(e) => handleChange("typeContrat", e.target.value)} />
          <TextField select label="Genre" fullWidth value={formData.f_h} onChange={(e) => handleChange("f_h", e.target.value)}>
            <MenuItem value="H">Homme</MenuItem>
            <MenuItem value="F">Femme</MenuItem>
          </TextField>
          <TextField
            label="Date d'embauche"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.dateEmbauche}
            onChange={(e) => handleChange("dateEmbauche", e.target.value)}
          />
          <TextField
            label="Date de naissance"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.dateNaissance}
            onChange={(e) => handleChange("dateNaissance", e.target.value)}
          />

          {/* Entreprise */}
          <TextField
            select
            label="Entreprise"
            fullWidth
            value={formData.entreprise?.idEntreprise || ""}
            onChange={(e) => handleChange("entreprise", e.target.value)}
          >
            {entreprises.map((ent) => (
              <MenuItem key={ent.idEntreprise} value={ent.idEntreprise}>
                {ent.nomEntreprise}
              </MenuItem>
            ))}
          </TextField>

          {/* Département */}
          <TextField
            select
            label="Département"
            fullWidth
            value={formData.departement?.id || ""}
            onChange={(e) => handleChange("departement", e.target.value || null)}
          >
            <MenuItem value={null}>Aucun</MenuItem>
            {departements.map((dep) => (
              <MenuItem key={dep.id} value={dep.id}>
                {dep.nom}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" color="primary" onClick={handleSave}>
          {formData.idEmploye ? "Mettre à jour" : "Créer"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EmployeModal;

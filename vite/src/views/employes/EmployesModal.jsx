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

/* ==========================
   ✅ EMPTY FORM
========================== */
const emptyForm = {
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
  idEntreprise: "",
  idDepartement: "",
};

const EmployeModal = ({ open, onClose, onSave, showSnackbar, initialData }) => {
  const [formData, setFormData] = useState(emptyForm);

  const [entreprises, setEntreprises] = useState([]);
  const [departements, setDepartements] = useState([]);

  /* ==========================
     ✅ LOAD ENTREPRISES ONCE
  ========================== */
  useEffect(() => {
    getAllEntreprises()
      .then(setEntreprises)
      .catch(() =>
        showSnackbar("Erreur lors du chargement des entreprises", "error")
      );
  }, [showSnackbar]);

  /* ==========================
     ✅ RESET + PREFILL ON OPEN
  ========================== */
  useEffect(() => {
    if (!open) return;

    if (initialData) {
      // EDIT MODE → preload everything
      setFormData({
        ...emptyForm,
        ...initialData,

        idEmploye: Number(initialData.idEmploye),

        // always controlled
        email: initialData.email || "",
        telephone: initialData.telephone || "",
        cin: initialData.cin || "",
        cnss: initialData.cnss || "",
        fonction: initialData.fonction || "",
        typeContrat: initialData.typeContrat || "",

        idEntreprise: Number(initialData.entrepriseId),

        // ⚠️ wait until departements load
        idDepartement: "",
      });

      // Load departements first, then apply selection
      getDepartementsByEntreprise(Number(initialData.entrepriseId))
        .then((deps) => {
          setDepartements(deps);

          // ✅ now auto-select departement
          setFormData((prev) => ({
            ...prev,
            idDepartement: initialData.departementId
              ? Number(initialData.departementId)
              : "",
          }));
        })
        .catch(() =>
          showSnackbar("Erreur lors du chargement des départements", "error")
        );
    } else {
      // CREATE MODE → reset clean
      setFormData(emptyForm);
      setDepartements([]);
    }
  }, [open, initialData, showSnackbar]);

  /* ==========================
     ✅ LOAD DEPARTEMENTS WHEN ENTREPRISE CHANGES MANUALLY
  ========================== */
  useEffect(() => {
    if (!formData.idEntreprise) {
      setDepartements([]);
      setFormData((prev) => ({
        ...prev,
        idDepartement: "",
      }));
      return;
    }

    // Don't reload again immediately in edit mode
    if (
      initialData &&
      formData.idEntreprise === Number(initialData.entrepriseId)
    )
      return;

    getDepartementsByEntreprise(formData.idEntreprise)
      .then((deps) => {
        setDepartements(deps);

        // reset departement when entreprise changes
        setFormData((prev) => ({
          ...prev,
          idDepartement: "",
        }));
      })
      .catch(() =>
        showSnackbar("Erreur lors du chargement des départements", "error")
      );
  }, [formData.idEntreprise]);

  /* ==========================
     ✅ HANDLE CHANGE
  ========================== */
  const handleChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  /* ==========================
     ✅ SAVE
  ========================== */
  const handleSave = async () => {
    if (!formData.idEntreprise) {
      showSnackbar("Entreprise obligatoire", "error");
      return;
    }

    try {
      const payload = {
        ...formData,

        entreprise: { idEntreprise: Number(formData.idEntreprise) },

        departement: formData.idDepartement
          ? { id: Number(formData.idDepartement) }
          : null,
      };

      let saved;

      if (formData.idEmploye) {
        saved = await updateEmploye(formData.idEmploye, payload);
        showSnackbar("Employé mis à jour !");
      } else {
        saved = await createEmploye(payload);
        showSnackbar("Employé créé avec succès !");
      }

      onSave(saved);
      setFormData(emptyForm);
      setDepartements([]);
      onClose();
    } catch (err) {
      const message =
        err.response?.data?.message ||
        "Erreur lors de la sauvegarde de l'employé.";
      showSnackbar(message, "error");
    }
  };

  /* ==========================
     ✅ UI (ALL FIELDS RESTORED)
  ========================== */
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {formData.idEmploye ? "Modifier un employé" : "Créer un employé"}
      </DialogTitle>

      <DialogContent>
        <Stack spacing={2} mt={1}>
          <TextField
            label="Prénom"
            fullWidth
            value={formData.prenom}
            onChange={(e) => handleChange("prenom", e.target.value)}
          />
          
          <TextField
            label="Nom"
            fullWidth
            value={formData.nom}
            onChange={(e) => handleChange("nom", e.target.value)}
          />

          <TextField
            label="Email"
            type="email"
            fullWidth
            value={formData.email || ""}
            onChange={(e) => handleChange("email", e.target.value)}
          />

          <TextField
            label="Téléphone"
            fullWidth
            value={formData.telephone || ""}
            onChange={(e) => handleChange("telephone", e.target.value)}
          />

          <TextField
            label="CIN"
            fullWidth
            value={formData.cin || ""}
            onChange={(e) => handleChange("cin", e.target.value)}
          />

          <TextField
            label="CNSS"
            fullWidth
            value={formData.cnss || ""}
            onChange={(e) => handleChange("cnss", e.target.value)}
          />

          <TextField
            label="Matricule"
            fullWidth
            value={formData.matricule}
            onChange={(e) => handleChange("matricule", e.target.value)}
          />

          <TextField
            label="CSP"
            fullWidth
            value={formData.csp}
            onChange={(e) => handleChange("csp", e.target.value)}
          />

          <TextField
            label="Fonction"
            fullWidth
            value={formData.fonction || ""}
            onChange={(e) => handleChange("fonction", e.target.value)}
          />

          <TextField
            label="Type de contrat"
            fullWidth
            value={formData.typeContrat || ""}
            onChange={(e) => handleChange("typeContrat", e.target.value)}
          />

          <TextField
            select
            label="Genre"
            fullWidth
            value={formData.f_h}
            onChange={(e) => handleChange("f_h", e.target.value)}
          >
            <MenuItem value="H">Homme</MenuItem>
            <MenuItem value="F">Femme</MenuItem>
          </TextField>

          <TextField
            label="Date d'embauche"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.dateEmbauche || ""}
            onChange={(e) => handleChange("dateEmbauche", e.target.value)}
          />

          <TextField
            label="Date de naissance"
            type="date"
            fullWidth
            InputLabelProps={{ shrink: true }}
            value={formData.dateNaissance || ""}
            onChange={(e) => handleChange("dateNaissance", e.target.value)}
          />

          {/* Entreprise */}
          <TextField
            select
            label="Entreprise"
            fullWidth
            value={formData.idEntreprise || ""}
            onChange={(e) =>
              handleChange("idEntreprise", Number(e.target.value))
            }
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
            value={formData.idDepartement || ""}
            onChange={(e) =>
              handleChange(
                "idDepartement",
                e.target.value === "" ? "" : Number(e.target.value)
              )
            }
          >
            <MenuItem value="">Aucun</MenuItem>

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

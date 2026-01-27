// frontend-template/vite/src/views/saisie/SaisiePage.jsx
import React, { useState, useEffect } from 'react';
import {
  TextField,
  MenuItem,
  Button,
  Stack,
  CircularProgress
} from '@mui/material';

import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { Snackbar, Alert } from '@mui/material';

import MainCard from 'ui-component/cards/MainCard';

import { getFormateurs, getEntreprises, getFormations } from '../../api/saisieApi';
import { createSession } from '../../api/sessionApi';
import { useAuth } from "../../contexts/auth/AuthContext";



export default function SaisiePage() {
  const [form, setForm] = useState({
    idEntreprise: '',
    idFormation: '',
    dateDebut: null,
    dateFin: null,
    dHeures: '',
    idFormateur: '',
    idFournisseur: ''
  });

  const { token } = useAuth();

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const [entreprises, setEntreprises] = useState([]);
  const [formateurs, setFormateurs] = useState([]);
  const [formations, setFormations] = useState([]);
  const [fournisseurs, setFournisseurs] = useState([]);

  const [successOpen, setSuccessOpen] = useState(false);

  // Function to close the snackbar
  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') return;
    setSuccessOpen(false);
  };

  // Fetch dropdown data from backend
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [eRes, fRes, foRes] = await Promise.all([
          getEntreprises(),
          getFormateurs(),
          getFormations()
        ]);
        setEntreprises(Array.isArray(eRes.data) ? eRes.data : []);
        setFormateurs(fRes.data);
        setFormations(foRes.data);

        // For now, let's use entreprises as fournisseurs
        setFournisseurs(eRes.data);

      } catch (err) {
        console.error('Error fetching dropdown data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleChange = (field, value) => {
    setForm({ ...form, [field]: value });
    setErrors({ ...errors, [field]: '' }); // clear error when user edits
  };

  const validateForm = () => {
    let newErrors = {};

    if (!form.idEntreprise) newErrors.idEntreprise = "L'entreprise est obligatoire.";
    if (!form.idFormation) newErrors.idFormation = "La formation est obligatoire.";
    if (!form.dateDebut) newErrors.dateDebut = "La date de début est obligatoire.";
    if (!form.dateFin) newErrors.dateFin = "La date de fin est obligatoire.";
    if (!form.dHeures && form.dHeures !== 0) newErrors.dHeures = "La durée est obligatoire.";
    if (!form.idFormateur) newErrors.idFormateur = "Le formateur est obligatoire.";
    if (!form.idFournisseur) newErrors.idFournisseur = "Le fournisseur est obligatoire.";

    if (form.dHeures !== '' && Number(form.dHeures) <= 0) {
      newErrors.dHeures = "La durée doit être un nombre positif.";
    }

    if (form.dateDebut && form.dateFin && form.dateFin < form.dateDebut) {
      newErrors.dateFin = "La date de fin doit être postérieure à la date de début.";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    if (!token) {
        console.error("No token found. Please login first.");
        return;
    }

    const payload = {
      idEntreprise: Number(form.idEntreprise),
      idFormation: Number(form.idFormation),
      dateDebut: form.dateDebut,
      dateFin: form.dateFin,
      dHeures: Number(form.dHeures),
      idFormateur: Number(form.idFormateur),
      idFournisseur: Number(form.idFournisseur)
    };

    try {
      const response = await createSession(payload, token);

      console.log('Session created successfully:');
      setSuccessOpen(true);

      // Optional: reset form
      setForm({
        idEntreprise: '',
        idFormation: '',
        dateDebut: null,
        dateFin: null,
        dHeures: '',
        idFormateur: '',
        idFournisseur: ''
      });
    } catch (error) {
      console.error('Error creating session:', error.response?.data || error.message);
    }
  };

  if (loading) {
    return (
      <MainCard title="Créer une session de formation">
        <Stack alignItems="center" justifyContent="center" sx={{ py: 5 }}>
          <CircularProgress />
        </Stack>
      </MainCard>
    );
  }

  return (
    <MainCard title="Créer une session de formation">
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack spacing={3} sx={{ maxWidth: 700, mx: 'auto' }}>

          {/* Entreprise */}
          <TextField
            fullWidth
            required
            label="Entreprise"
            select
            value={form.idEntreprise}
            error={!!errors.idEntreprise}
            helperText={errors.idEntreprise}
            onChange={(e) => handleChange('idEntreprise', e.target.value)}
          >
            {entreprises.map((e) => (
              <MenuItem key={e.idEntreprise} value={e.idEntreprise}>
                {e.nomEntreprise}
              </MenuItem>
            ))}
          </TextField>

          {/* Formation */}
          <TextField
            fullWidth
            required
            label="Formation"
            select
            value={form.idFormation}
            error={!!errors.idFormation}
            helperText={errors.idFormation}
            onChange={(e) => handleChange('idFormation', e.target.value)}
          >
            {formations.map((f) => (
              <MenuItem key={f.id} value={f.id}>
                {f.module}
              </MenuItem>
            ))}
          </TextField>

          {/* Durée */}
          <TextField
            fullWidth
            required
            label="Durée (heures)"
            type="number"
            value={form.dHeures}
            error={!!errors.dHeures}
            helperText={errors.dHeures}
            onChange={(e) => {
              let val = e.target.value;
              if (/^\d*\.?\d*$/.test(val)) {
                setForm({ ...form, dHeures: val });
                setErrors({ ...errors, dHeures: '' });
              }
            }}
            inputProps={{ step: 0.25, min: 0 }}
          />

          {/* Date début */}
          <DatePicker
            label="Date de début *"
            value={form.dateDebut}
            onChange={(newValue) => handleChange('dateDebut', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required
                error={!!errors.dateDebut}
                helperText={errors.dateDebut}
              />
            )}
          />

          {/* Date fin */}
          <DatePicker
            label="Date de fin *"
            value={form.dateFin}
            minDate={form.dateDebut}
            onChange={(newValue) => handleChange('dateFin', newValue)}
            renderInput={(params) => (
              <TextField
                {...params}
                fullWidth
                required
                error={!!errors.dateFin}
                helperText={errors.dateFin}
              />
            )}
          />

          {/* Formateur */}
          <TextField
            fullWidth
            required
            label="Formateur"
            select
            value={form.idFormateur}
            error={!!errors.idFormateur}
            helperText={errors.idFormateur}
            onChange={(e) => handleChange('idFormateur', e.target.value)}
          >
            {formateurs.map((f) => (
              <MenuItem key={f.idFormateur} value={f.idFormateur}>
                {f.nom} {f.prenom}
              </MenuItem>
            ))}
          </TextField>

          {/* Fournisseur */}
          <TextField
            fullWidth
            required
            label="Fournisseur"
            select
            value={form.idFournisseur}
            error={!!errors.idFournisseur}
            helperText={errors.idFournisseur}
            onChange={(e) => handleChange('idFournisseur', e.target.value)}
          >
            {fournisseurs.map((f) => (
              <MenuItem key={f.idEntreprise} value={f.idEntreprise}>
                {f.nomEntreprise}
              </MenuItem>
            ))}
          </TextField>

          {/* Actions */}
          <Stack direction="row" spacing={2} justifyContent="flex-end" pt={2}>
            <Button variant="outlined">Annuler</Button>
            <Button variant="contained" size="large" onClick={handleSubmit}>
              Créer la session
            </Button>
          </Stack>

        </Stack>
      </LocalizationProvider>
      {/* Success Snackbar */}
      <Snackbar
        open={successOpen}
        autoHideDuration={3000} // closes automatically after 3s
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }} // top-right corner
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity="success" 
          sx={{ width: '100%', fontWeight: 'bold', boxShadow: 6, opacity: 1, color: '#fff', backgroundColor: '#4caf50' }}
        >
          Session créée avec succès !
        </Alert>
      </Snackbar>

    </MainCard>
  );
}

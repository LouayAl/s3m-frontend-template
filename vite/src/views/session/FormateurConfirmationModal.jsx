// frontend-template/vite/src/views/session/FormateurConfirmationModal.jsx
import { useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Typography, Stack, Alert,
} from "@mui/material";
import { notifyFormateur, confirmFormateur } from "../../api/sessionApi";

const FormateurConfirmationModal = ({ open, onClose, session, onUpdated, showSnackbar }) => {
  const [sending, setSending] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [askConfirm, setAskConfirm] = useState(false);
  const [notifyError, setNotifyError] = useState("");

  if (!session) return null;

  const alreadyNotified = Boolean(session.notificationEnvoyeeLe);
  const isConfirmed = Boolean(session.formateurConfirme);

  const handleSendNotification = async () => {
    setSending(true);
    setNotifyError("");
    try {
      const updated = await notifyFormateur(session.idSession);
      onUpdated(updated);
      showSnackbar("Notification envoyée au formateur par email.");
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data;
      if (err.response?.status === 409) {
        setNotifyError(typeof msg === "string" ? msg : "Une notification a déjà été envoyée à ce formateur.");
      } else {
        showSnackbar("Erreur lors de l'envoi de la notification.", "error");
      }
    } finally {
      setSending(false);
    }
  };

  const handleConfirm = async () => {
    setConfirming(true);
    try {
      const updated = await confirmFormateur(session.idSession);
      onUpdated(updated);
      showSnackbar("Présence du formateur confirmée.");
      setAskConfirm(false);
      onClose();
    } catch {
      showSnackbar("Erreur lors de la confirmation.", "error");
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Confirmation du formateur</DialogTitle>
      <DialogContent>
        <Stack spacing={2} mt={1}>
          <Typography>
            Formateur : <strong>{session.formateurNomComplet || "Non assigné"}</strong>
          </Typography>
          <Typography>
            Statut : {isConfirmed
              ? <strong style={{ color: "#047857" }}>Confirmé</strong>
              : <strong style={{ color: "#B91C1C" }}>Non confirmé</strong>}
          </Typography>

          {alreadyNotified && (
            <Alert severity="info">
              Notification déjà envoyée le{" "}
              {new Date(session.notificationEnvoyeeLe).toLocaleString("fr-FR")}.
            </Alert>
          )}

          {notifyError && <Alert severity="warning">{notifyError}</Alert>}

          {askConfirm && (
            <Alert severity="warning">
              Avez-vous bien contacté {session.formateurNomComplet} pour obtenir sa confirmation ?
            </Alert>
          )}
        </Stack>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Fermer</Button>
        {!isConfirmed && (
          <Button variant="outlined" onClick={handleSendNotification} disabled={sending}>
            Envoyer une notification
          </Button>
        )}
        {!isConfirmed && !askConfirm && (
          <Button variant="contained" color="success" onClick={() => setAskConfirm(true)}>
            Confirmer la présence
          </Button>
        )}
        {askConfirm && (
          <>
            <Button onClick={() => setAskConfirm(false)}>Annuler</Button>
            <Button variant="contained" color="success" onClick={handleConfirm} disabled={confirming}>
              Oui, confirmer
            </Button>
          </>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default FormateurConfirmationModal;
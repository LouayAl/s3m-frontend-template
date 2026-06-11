// frontend-template/vite/src/views/session/QRCodeDialog.jsx
import QRCode from 'react-qr-code';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography, Tabs, Tab,
} from '@mui/material';
import { useState } from 'react';

function generateDays(dateDebut, dateFin) {
  if (!dateDebut || !dateFin) return [];
  const days = [];
  const [sy, sm, sd] = dateDebut.split('-').map(Number);
  const [ey, em, ed] = dateFin.split('-').map(Number);
  const current = new Date(sy, sm - 1, sd);
  const end     = new Date(ey, em - 1, ed);
  while (current <= end) {
    // ✅ format manually — no UTC conversion
    const y = current.getFullYear();
    const m = String(current.getMonth() + 1).padStart(2, '0');
    const d = String(current.getDate()).padStart(2, '0');
    days.push(`${y}-${m}-${d}`);
    current.setDate(current.getDate() + 1);
  }
  return days;
}

function formatDay(dateStr) {
  if (!dateStr) return '';
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('fr-FR', {
    weekday: 'short', day: 'numeric', month: 'short'
  });
}

export default function QRCodeDialog({ open, onClose, session }) {
  const [selectedDay, setSelectedDay] = useState(0);

  if (!session) return null;

  const days = generateDays(session.dateDebut, session.dateFin);

  // Session has no dates defined
  if (days.length === 0) {
    return (
      <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
        <DialogTitle>QR Code — Évaluation à chaud</DialogTitle>
        <DialogContent>
          <Typography color="text.secondary" py={2}>
            Cette session n'a pas de dates définies. Veuillez d'abord renseigner
            les dates de début et de fin.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose}>Fermer</Button>
        </DialogActions>
      </Dialog>
    );
  }

  const safeIndex  = Math.min(selectedDay, days.length - 1);
  const currentDay = days[safeIndex];
  const evalUrl    = `${window.location.origin}/evaluation/session/${session.idSession}/jour/${currentDay}`;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><body style="display:flex;flex-direction:column;align-items:center;
        font-family:sans-serif;padding:40px">
        <h2>Évaluation à chaud</h2>
        <p><strong>${session.formation}</strong></p>
        <p>Réf: ${session.referenceSession}</p>
        <p>Jour: ${formatDay(currentDay)}</p>
        <div id="qr"></div>
        <p style="margin-top:16px;font-size:12px;color:#666">${evalUrl}</p>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/qrcodejs/1.0.0/qrcode.min.js"></script>
        <script>new QRCode(document.getElementById("qr"),
          {text:"${evalUrl}",width:256,height:256})</script>
      </body></html>
    `);
    win.document.close();
    setTimeout(() => win.print(), 500);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>QR Code — Évaluation à chaud</DialogTitle>
      <DialogContent>
        {days.length > 1 && (
          <Tabs
            value={safeIndex}
            onChange={(_, v) => setSelectedDay(v)}
            variant="scrollable"
            scrollButtons="auto"
            sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
          >
            {days.map(d => (
              <Tab key={d} label={formatDay(d)} />
            ))}
          </Tabs>
        )}

        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={2}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Les participants scannent ce QR code pour évaluer la journée du{' '}
            <strong>{formatDay(currentDay)}</strong>
          </Typography>
          <Box p={2} bgcolor="white" borderRadius={2} border="1px solid #eee">
            <QRCode value={evalUrl} size={200} />
          </Box>
          <Typography variant="caption" color="text.secondary" textAlign="center">
            {evalUrl}
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={handlePrint} variant="outlined">Imprimer</Button>
        <Button onClick={onClose}>Fermer</Button>
      </DialogActions>
    </Dialog>
  );
}
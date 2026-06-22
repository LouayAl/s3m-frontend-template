// frontend-template/vite/src/views/session/QRCodeDialog.jsx
import QRCode from 'react-qr-code';
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Box, Typography,
} from '@mui/material';

export default function QRCodeDialog({ open, onClose, session }) {
  if (!session) return null;

  const evalUrl = `${window.location.origin}/evaluation/session/${session.idSession}`;

  const handlePrint = () => {
    const win = window.open('', '_blank');
    win.document.write(`
      <html><body style="display:flex;flex-direction:column;align-items:center;
        font-family:sans-serif;padding:40px">
        <h2>Évaluation à chaud</h2>
        <p><strong>${session.formation}</strong></p>
        <p>Réf: ${session.referenceSession}</p>
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
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>QR Code — Évaluation à chaud</DialogTitle>
      <DialogContent>
        <Box display="flex" flexDirection="column" alignItems="center" gap={2} py={2}>
          <Typography variant="body2" color="text.secondary" textAlign="center">
            Les participants scannent ce QR code pour évaluer la formation
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
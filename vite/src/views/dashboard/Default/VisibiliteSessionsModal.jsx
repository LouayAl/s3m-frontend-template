import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableContainer from '@mui/material/TableContainer';
import Chip from '@mui/material/Chip';
import Typography from '@mui/material/Typography';
import CloseIcon from '@mui/icons-material/Close';

export default function VisibiliteSessionsModal({ open, onClose, title, sessions }) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose} size="small"><CloseIcon /></IconButton>
      </DialogTitle>
      <DialogContent dividers>
        {sessions.length === 0 ? (
          <Typography color="text.secondary">Aucune session pour cette sélection.</Typography>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Référence</TableCell>
                  <TableCell>Formation</TableCell>
                  <TableCell>Formateur</TableCell>
                  <TableCell>Entreprise</TableCell>
                  <TableCell>Dates</TableCell>
                  <TableCell>Lieu</TableCell>
                  <TableCell align="center">Participants</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sessions.map((s) => (
                  <TableRow key={s.idSession} hover>
                    <TableCell>{s.referenceSession}</TableCell>
                    <TableCell>{s.moduleFormation}</TableCell>
                    <TableCell>{s.formateur}</TableCell>
                    <TableCell>{s.entreprise}</TableCell>
                    <TableCell>{s.dateDebut} — {s.dateFin}</TableCell>
                    <TableCell>{s.lieu || '—'}</TableCell>
                    <TableCell align="center">
                      <Chip
                        label={s.nbParticipants}
                        size="small"
                        color={s.nbParticipants === 0 ? 'warning' : 'default'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </DialogContent>
    </Dialog>
  );
}
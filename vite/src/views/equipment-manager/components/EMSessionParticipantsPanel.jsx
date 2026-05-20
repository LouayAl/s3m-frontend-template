// frontend-template/vite/src/views/equipment-manager/components/EMSessionParticipantsPanel.jsx
//
// Drop-in replacement for SessionParticipantsPanel in the EM branch.
// Uses EMParticipantsModal (scoped employees) instead of ParticipantsModal (all employees).
//

import { useEffect, useState } from 'react';
import {
  Box, Typography, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, useMediaQuery,
} from '@mui/material';
import { useTheme }      from '@mui/material/styles';
import { DataGrid }      from '@mui/x-data-grid';
import DeleteIcon        from '@mui/icons-material/Delete';
import GroupRemoveIcon   from '@mui/icons-material/GroupRemove';
import DownloadIcon      from '@mui/icons-material/Download';
import PictureAsPdfIcon  from '@mui/icons-material/PictureAsPdf';
import EMParticipantsModal from './EMParticipantsModal';   // ← scoped modal
import {
  getSessionParticipants,
  addParticipantsToSession,
  removeParticipantsFromSession,
} from '../../../api/sessionApi';
import * as XLSX     from 'xlsx';
import jsPDF         from 'jspdf';
import autoTable     from 'jspdf-autotable';

const EMSessionParticipantsPanel = ({ session, onUpdated, showSnackbar }) => {
  const theme   = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [participants,        setParticipants]        = useState([]);
  const [loading,             setLoading]             = useState(true);
  const [search,              setSearch]              = useState('');
  const [openAddModal,        setOpenAddModal]        = useState(false);
  const [confirmDeleteOpen,   setConfirmDeleteOpen]   = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);
  const [confirmRemoveAllOpen,setConfirmRemoveAllOpen]= useState(false);

  // ── Fetch current participants ────────────────────────────────────────────
  useEffect(() => {
    if (session) fetchParticipants();
  }, [session]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const data = await getSessionParticipants(session.idSession);
      setParticipants(data);
    } catch {
      showSnackbar?.('Impossible de charger les participants.', 'error');
    } finally {
      setLoading(false);
    }
  };

  // ── Add participants ──────────────────────────────────────────────────────
  const handleAddParticipants = async (selected) => {
    try {
      const idsToAdd = selected.map(p => p.idEmploye);
      if (idsToAdd.length === 0) return;
      await addParticipantsToSession(session.idSession, idsToAdd);
      showSnackbar?.(`${selected.length} participant(s) ajouté(s) avec succès !`, 'success');
      setOpenAddModal(false);
      fetchParticipants();
      onUpdated?.();
    } catch {
      showSnackbar?.('Erreur lors de l\'ajout des participants.', 'error');
    }
  };

  // ── Delete one ────────────────────────────────────────────────────────────
  const handleConfirmDelete = async () => {
    if (!participantToDelete) return;
    try {
      await removeParticipantsFromSession(session.idSession, [participantToDelete.idEmploye]);
      showSnackbar?.('Participant supprimé avec succès !', 'success');
      setConfirmDeleteOpen(false);
      setParticipantToDelete(null);
      fetchParticipants();
      onUpdated?.();
    } catch {
      showSnackbar?.('Erreur suppression participant.', 'error');
    }
  };

  // ── Remove all ────────────────────────────────────────────────────────────
  const handleRemoveAll = async () => {
    try {
      await removeParticipantsFromSession(session.idSession, participants.map(p => p.idEmploye));
      showSnackbar?.('Tous les participants ont été supprimés.', 'success');
      setConfirmRemoveAllOpen(false);
      fetchParticipants();
      onUpdated?.();
    } catch {
      showSnackbar?.('Erreur suppression globale.', 'error');
    }
  };

  // ── Exports ───────────────────────────────────────────────────────────────
  const exportToExcel = () => {
    const ws = XLSX.utils.json_to_sheet(
      participants.map(p => ({ Nom: p.nom, Prénom: p.prenom, CIN: p.cin || '', Matricule: p.matricule || '' }))
    );
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Participants');
    XLSX.writeFile(wb, `participants_${session.referenceSession}.xlsx`);
    showSnackbar?.('Export Excel réussi !', 'success');
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Participants - Session ${session.referenceSession}`, 10, 10);
    autoTable(doc, {
      head: [['Nom', 'Prénom', 'CIN', 'Matricule']],
      body: participants.map(p => [p.nom, p.prenom, p.cin || '', p.matricule || '']),
    });
    doc.save(`participants_${session.referenceSession}.pdf`);
    showSnackbar?.('Export PDF réussi !', 'success');
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filtered = participants.filter(p => {
    const kw = search.toLowerCase();
    return (
      p.nom?.toLowerCase().includes(kw)      ||
      p.prenom?.toLowerCase().includes(kw)   ||
      p.cin?.toLowerCase().includes(kw)      ||
      p.matricule?.toLowerCase().includes(kw)
    );
  });

  // ── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    { field: 'nom',       headerName: 'Nom',       flex: 1 },
    { field: 'prenom',    headerName: 'Prénom',    flex: 1 },
    { field: 'cin',       headerName: 'CIN',       flex: 1 },
    { field: 'matricule', headerName: 'Matricule', flex: 1 },
    {
      field: 'actions', headerName: 'Actions', width: 80, sortable: false,
      renderCell: (params) => (
        <IconButton color="error" size="small"
          onClick={() => { setParticipantToDelete(params.row); setConfirmDeleteOpen(true); }}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2} textAlign={isMobile ? 'center' : 'left'}>
        Participants — «{session.referenceSession}»
      </Typography>

      <TextField
        fullWidth label="Rechercher..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      <Stack direction={isMobile ? 'column' : 'row'} spacing={1} mb={1}>
        <Button variant="contained" onClick={() => setOpenAddModal(true)}>
          Ajouter des participants
        </Button>
        <Button variant="outlined" color="error" startIcon={<GroupRemoveIcon />}
          onClick={() => setConfirmRemoveAllOpen(true)}>
          Tout supprimer
        </Button>
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToExcel}>Excel</Button>
        <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={exportToPDF}>PDF</Button>
      </Stack>

      <Box sx={{ height: isMobile ? 320 : 480 }}>
        <DataGrid
          rows={filtered}
          columns={columns}
          getRowId={row => row.idEmploye}
          loading={loading}
          pageSizeOptions={[10, 20, 50]}
          disableRowSelectionOnClick
        />
      </Box>

      {/* Add participants — scoped modal */}
      <EMParticipantsModal
        open={openAddModal}
        onClose={() => setOpenAddModal(false)}
        preSelectedParticipants={participants}
        onSelectParticipants={handleAddParticipants}
      />

      {/* Delete one */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Supprimer participant ?</DialogTitle>
        <DialogContent>
          Supprimer {participantToDelete?.prenom} {participantToDelete?.nom} de cette session ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Remove all */}
      <Dialog open={confirmRemoveAllOpen} onClose={() => setConfirmRemoveAllOpen(false)}>
        <DialogTitle>Supprimer tous ?</DialogTitle>
        <DialogContent>Retirer tous les participants de cette session ?</DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemoveAllOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleRemoveAll}>Oui, supprimer</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default EMSessionParticipantsPanel;

// frontend-template/vite/src/views/equipment-manager/EMSessionsPage.jsx
import { useEffect, useState, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent, Button,
  TextField, Grid, IconButton, Snackbar, Alert,
  Dialog, DialogTitle, DialogContent, DialogActions, Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import AddIcon    from '@mui/icons-material/Add';
import EditIcon   from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import GroupIcon  from '@mui/icons-material/Group';
import { useNavigate } from 'react-router-dom';

import EMSessionModal             from './components/EMSessionModal';
import EMParticipantsModal        from './components/EMParticipantsModal';        // ← scoped
import EMSessionParticipantsPanel from './components/EMSessionParticipantsPanel'; // ← scoped

import { deleteSession, addParticipantsToSession, removeParticipantsFromSession } from '../../api/sessionApi';
import { getEmSessions } from '../../api/emApi';

const STATUT_LABELS = { EN_COURS:'En cours', PLANIFIEE:'Planifiée', TERMINEE:'Terminée', ANNULEE:'Annulée' };
const STATUT_COLORS = { EN_COURS:'success',  PLANIFIEE:'warning',   TERMINEE:'default',  ANNULEE:'error'  };

function StatutChip({ value }) {
  return (
    <Chip
      label={STATUT_LABELS[value] ?? value}
      color={STATUT_COLORS[value] ?? 'default'}
      size="small"
      sx={{ fontWeight: 600, fontSize: 11 }}
    />
  );
}

export default function EMSessionsPage() {
  const navigate = useNavigate();

  const [sessions, setSessions] = useState([]);
  const [loading,  setLoading]  = useState(true);
  const [search,   setSearch]   = useState('');
  const [snackbar, setSnackbar] = useState({ open:false, message:'', severity:'success' });

  const showSnackbar        = (msg, sev = 'success') => setSnackbar({ open:true, message:msg, severity:sev });
  const handleCloseSnackbar = () => setSnackbar(p => ({ ...p, open:false }));

  const [sessionModalOpen,           setSessionModalOpen]           = useState(false);
  const [editingSession,             setEditingSession]             = useState(null);
  const [deleteOpen,                 setDeleteOpen]                 = useState(false);
  const [deletingId,                 setDeletingId]                 = useState(null);
  const [participantsPanelOpen,      setParticipantsPanelOpen]      = useState(false);
  const [participantsModalOpen,      setParticipantsModalOpen]      = useState(false);
  const [editingParticipantsSession, setEditingParticipantsSession] = useState(null);

  // ─── Fetch — backend scopes to user's entreprise automatically ────────────
  const fetchSessions = async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const data = await getEmSessions();
      setSessions(data.sort((a, b) => b.idSession - a.idSession));
    } catch {
      showSnackbar('Erreur lors du chargement des sessions.', 'error');
    } finally {
      if (showSpinner) setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions(true);
    const interval = setInterval(() => fetchSessions(false), 30000);
    return () => clearInterval(interval);
  }, []);

  // ─── Handlers ──────────────────────────────────────────────────────────────
  const handleEdit = (row) => {
    setEditingSession({
      ...row,
      idFormation:   row.formationId,
      idEntreprise:  row.idEntreprise,
      idFournisseur: row.idFournisseur,
      idFormateur:   row.idFormateur,
      statut:        row.statut,
    });
    setSessionModalOpen(true);
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteSession(deletingId);
      showSnackbar('Session supprimée avec succès !');
      fetchSessions(false);
    } catch {
      showSnackbar('Impossible de supprimer cette session.', 'error');
    } finally {
      setDeleteOpen(false);
      setDeletingId(null);
    }
  };

  const handleParticipantsUpdate = async (selected) => {
    try {
      const oldIds   = (editingParticipantsSession.participants || []).map(p => Number(p.idEmploye));
      const newIds   = selected.map(p => Number(p.idEmploye));
      const toAdd    = newIds.filter(id => !oldIds.includes(id));
      const toRemove = oldIds.filter(id => !newIds.includes(id));
      if (toAdd.length    > 0) await addParticipantsToSession(editingParticipantsSession.idSession, toAdd);
      if (toRemove.length > 0) await removeParticipantsFromSession(editingParticipantsSession.idSession, toRemove);
      showSnackbar(`${selected.length} participants mis à jour !`);
      fetchSessions(false);
    } catch {
      showSnackbar('Erreur lors de la mise à jour des participants.', 'error');
    } finally {
      setParticipantsModalOpen(false);
    }
  };

  // ─── Filter ────────────────────────────────────────────────────────────────
  const filteredRows = useMemo(() => sessions.filter(s =>
    s.formation?.toLowerCase().includes(search.toLowerCase())        ||
    s.referenceSession?.toLowerCase().includes(search.toLowerCase()) ||
    s.entrepriseNom?.toLowerCase().includes(search.toLowerCase())
  ), [sessions, search]);

  // ─── Columns ───────────────────────────────────────────────────────────────
  const columns = [
    { field:'referenceSession',    headerName:'Référence',   flex:1,   minWidth:130 },
    { field:'formation',           headerName:'Formation',   flex:1.5, minWidth:160 },
    { field:'entrepriseNom',       headerName:'Entreprise',  flex:1,   minWidth:130 },
    { field:'formateurNomComplet', headerName:'Formateur',   flex:1,   minWidth:130 },
    { field:'dateDebut',           headerName:'Début',       width:110 },
    { field:'dateFin',             headerName:'Fin',         width:110 },
    { field:'dJours',              headerName:'Durée (j)',   width:90,  type:'number' },
    {
      field: 'statut', headerName: 'Statut', width: 120,
      renderCell: (params) => <StatutChip value={params.value} />,
    },
    {
      field: 'participantsCount', headerName: 'Participants', width: 110,
      renderCell: (params) => (
        <Button size="small" variant="outlined"
          startIcon={<GroupIcon sx={{ fontSize:14 }} />}
          onClick={(e) => {
            e.stopPropagation();
            setEditingParticipantsSession(params.row);
            setParticipantsPanelOpen(true);
          }}
        >
          {params.row.participantsCount ?? 0}
        </Button>
      ),
    },
    {
      field: 'actions', headerName: 'Actions', width: 120, sortable: false,
      renderCell: (params) => (
        <Box sx={{ display:'flex', gap:0.5 }}>
          <IconButton size="small" color="primary"
            onClick={(e) => { e.stopPropagation(); handleEdit(params.row); }}>
            <EditIcon fontSize="small" />
          </IconButton>
          <IconButton size="small" color="error"
            onClick={(e) => {
              e.stopPropagation();
              setDeletingId(params.row.idSession);
              setDeleteOpen(true);
            }}>
            <DeleteIcon fontSize="small" />
          </IconButton>
        </Box>
      ),
    },
  ];

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Sessions de Formation</Typography>

      <Card sx={{ borderRadius:2, boxShadow:'none', border:'1px solid', borderColor:'divider' }}>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid item xs={12} sm={6} md={4}>
              <TextField fullWidth size="small"
                label="Rechercher par formation, référence, entreprise..."
                value={search} onChange={e => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6} md={8}
              sx={{ display:'flex', gap:1, justifyContent:{ xs:'flex-start', md:'flex-end' } }}
            >
              <Button variant="contained" startIcon={<AddIcon />}
                onClick={() => { setEditingSession(null); setSessionModalOpen(true); }}
              >
                Créer une session
              </Button>
            </Grid>
          </Grid>

          <Box sx={{ height:'70vh' }}>
            <DataGrid
              rows={filteredRows} columns={columns}
              getRowId={row => row.idSession} loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 20 } },
                sorting: { sortModel: [{ field:'idSession', sort:'desc' }] },
              }}
              onRowClick={(params) => navigate(`/em/sessions/${params.row.idSession}`)}
              sx={{ cursor:'pointer' }}
              disableRowSelectionOnClick
            />
          </Box>
        </CardContent>
      </Card>

      {/* Create / Edit — scoped formations + entreprise pre-filled */}
      <EMSessionModal
        open={sessionModalOpen}
        onClose={() => { setSessionModalOpen(false); setEditingSession(null); }}
        onCreated={() => fetchSessions(false)}
        showSnackbar={showSnackbar}
        initialData={editingSession}
      />

      {/* Delete confirm */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>Êtes-vous sûr de vouloir supprimer cette session ? Cette action est irréversible.</DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleDeleteConfirm}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Participants panel — uses GET /api/em/employes (scoped) */}
      <Dialog open={participantsPanelOpen} onClose={() => setParticipantsPanelOpen(false)} maxWidth="sm" fullWidth>
        <DialogContent sx={{ p:0 }}>
          {editingParticipantsSession && (
            <EMSessionParticipantsPanel
              session={editingParticipantsSession}
              onClose={() => setParticipantsPanelOpen(false)}
              onUpdated={() => fetchSessions(false)}
              showSnackbar={showSnackbar}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Bulk participants modal — uses GET /api/em/employes (scoped) */}
      {editingParticipantsSession && (
        <EMParticipantsModal
          open={participantsModalOpen}
          onClose={() => setParticipantsModalOpen(false)}
          preSelectedParticipants={editingParticipantsSession.participants ?? []}
          onSelectParticipants={handleParticipantsUpdate}
        />
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical:'top', horizontal:'center' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
// frontend-template/vite/src/views/sessions/SessionParticipantsPanel.jsx
import { useEffect, useState } from "react";
import {
  Box, Typography, Button, IconButton,
  Dialog, DialogTitle, DialogContent, DialogActions,
  TextField, Stack, useMediaQuery,
} from "@mui/material";
import { useTheme }      from "@mui/material/styles";
import { DataGrid }      from "@mui/x-data-grid";
import DeleteIcon        from "@mui/icons-material/Delete";
import GroupRemoveIcon   from "@mui/icons-material/GroupRemove";
import DownloadIcon      from "@mui/icons-material/Download";
import PictureAsPdfIcon  from "@mui/icons-material/PictureAsPdf";
import ParticipantsModal from "./ParticipantsModal";
import {
  getSessionParticipants,
  addParticipantsToSession,
  removeParticipantsFromSession,
  getAllEmployees,
} from "../../api/sessionApi";
import * as XLSX    from "xlsx";
import jsPDF        from "jspdf";
import autoTable    from "jspdf-autotable";

// readOnly={true}  → VISITOR: can see list, export, but cannot add/remove
const SessionParticipantsPanel = ({ session, onUpdated, showSnackbar, readOnly = false }) => {
  const theme    = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [participants,         setParticipants]         = useState([]);
  const [loading,              setLoading]              = useState(true);
  const [search,               setSearch]               = useState("");
  const [openAddModal,         setOpenAddModal]         = useState(false);
  const [availableEmployees,   setAvailableEmployees]   = useState([]);
  const [confirmDeleteOpen,    setConfirmDeleteOpen]    = useState(false);
  const [participantToDelete,  setParticipantToDelete]  = useState(null);
  const [confirmRemoveAllOpen, setConfirmRemoveAllOpen] = useState(false);

  useEffect(() => {
    if (session) fetchParticipants();
  }, [session]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const data = await getSessionParticipants(session.idSession);
      setParticipants(data);
    } catch {
      showSnackbar?.("Impossible de charger les participants.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Add ───────────────────────────────────────────────────────────────────
  const handleOpenAddModal = async () => {
    try {
      const all        = await getAllEmployees();
      const assignedIds = participants.map(p => p.idEmploye);
      setAvailableEmployees(all.filter(e => !assignedIds.includes(e.idEmploye)));
      setOpenAddModal(true);
    } catch {
      showSnackbar?.("Impossible de charger les employés.", "error");
    }
  };

  const handleAddParticipants = async (selected) => {
    try {
      await addParticipantsToSession(session.idSession, selected.map(p => p.idEmploye));
      showSnackbar?.(`${selected.length} participant(s) ajouté(s) avec succès !`, "success");
      setOpenAddModal(false);
      fetchParticipants();
      onUpdated?.();
    } catch {
      showSnackbar?.("Erreur ajout participants.", "error");
    }
  };

  // ── Delete one ────────────────────────────────────────────────────────────
  const handleDeleteClick   = (p) => { setParticipantToDelete(p); setConfirmDeleteOpen(true); };
  const handleConfirmDelete = async () => {
    if (!participantToDelete) return;
    try {
      await removeParticipantsFromSession(session.idSession, [participantToDelete.idEmploye]);
      showSnackbar?.("Participant supprimé avec succès !", "success");
      setConfirmDeleteOpen(false);
      setParticipantToDelete(null);
      fetchParticipants();
      onUpdated?.();
    } catch {
      showSnackbar?.("Erreur suppression participant.", "error");
    }
  };

  // ── Remove all ────────────────────────────────────────────────────────────
  const handleRemoveAll = async () => {
    try {
      await removeParticipantsFromSession(session.idSession, participants.map(p => p.idEmploye));
      showSnackbar?.("Tous les participants ont été supprimés.", "success");
      setConfirmRemoveAllOpen(false);
      fetchParticipants();
      onUpdated?.();
    } catch {
      showSnackbar?.("Erreur suppression globale.", "error");
    }
  };

  // ── Exports ───────────────────────────────────────────────────────────────
  const exportToExcel = () => {
    const data = participants.map(p => ({
      Nom: p.nom, Prénom: p.prenom,
      CIN: p.cin || "", Matricule: p.matricule || "",
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Participants");
    XLSX.writeFile(wb, `participants_${session.referenceSession}.xlsx`);
    showSnackbar?.("Export Excel réussi !", "success");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Participants - Session ${session.referenceSession}`, 10, 10);
    autoTable(doc, {
      head: [["Nom", "Prénom", "CIN", "Matricule"]],
      body: participants.map(p => [p.nom, p.prenom, p.cin || "", p.matricule || ""]),
    });
    doc.save(`participants_${session.referenceSession}.pdf`);
    showSnackbar?.("Export PDF réussi !", "success");
  };

  // ── Filter ────────────────────────────────────────────────────────────────
  const filteredParticipants = participants.filter(p => {
    const kw = search.toLowerCase();
    return (
      p.nom?.toLowerCase().includes(kw)      ||
      p.prenom?.toLowerCase().includes(kw)   ||
      p.cin?.toLowerCase().includes(kw)      ||
      p.matricule?.toLowerCase().includes(kw)
    );
  });

  // ── Columns — actions column hidden for readOnly/VISITOR ──────────────────
  const baseColumns = [
    { field: "nom",       headerName: "Nom",       flex: 1 },
    { field: "prenom",    headerName: "Prénom",     flex: 1 },
    { field: "cin",       headerName: "CIN",        flex: 1 },
    { field: "matricule", headerName: "Matricule",  flex: 1 },
  ];

  const actionsColumn = {
    field: "actions", headerName: "Actions", width: 100, sortable: false,
    renderCell: (params) => (
      <IconButton color="error" size="small" onClick={() => handleDeleteClick(params.row)}>
        <DeleteIcon />
      </IconButton>
    ),
  };

  const columns = readOnly ? baseColumns : [...baseColumns, actionsColumn];

  return (
    <Box p={2}>
      <Typography variant="h6" mb={2} textAlign={isMobile ? "center" : "left"}>
        Participants — Session «{session.referenceSession}»
      </Typography>

      <TextField
        fullWidth label="Rechercher..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* Button bar — mutation buttons hidden for VISITOR */}
      <Stack direction={isMobile ? "column" : "row"} spacing={1} mb={1}>
        {!readOnly && (
          <Button variant="contained" onClick={handleOpenAddModal}>
            Ajouter des participants
          </Button>
        )}
        {!readOnly && (
          <Button variant="outlined" color="error" startIcon={<GroupRemoveIcon />}
            onClick={() => setConfirmRemoveAllOpen(true)}>
            Tout supprimer
          </Button>
        )}
        {/* Exports always visible */}
        <Button variant="outlined" startIcon={<DownloadIcon />} onClick={exportToExcel}>
          Excel
        </Button>
        <Button variant="outlined" startIcon={<PictureAsPdfIcon />} onClick={exportToPDF}>
          PDF
        </Button>
      </Stack>

      <Box sx={{ height: "70vh", width: "100%", overflowX: "auto" }}>
        <Box sx={{ minWidth: 700, height: isMobile ? 320 : 800 }}>
          <DataGrid
            rows={filteredParticipants}
            columns={columns}
            getRowId={row => row.idEmploye}
            loading={loading}
            pageSizeOptions={[10, 20, 50, 100]}
            disableRowSelectionOnClick
          />
        </Box>
      </Box>

      {/* Add participants modal — never mounted for VISITOR */}
      {!readOnly && openAddModal && (
        <ParticipantsModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          employeesList={availableEmployees}
          onSelectParticipants={handleAddParticipants}
        />
      )}

      {/* Delete one confirm */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Supprimer participant ?</DialogTitle>
        <DialogContent>
          Supprimer {participantToDelete?.nom} {participantToDelete?.prenom} ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Remove all confirm */}
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

export default SessionParticipantsPanel;
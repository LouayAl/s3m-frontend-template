// frontend-template/vite/src/views/sessions/SessionParticipantsPanel.jsx

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Button,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  useMediaQuery,
} from "@mui/material";

import { useTheme } from "@mui/material/styles";

import { DataGrid } from "@mui/x-data-grid";

import DeleteIcon from "@mui/icons-material/Delete";
import GroupRemoveIcon from "@mui/icons-material/GroupRemove";
import DownloadIcon from "@mui/icons-material/Download";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";

import ParticipantsModal from "./ParticipantsModal";

import {
  getSessionParticipants,
  addParticipantsToSession,
  removeParticipantsFromSession,
  getAllEmployees,
} from "../../api/sessionApi";

import * as XLSX from "xlsx";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

const SessionParticipantsPanel = ({ session, onUpdated, showSnackbar }) => {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(true);

  // Search
  const [search, setSearch] = useState("");

  // Add modal
  const [openAddModal, setOpenAddModal] = useState(false);
  const [availableEmployees, setAvailableEmployees] = useState([]);

  // Delete one participant
  const [confirmDeleteOpen, setConfirmDeleteOpen] = useState(false);
  const [participantToDelete, setParticipantToDelete] = useState(null);

  // Delete all participants
  const [confirmRemoveAllOpen, setConfirmRemoveAllOpen] = useState(false);

  /* ============================
     RESPONSIVE SETTINGS
     ============================ */
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  /* ============================
     FETCH PARTICIPANTS
     ============================ */
  useEffect(() => {
    if (session) fetchParticipants();
  }, [session]);

  const fetchParticipants = async () => {
    try {
      setLoading(true);
      const data = await getSessionParticipants(session.idSession);
      setParticipants(data);
    } catch (err) {
      console.error(err);
      showSnackbar?.("Impossible de charger les participants.", "error");
    } finally {
      setLoading(false);
    }
  };

  /* ============================
     OPEN ADD MODAL
     ============================ */
  const handleOpenAddModal = async () => {
    try {
      const allEmployees = await getAllEmployees();

      const assignedIds = participants.map((p) => p.idEmploye);

      const filtered = allEmployees.filter(
        (emp) => !assignedIds.includes(emp.idEmploye)
      );

      setAvailableEmployees(filtered);
      setOpenAddModal(true);
    } catch (err) {
      console.error(err);
      showSnackbar?.("Impossible de charger les employés.", "error");
    }
  };

  /* ============================
     ADD PARTICIPANTS
     ============================ */
  const handleAddParticipants = async (selected) => {
    try {
      const idsToAdd = selected.map((p) => p.idEmploye);
      if (idsToAdd.length === 0) return;

      await addParticipantsToSession(session.idSession, idsToAdd);

      showSnackbar?.(
        `${selected.length} participant(s) ajouté(s) avec succès !`,
        "success"
      );

      setOpenAddModal(false);
      fetchParticipants();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      showSnackbar?.("Erreur ajout participants.", "error");
    }
  };

  /* ============================
     DELETE ONE PARTICIPANT
     ============================ */
  const handleDeleteClick = (participant) => {
    setParticipantToDelete(participant);
    setConfirmDeleteOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!participantToDelete) return;

    try {
      await removeParticipantsFromSession(session.idSession, [
        participantToDelete.idEmploye,
      ]);

      showSnackbar?.("Participant supprimé avec succès !", "success");

      setConfirmDeleteOpen(false);
      setParticipantToDelete(null);

      fetchParticipants();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      showSnackbar?.("Erreur suppression participant.", "error");
    }
  };

  /* ============================
     REMOVE ALL PARTICIPANTS
     ============================ */
  const handleRemoveAll = async () => {
    try {
      const allIds = participants.map((p) => p.idEmploye);
      if (allIds.length === 0) return;

      await removeParticipantsFromSession(session.idSession, allIds);

      showSnackbar?.("Tous les participants ont été supprimés.", "success");

      setConfirmRemoveAllOpen(false);

      fetchParticipants();
      onUpdated?.();
    } catch (err) {
      console.error(err);
      showSnackbar?.("Erreur suppression globale.", "error");
    }
  };

  /* ============================
     EXPORTS
     ============================ */
  const exportToExcel = () => {
    const data = participants.map((p) => ({
      Nom: p.nom,
      Prénom: p.prenom,
      Matricule: p.matricule || "",
    }));

    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Participants");

    XLSX.writeFile(workbook, `participants_${session.referenceSession}.xlsx`);

    showSnackbar?.("Export Excel réussi !", "success");
  };

  const exportToPDF = () => {
    const doc = new jsPDF();
    doc.text(`Participants - Session ${session.referenceSession}`, 10, 10);

    autoTable(doc, {
      head: [["Nom", "Prénom", "Matricule"]],
      body: participants.map((p) => [
        p.nom,
        p.prenom,
        p.matricule || "",
      ]),
    });

    doc.save(`participants_${session.referenceSession}.pdf`);

    showSnackbar?.("Export PDF réussi !", "success");
  };

  /* ============================
     FILTER PARTICIPANTS
     ============================ */
  const filteredParticipants = participants.filter((p) => {
    const keyword = search.toLowerCase();
    return (
      p.nom?.toLowerCase().includes(keyword) ||
      p.prenom?.toLowerCase().includes(keyword) ||
      p.matricule?.toLowerCase().includes(keyword)
    );
  });

  /* ============================
     DATAGRID COLUMNS
     ============================ */
  const columns = [
    {
      field: "nom",
      headerName: "Nom",
      flex: 1,
    },
    {
      field: "prenom",
      headerName: "Prénom",
      flex: 1,
    },
    {
      field: "matricule",
      headerName: "Matricule",
      flex: 1,
      hide: isMobile, // 👈 hide matricule column on mobile
    },
    {
      field: "actions",
      headerName: "Actions",
      width: 100,
      sortable: false,
      renderCell: (params) => (
        <IconButton
          color="error"
          size="small"
          onClick={() => handleDeleteClick(params.row)}
        >
          <DeleteIcon />
        </IconButton>
      ),
    },
  ];

  return (
    <Box p={2}>
      {/* TITLE */}
      <Typography
        variant="h6"
        mb={2}
        textAlign={isMobile ? "center" : "left"}
      >
        Participants - Session "{session.referenceSession}"
      </Typography>

      {/* SEARCH */}
      <TextField
        fullWidth
        label="Rechercher..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        sx={{ mb: 2 }}
      />

      {/* BUTTONS RESPONSIVE */}
      <Stack
        direction={isMobile ? "column" : "row"}
        spacing={1}
        mb={1}
      >
        <Button variant="contained" onClick={handleOpenAddModal}>
          Ajouter des participants
        </Button>

        <Button
          variant="outlined"
          color="error"
          startIcon={<GroupRemoveIcon />}
          onClick={() => setConfirmRemoveAllOpen(true)}
        >
          Tout supprimer
        </Button>

        <Button
          variant="outlined"
          startIcon={<DownloadIcon />}
          onClick={exportToExcel}
        >
          Excel
        </Button>

        <Button
          variant="outlined"
          startIcon={<PictureAsPdfIcon />}
          onClick={exportToPDF}
        >
          PDF
        </Button>
      </Stack>

      {/* DATAGRID RESPONSIVE HEIGHT */}
      <Box sx={{ height: "70vh", width: "100%", overflowX: "auto" }}>
        <Box sx={{ minWidth: 500, height: isMobile ? 320 : 420 }}>
            <DataGrid
            rows={filteredParticipants}
            columns={columns}
            getRowId={(row) => row.idEmploye}
            loading={loading}
            pageSizeOptions={[10, 20, 50, 100]}
            disableRowSelectionOnClick
            />
        </Box>
      </Box>

      {/* ADD PARTICIPANTS MODAL */}
      {openAddModal && (
        <ParticipantsModal
          open={openAddModal}
          onClose={() => setOpenAddModal(false)}
          employeesList={availableEmployees}
          onSelectParticipants={handleAddParticipants}
        />
      )}

      {/* DELETE ONE CONFIRM */}
      <Dialog open={confirmDeleteOpen} onClose={() => setConfirmDeleteOpen(false)}>
        <DialogTitle>Supprimer participant ?</DialogTitle>
        <DialogContent>
          Supprimer {participantToDelete?.nom} {participantToDelete?.prenom} ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmDeleteOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleConfirmDelete}>
            Supprimer
          </Button>
        </DialogActions>
      </Dialog>

      {/* REMOVE ALL CONFIRM */}
      <Dialog
        open={confirmRemoveAllOpen}
        onClose={() => setConfirmRemoveAllOpen(false)}
      >
        <DialogTitle>Supprimer tous ?</DialogTitle>
        <DialogContent>
          Retirer tous les participants de cette session ?
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setConfirmRemoveAllOpen(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleRemoveAll}>
            Oui, supprimer
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SessionParticipantsPanel;

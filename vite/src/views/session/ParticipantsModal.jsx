// frontend-template/vite/src/views/sessions/ParticipantsModal.jsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Box,
  Stack,
  CircularProgress
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getAllEmployes } from "../../api/employeApi";

const ParticipantsModal = ({ open, onClose, onSelectParticipants }) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch employees when modal opens
  useEffect(() => {
    if (open) fetchEmployees();
  }, [open]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployes();
      console.log("Employees fetched:", data);
      setEmployees(data);
    } catch (err) {
      console.error("Erreur lors du chargement des employés :", err);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirm = () => {
    console.log("Selected IDs before confirm:", selectedIds);
    const selectedEmployees = employees.filter(emp => selectedIds.includes(emp.idEmploye));
    console.log("Selected employees:", selectedEmployees);
    onSelectParticipants(selectedEmployees);
    onClose();
  };

  const filteredRows = employees.filter((emp) => {
    const keyword = search.toLowerCase();
    return (
      emp.nom?.toLowerCase().includes(keyword) ||
      emp.prenom?.toLowerCase().includes(keyword) ||
      emp.cin?.toLowerCase().includes(keyword) ||
      emp.matricule?.toLowerCase().includes(keyword)
    );
  });

  const columns = [
    { field: "nom", headerName: "Nom", flex: 1, minWidth: 120, headerAlign: "center", align: "center" },
    { field: "prenom", headerName: "Prénom", flex: 1, minWidth: 120, headerAlign: "center", align: "center" },
    { field: "cin", headerName: "CIN", width: 120, headerAlign: "center", align: "center" },
    { field: "matricule", headerName: "Matricule", width: 120, headerAlign: "center", align: "center" }
  ];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Choisir des Participants</DialogTitle>
      <DialogContent>
        <Box mb={2}>
          <TextField
            fullWidth
            label="Rechercher par nom, prénom, CIN ou matricule"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </Box>

        {loading ? (
          <Stack alignItems="center" py={3}>
            <CircularProgress />
          </Stack>
        ) : (
          <Box sx={{ height: 400 }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => row.idEmploye}
              pageSizeOptions={[10, 20, 50]}
              checkboxSelection
              selectionModel={selectedIds}
              onRowSelectionModelChange={(selectionModel) => {
                // Depending on MUI version, selectionModel may be an object with { type, ids }
                const idsArray = Array.isArray(selectionModel)
                  ? selectionModel
                  : Array.from(selectionModel.ids || []); 
                console.log("Row selection changed:", selectionModel, "→ selected IDs:", idsArray);
                setSelectedIds(idsArray);
              }}
            />
          </Box>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" color="primary" onClick={handleConfirm}>
          Confirmer la sélection
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ParticipantsModal;

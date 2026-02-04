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

const ParticipantsModal = ({
  open,
  onClose,
  onSelectParticipants,
  preSelectedParticipants = [],
  employeesList = null, // Optional custom employee list
}) => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);

  // Fetch employees when modal opens if no custom list
  useEffect(() => {
    if (open && !employeesList) fetchEmployees();
    else if (employeesList) {
      setEmployees(employeesList);
      setLoading(false);
    }
  }, [open, employeesList]);

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      const data = await getAllEmployes();
      console.log("Employees fetched:", data.length, data);
      setEmployees(data);
    } catch (err) {
      console.error("Erreur lors du chargement des employés :", err);
    } finally {
      setLoading(false);
    }
  };

  // Preselect participants after employees are loaded
  useEffect(() => {
    const source = employeesList || employees;
    if (!loading && source.length > 0 && preSelectedParticipants.length > 0) {
      const validIds = preSelectedParticipants
        .map(p => Number(p.idEmploye))
        .filter(id => source.some(emp => Number(emp.idEmploye) === id));

      console.log("Prefilled selected IDs after employees loaded:", validIds);

      setTimeout(() => setSelectedIds(validIds), 0);
    }
  }, [loading, employees, preSelectedParticipants, employeesList]);

  const handleConfirm = () => {
    console.log("Selected IDs on confirm:", selectedIds);

    const source = employeesList || employees;
    const selectedEmployees = source.filter(emp =>
      selectedIds.includes(Number(emp.idEmploye))
    );

    // Merge with preSelectedParticipants, deduplicate
    const allSelected = selectedEmployees.reduce((acc, curr) => {
      if (!acc.find(p => Number(p.idEmploye) === Number(curr.idEmploye))) {
        acc.push(curr);
      }
      return acc;
    }, []);

    console.log("All selected participants to send:", allSelected);
    onSelectParticipants(allSelected);

    // Keep selected IDs in sync
    setSelectedIds(allSelected.map(p => Number(p.idEmploye)));
  };

  const filteredRows = (employeesList || employees).filter(emp => {
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
          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={(row) => Number(row.idEmploye)}
              pageSizeOptions={[10, 20, 50]}
              checkboxSelection
              selectionModel={selectedIds}
              onRowSelectionModelChange={(newSelection) => {
                let normalized = [];
                if (Array.isArray(newSelection)) normalized = newSelection.map(Number);
                else if (newSelection?.ids instanceof Set) normalized = Array.from(newSelection.ids).map(Number);
                setSelectedIds(normalized);
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

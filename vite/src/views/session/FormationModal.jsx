// frontend-template/vite/src/views/sessions/FormationModal.jsx
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  Stack,
  Typography,
  CircularProgress,
  MenuItem,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { getAllFormations } from "../../api/formationApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import { useAuth } from "../../contexts/auth/AuthContext";

const FormationModal = ({ open, onClose, onFormationSelected }) => {
  const { user } = useAuth();
  const isAdmin  = user?.role === "ADMIN";

  const [formations, setFormations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    typeFormation: "",
    familleFormation: "",
    sousFamille: "",
    interneExterne: "",
    annee: ""
  });

  // Admin-only: entreprise filter dropdown, so the admin knows exactly which
  // company's formation catalogue they're picking from.
  const [entreprises,        setEntreprises]        = useState([]);
  const [filterEntrepriseId, setFilterEntrepriseId] = useState(""); // '' = all

  useEffect(() => {
    if (!open || !isAdmin) return;
    getAllEntreprises().then(setEntreprises).catch(() => {});
  }, [open, isAdmin]);

  useEffect(() => {
    if (open) fetchFormations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, filterEntrepriseId]);

  const fetchFormations = async () => {
    try {
        setLoading(true);
        const data = await getAllFormations(isAdmin ? (filterEntrepriseId || null) : undefined);
        setFormations(data);
    } catch {
      // Could add snackbar for errors
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (formation) => {
    onFormationSelected(formation); // parent handles filling dHeures/dJours + entreprise cross-check
    onClose();
  };

const filteredRows = formations.filter((f) => {
  const searchMatch = f.module
    ?.toLowerCase()
    .includes(search.toLowerCase());

  const typeMatch = filters.typeFormation
    ? f.typeFormation
        ?.toLowerCase()
        .includes(filters.typeFormation.toLowerCase())
    : true;

  const familleMatch = filters.familleFormation
    ? f.familleFormation
        ?.toLowerCase()
        .includes(filters.familleFormation.toLowerCase())
    : true;

  const sousFamilleMatch = filters.sousFamille
    ? f.sousFamille
        ?.toLowerCase()
        .includes(filters.sousFamille.toLowerCase())
    : true;

  const interneMatch = filters.interneExterne
    ? f.interneExterne
        ?.toLowerCase()
        .includes(filters.interneExterne.toLowerCase())
    : true;

  const anneeMatch = filters.annee
    ? String(f.annee).includes(String(filters.annee))
    : true;

  return (
    searchMatch &&
    typeMatch &&
    familleMatch &&
    sousFamilleMatch &&
    interneMatch &&
    anneeMatch
  );
});


const columns = [
  { field: "module", headerName: "Formation Module", flex: 1, minWidth: 160 },
  // Entreprise column only makes sense once an admin can browse across companies
  ...(isAdmin ? [{ field: "entrepriseNom", headerName: "Entreprise", flex: 1, minWidth: 150 }] : []),
  { field: "familleFormation", headerName: "Famille", flex: 1, minWidth: 120 },
  { field: "typeFormation", headerName: "Type", flex: 1, minWidth: 120 },
  { field: "sousFamille", headerName: "Sous-famille", flex: 1, minWidth: 120 },
  { field: "interneExterne", headerName: "Interne/Externe", width: 140 },
  { field: "annee", headerName: "Année", width: 100 },
  { field: "dureeHeures", headerName: "Durée (h)", width: 100 },
  { field: "dureeJours", headerName: "Durée (j)", width: 100 }
];

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>
      <DialogTitle>Choisir une Formation</DialogTitle>
      <DialogContent>
        <Box mb={2}>


          <Grid container spacing={2}>
            {/* Entreprise dropdown — ADMIN only */}
            {isAdmin && (
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select fullWidth
                  label="Filtrer par entreprise"
                  value={filterEntrepriseId}
                  onChange={(e) => setFilterEntrepriseId(e.target.value)}
                >
                  <MenuItem value=""><em>Toutes les entreprises</em></MenuItem>
                  {entreprises.map((en) => (
                    <MenuItem key={en.idEntreprise} value={en.idEntreprise}>
                      {en.nomEntreprise}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            <Grid size={{ xs: 12, md: isAdmin ? 3 : 4 }}>
              <TextField
                fullWidth
                label="Rechercher par module"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </Grid>

            

            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Famille"
                value={filters.familleFormation}
                onChange={(e) => setFilters((prev) => ({ ...prev, familleFormation: e.target.value }))}
              />
            </Grid>
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Type"
                value={filters.typeFormation}
                onChange={(e) => setFilters((prev) => ({ ...prev, typeFormation: e.target.value }))}
              />
            </Grid>
            
            <Grid size={{ xs: 12, md: 2 }}>
              <TextField
                fullWidth
                label="Année"
                value={filters.annee}
                onChange={(e) => setFilters((prev) => ({ ...prev, annee: e.target.value }))}
              />
            </Grid>
          </Grid>
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
              getRowId={(row) => row.id}
              pageSizeOptions={[10, 20, 50, 100]}
              onRowClick={(params) => handleSelect(params.row)}
            />
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
      </DialogActions>
    </Dialog>
  );
};

export default FormationModal;
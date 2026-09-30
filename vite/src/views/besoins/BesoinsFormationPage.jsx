        // frontend-template/vite/src/views/besoins/BesoinsFormationPage.jsx
import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Stack, IconButton, MenuItem,
  Snackbar, Alert, Dialog, DialogTitle, Chip,
  DialogContent, DialogContentText, DialogActions, Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import BesoinFormationModal from "./BesoinFormationModal";
import { getAllBesoins, deleteBesoin, decideBesoin } from "../../api/besoinFormationApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import { useAuth } from "../../contexts/auth/AuthContext";
import { useGlobalFilter } from "../../contexts/filters/GlobalFilterContext";

// Only ADMIN can create/edit/delete training-needs entries
const CAN_MUTATE = new Set(["ADMIN"]);

// A small helper so long free-text columns (Objectifs, Compétences ciblées...)
// show a native tooltip with the full text on hover instead of overflowing.
const truncatedCell = (params) => (
  <span title={params.value || ""}>{params.value}</span>
);

const BesoinsFormationPage = () => {
  const { user } = useAuth();
  const canEdit  = CAN_MUTATE.has(user?.role);
  const isAdmin  = user?.role === "ADMIN";
  const isChef = user?.role === "CHEF_DEPARTEMENT";
  const canCreateRequest = isAdmin || isChef;

  const [besoins, setBesoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  // Admin-only: entreprise filter dropdown
  const [entreprises,        setEntreprises]        = useState([]);
  const { selectedEntrepriseId: filterEntrepriseId, setSelectedEntrepriseId: setFilterEntrepriseId } = useGlobalFilter();
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingBesoin, setEditingBesoin] = useState(null);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBesoinId, setSelectedBesoinId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar        = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // ── Load entreprises for admin dropdown ──────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    getAllEntreprises('CLIENT')
      .then(setEntreprises)
      .catch(() => showSnackbar("Erreur chargement entreprises", "error"));
  }, [isAdmin]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => { fetchBesoins(); }, [filterEntrepriseId, isAdmin]);

  const fetchBesoins = async () => {
    try {
      setLoading(true);
      const data = await getAllBesoins(isAdmin ? (filterEntrepriseId || null) : undefined);
      setBesoins(data);
    } catch {
      showSnackbar("Erreur lors du chargement des besoins de formation.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Modal ─────────────────────────────────────────────────────────────────
  const handleModalOpen  = (besoin = null) => { setEditingBesoin(besoin); setModalOpen(true); };
  const handleModalClose = () => { setEditingBesoin(null); setModalOpen(false); };

  const handleSave = (saved) => {
    const savedArray = Array.isArray(saved) ? saved : [saved];
    setBesoins((prev) => {
        let updated = [...prev];
        savedArray.forEach((item) => {
        const idx = updated.findIndex((b) => b.id === item.id);
        if (idx >= 0) updated[idx] = item;
        else updated = [item, ...updated];
        });
        return updated;
    });
    handleModalClose();
    };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleOpenDeleteDialog  = (id) => { setSelectedBesoinId(id); setOpenDeleteDialog(true); };
  const handleCloseDeleteDialog = () => { setOpenDeleteDialog(false); setSelectedBesoinId(null); };

  const confirmDelete = async () => {
    try {
      await deleteBesoin(selectedBesoinId);
      setBesoins(prev => prev.filter(b => b.id !== selectedBesoinId));
      showSnackbar("Besoin de formation supprimé avec succès !");
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Impossible de supprimer ce besoin.", "error");
    } finally {
      handleCloseDeleteDialog();
    }
  };

  // ── Columns ───────────────────────────────────────────────────────────────
  const baseColumns = [
    // Entreprise column only makes sense once an admin can browse across companies
    ...(isAdmin ? [{ field: "entrepriseNom", headerName: "Entreprise", flex: 1, minWidth: 150 }] : []),
    { field: "dept",               headerName: "Dept",              width: 130 },
    { field: "demandeur",          headerName: "Demandeur",          width: 160 },
    { field: "status",             headerName: "Statut",             width: 140,
      renderCell: ({ value }) => <Chip size="small" label={{ PENDING: "En attente", APPROVED: "Approuvée", REJECTED: "Refusée" }[value] || value || "Approuvée"}
        color={value === "REJECTED" ? "error" : value === "PENDING" ? "warning" : "success"} /> },
    { field: "intitule",           headerName: "Besoin en Formation", flex: 1.5, minWidth: 220, renderCell: truncatedCell },
    { field: "populationCible",    headerName: "Population cible",  width: 150 },
    { field: "nbCadre",            headerName: "Cadre",             width: 90 },
    { field: "nbTam",              headerName: "TAM",               width: 90 },
    { field: "nbPro",              headerName: "PRO",               width: 90 },
    { field: "priorite",           headerName: "Priorité",          width: 100 },
    { field: "periode",            headerName: "Période",           width: 130 },
    { field: "objectifs",          headerName: "Objectifs",         flex: 1.5, minWidth: 220, renderCell: truncatedCell },
    { field: "competencesCiblees", headerName: "Compétences ciblées", flex: 1.5, minWidth: 220, renderCell: truncatedCell },
    { field: "indicateursSucces",  headerName: "Indicateurs de succès", flex: 1, minWidth: 180, renderCell: truncatedCell },
    { field: "evaluation",         headerName: "Evaluation",        flex: 1, minWidth: 150, renderCell: truncatedCell },
    { field: "budgetEstimatif",    headerName: "Budget Estimatif",  width: 140 },
    { field: "rejectionReason",    headerName: "Motif du refus",    flex: 1, minWidth: 180, renderCell: truncatedCell },
    { field: "remarques",          headerName: "Remarques",         flex: 1, minWidth: 180, renderCell: truncatedCell },
  ];

  const actionsColumn = {
    field: "actions", headerName: "Actions", width: 190, sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        {isAdmin && params.row.status === "PENDING" && <>
          <IconButton color="success" size="small" title="Approuver" onClick={() => handleDecision(params.row, "APPROVED")}>
            <CheckCircleOutlineIcon />
          </IconButton>
          <IconButton color="error" size="small" title="Refuser" onClick={() => { setRejectTarget(params.row); setRejectionReason(""); }}>
            <HighlightOffIcon />
          </IconButton>
        </>}
        <IconButton color="primary" size="small" onClick={() => handleModalOpen(params.row)}>
          <EditIcon />
        </IconButton>
        <IconButton color="error" size="small" onClick={() => handleOpenDeleteDialog(params.row.id)}>
          <DeleteIcon />
        </IconButton>
      </Stack>
    ),
  };

  const columns = canEdit ? [...baseColumns, actionsColumn] : baseColumns;

  const handleDecision = async (besoin, status, reason = null) => {
    try {
      const updated = await decideBesoin(besoin.id, status, reason);
      setBesoins(prev => prev.map(item => item.id === updated.id ? updated : item));
      setRejectTarget(null);
      setRejectionReason("");
      showSnackbar(status === "APPROVED" ? "Demande approuvée." : "Demande refusée; le motif a été communiqué.");
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Impossible de traiter la demande.", "error");
    }
  };

  const filteredRows = besoins.filter(b =>
    b.intitule?.toLowerCase().includes(search.toLowerCase()) ||
    b.dept?.toLowerCase().includes(search.toLowerCase())
  );

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Besoins en Formation</Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid size={{ xs: 12, md: isAdmin ? 4 : 6 }}>
              <TextField
                fullWidth
                label="Rechercher par intitulé ou département"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>

            {/* Entreprise dropdown — ADMIN only */}
            {isAdmin && (
              <Grid size={{ xs: 12, md: 3 }}>
                <TextField
                  select fullWidth
                  label="Filtrer par entreprise"
                  value={filterEntrepriseId}
                  onChange={e => setFilterEntrepriseId(e.target.value)}
                >
                  <MenuItem value=""><em>Toutes les entreprises</em></MenuItem>
                  {entreprises.map(ent => (
                    <MenuItem key={ent.idEntreprise} value={ent.idEntreprise}>
                      {ent.nomEntreprise}
                    </MenuItem>
                  ))}
                </TextField>
              </Grid>
            )}

            {canCreateRequest && (
              <Grid size={{ xs: 12, md: isAdmin ? 5 : 6 }}
                sx={{ display: "flex", justifyContent: "flex-start", gap: 1, flexWrap: "wrap" }}>
                <Button variant="contained" color="primary" onClick={() => handleModalOpen()}>
                  Nouveau Besoin
                </Button>
              </Grid>
            )}
          </Grid>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={row => row.id}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 20 } },
                columns: {
                  // Hidden by default to keep the grid readable — user can toggle back on
                  columnVisibilityModel: {
                    indicateursSucces: false,
                    evaluation: false,
                    remarques: false,
                  },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Department heads may submit; only admins can edit or delete needs. */}
      {canCreateRequest && (
        <BesoinFormationModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
          showSnackbar={showSnackbar}
          initialData={editingBesoin}
          isChef={isChef}
        />
      )}

      <Dialog open={!!rejectTarget} onClose={() => setRejectTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Refuser la demande</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 1.5 }}>
            Indiquez le motif du refus. Le chef de département pourra le consulter avant d'envoyer une nouvelle demande.
          </DialogContentText>
          <TextField autoFocus fullWidth multiline minRows={3} label="Motif du refus" value={rejectionReason}
            onChange={e => setRejectionReason(e.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRejectTarget(null)}>Annuler</Button>
          <Button color="error" variant="contained" disabled={!rejectionReason.trim()}
            onClick={() => handleDecision(rejectTarget, "REJECTED", rejectionReason.trim())}>Refuser la demande</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={openDeleteDialog} onClose={handleCloseDeleteDialog}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Êtes-vous sûr de vouloir supprimer ce besoin de formation ? Cette action est irréversible.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDeleteDialog}>Annuler</Button>
          <Button onClick={confirmDelete} color="error" variant="contained">Supprimer</Button>
        </DialogActions>
      </Dialog>

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default BesoinsFormationPage;

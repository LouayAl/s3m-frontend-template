        // frontend-template/vite/src/views/besoins/BesoinsFormationPage.jsx
import { useEffect, useState } from "react";
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Stack, IconButton, MenuItem,
  Snackbar, Alert, Dialog, DialogTitle, Chip, Checkbox,
  DialogContent, DialogContentText, DialogActions, Button,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import SendIcon from "@mui/icons-material/Send";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import BesoinFormationModal from "./BesoinFormationModal";
import { getAllBesoins, deleteBesoin, decideBesoin, submitBesoinDraft, submitBesoinDrafts } from "../../api/besoinFormationApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import { useAuth } from "../../contexts/auth/AuthContext";
import { useGlobalFilter } from "../../contexts/filters/GlobalFilterContext";

// Admins and managers share training-needs management privileges.
const CAN_MUTATE = new Set(["ADMIN", "MANAGER"]);

// A small helper so long free-text columns (Objectifs, Compétences ciblées...)
// show a native tooltip with the full text on hover instead of overflowing.
const truncatedCell = (params) => (
  <span title={params.value || ""}>{params.value}</span>
);

const BesoinsFormationPage = () => {
  const { user } = useAuth();
  const canEdit  = CAN_MUTATE.has(user?.role);
  const canManage = canEdit;
  const isChef = user?.role === "CHEF_DEPARTEMENT";
  const isRequester = isChef;
  const canCreateRequest = canManage || isRequester;

  const [besoins, setBesoins] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search,  setSearch]  = useState("");

  // Admin/manager: entreprise filter dropdown
  const [entreprises,        setEntreprises]        = useState([]);
  const { selectedEntrepriseId: filterEntrepriseId, setSelectedEntrepriseId: setFilterEntrepriseId } = useGlobalFilter();
  const [modalOpen,     setModalOpen]     = useState(false);
  const [editingBesoin, setEditingBesoin] = useState(null);
  const [duplicatingBesoin, setDuplicatingBesoin] = useState(false);

  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [selectedBesoinId, setSelectedBesoinId] = useState(null);
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectionReason, setRejectionReason] = useState("");
  const [reviewTarget, setReviewTarget] = useState(null);
  const [reviewFormationName, setReviewFormationName] = useState("");
  const [selectedDraftIds, setSelectedDraftIds] = useState(new Set());
  const [bulkSubmitting, setBulkSubmitting] = useState(false);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar        = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  // ── Load entreprises for admin/manager dropdown ──────────────────────────────────
  useEffect(() => {
    if (!canManage) return;
    getAllEntreprises('CLIENT')
      .then(setEntreprises)
      .catch(() => showSnackbar("Erreur chargement entreprises", "error"));
  }, [canManage]);

  // ── Fetch ─────────────────────────────────────────────────────────────────
  useEffect(() => { fetchBesoins(); }, [filterEntrepriseId, canManage]);

  const fetchBesoins = async () => {
    try {
      setLoading(true);
      const data = await getAllBesoins(canManage ? (filterEntrepriseId || null) : undefined);
      setBesoins(data);
    } catch {
      showSnackbar("Erreur lors du chargement des besoins de formation.", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Modal ─────────────────────────────────────────────────────────────────
  const handleModalOpen  = (besoin = null, duplicate = false) => {
    setEditingBesoin(besoin);
    setDuplicatingBesoin(duplicate);
    setModalOpen(true);
  };
  const handleModalClose = () => {
    setEditingBesoin(null);
    setDuplicatingBesoin(false);
    setModalOpen(false);
  };

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

  // Chef GET results are already restricted by the backend to that chef's own department requests.
  const normalizedStatus = (status) => String(status || "").trim().toUpperCase();
  const isOwnDraft = (row) => isChef && normalizedStatus(row.status) === "BROUILLON";
  const isPending = (row) => normalizedStatus(row?.status) === "PENDING";
  const ownDraftIds = besoins.filter(isOwnDraft).map(row => row.id);
  const allOwnDraftsSelected = ownDraftIds.length > 0 && ownDraftIds.every(id => selectedDraftIds.has(id));

  const toggleDraft = (id) => setSelectedDraftIds(prev => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    return next;
  });

  const toggleAllDrafts = () => setSelectedDraftIds(allOwnDraftsSelected ? new Set() : new Set(ownDraftIds));

  const handleBulkSubmit = async () => {
    const ids = [...selectedDraftIds].filter(id => ownDraftIds.includes(id));
    if (!ids.length) return;
    setBulkSubmitting(true);
    try {
      const submitted = await submitBesoinDrafts(ids);
      const submittedById = new Map(submitted.map(item => [item.id, item]));
      setBesoins(prev => prev.map(item => submittedById.get(item.id) || item));
      setSelectedDraftIds(new Set());
      showSnackbar(`${submitted.length} demande(s) envoyée(s) pour validation.`);
    } catch (err) {
      showSnackbar(err.response?.data?.message || "Impossible d'envoyer les demandes sélectionnées.", "error");
    } finally {
      setBulkSubmitting(false);
    }
  };

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
    ...(isChef ? [{
      field: "selectDraft", headerName: "", width: 54, sortable: false, filterable: false,
      renderCell: ({ row }) => isOwnDraft(row) ? (
        <Checkbox
          size="small"
          checked={selectedDraftIds.has(row.id)}
          onClick={event => event.stopPropagation()}
          onChange={() => toggleDraft(row.id)}
          inputProps={{ "aria-label": `Sélectionner le brouillon ${row.intitule}` }}
        />
      ) : null,
    }] : []),
    // Entreprise column only makes sense once an admin or manager can browse across companies
    ...(canManage ? [{ field: "entrepriseNom", headerName: "Entreprise", flex: 1, minWidth: 150 }] : []),
    { field: "dept",               headerName: "Dept",              width: 130 },
    { field: "demandeur",          headerName: "Demandeur",          width: 160 },
    { field: "status",             headerName: "Statut",             width: 140,
      renderCell: ({ value }) => {
        const status = normalizedStatus(value);
        return <Chip size="small" label={{ BROUILLON: "Brouillon", PENDING: "En attente", APPROVED: "Approuvée", REJECTED: "Refusée" }[status] || value || "Approuvée"}
          color={status === "REJECTED" ? "error" : status === "PENDING" ? "warning" : status === "BROUILLON" ? "default" : "success"} />;
      } },
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
    field: "actions", headerName: "Actions", width: canManage ? 250 : isRequester ? 170 : 80, sortable: false,
    renderCell: (params) => (
      <Stack direction="row" spacing={1}>
        {canManage && isPending(params.row) && <>
          <IconButton color="success" size="small" title="Approuver" onClick={() => {
            if (params.row.nouvelleFormation) {
              setReviewTarget(params.row);
              setReviewFormationName(params.row.intitule || "");
            } else {
              handleDecision(params.row, "APPROVED");
            }
          }}>
            <CheckCircleOutlineIcon />
          </IconButton>
          <IconButton color="error" size="small" title="Refuser" onClick={() => { setRejectTarget(params.row); setRejectionReason(""); }}>
            <HighlightOffIcon />
          </IconButton>
        </>}
        {isOwnDraft(params.row) && <IconButton color="success" size="small" title="Envoyer la demande à l’administrateur"
          onClick={async () => {
            try {
              const submitted = await submitBesoinDraft(params.row.id);
              setBesoins((prev) => prev.map((item) => item.id === submitted.id ? submitted : item));
              setSelectedDraftIds(prev => { const next = new Set(prev); next.delete(submitted.id); return next; });
              showSnackbar("Demande envoyée à l’administrateur pour validation.");
            } catch (err) {
              showSnackbar(err.response?.data?.message || "Impossible d’envoyer la demande.", "error");
            }
          }}><SendIcon /></IconButton>}
        {(canManage || isRequester) && (
          <IconButton color="primary" size="small" title="Dupliquer le besoin"
            onClick={() => handleModalOpen(params.row, true)}>
            <ContentCopyIcon />
          </IconButton>
        )}
        {isOwnDraft(params.row) && <IconButton color="primary" size="small" title="Modifier le brouillon" onClick={() => handleModalOpen(params.row)}>
          <EditIcon />
        </IconButton>}
        {canManage && <>
          <IconButton color="primary" size="small" title="Modifier le besoin" onClick={() => handleModalOpen(params.row)}>
            <EditIcon />
          </IconButton>
          <IconButton color="error" size="small" title="Supprimer le besoin" onClick={() => handleOpenDeleteDialog(params.row.id)}>
            <DeleteIcon />
          </IconButton>
        </>}
      </Stack>
    ),
  };

  const columns = canEdit || isRequester ? [...baseColumns, actionsColumn] : baseColumns;

  const handleDecision = async (besoin, status, reason = null, intitule = null) => {
    try {
      const updated = await decideBesoin(besoin.id, status, reason, intitule);
      setBesoins(prev => prev.map(item => item.id === updated.id ? updated : item));
      setRejectTarget(null);
      setRejectionReason("");
      setReviewTarget(null);
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
            <Grid size={{ xs: 12, md: canManage ? 4 : 6 }}>
              <TextField
                fullWidth
                label="Rechercher par intitulé ou département"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>

            {/* Entreprise dropdown — ADMIN and MANAGER */}
            {canManage && (
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
              <Grid size={{ xs: 12, md: canManage ? 5 : 6 }}
                sx={{ display: "flex", justifyContent: "flex-start", gap: 1, flexWrap: "wrap" }}>
                <Button variant="contained" color="primary" onClick={() => handleModalOpen()}>
                  Nouveau Besoin
                </Button>
              </Grid>
            )}
          </Grid>

          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 2, mb: 1.5 }}>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              {besoins.some(besoin => besoin.nouvelleFormation) && (
                <Alert severity="warning" icon={false} sx={{ py: 0, "& .MuiAlert-message": { py: 0.75 } }}>
                  Les lignes orange signalent une nouvelle formation à ajouter au catalogue des formations.
                </Alert>
              )}
            </Box>
            {isChef && (
              <Stack direction="row" spacing={1} sx={{ flexShrink: 0 }}>
                <Button size="small" variant="outlined" onClick={toggleAllDrafts} disabled={!ownDraftIds.length}>
                  {allOwnDraftsSelected ? "Désélectionner" : "Tout sélectionner"}
                </Button>
                <Button size="small" variant="contained" color="success" onClick={handleBulkSubmit}
                  disabled={!selectedDraftIds.size || bulkSubmitting}>
                  {bulkSubmitting ? "Envoi..." : `Envoyer${selectedDraftIds.size ? ` (${selectedDraftIds.size})` : ""}`}
                </Button>
              </Stack>
            )}
          </Box>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={row => row.id}
              getRowClassName={(params) => params.row.nouvelleFormation ? "new-formation-row" : ""}
              loading={loading}
              sx={{
                "& .new-formation-row": { backgroundColor: "#fff3e0" },
                "& .new-formation-row:hover": { backgroundColor: "#ffe0b2" },
              }}
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

      {/* Department heads may submit; admins and managers can edit or delete needs. */}
      {canCreateRequest && (
        <BesoinFormationModal
          open={modalOpen}
          onClose={handleModalClose}
          onSave={handleSave}
          showSnackbar={showSnackbar}
          initialData={editingBesoin}
          duplicate={duplicatingBesoin}
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

      <Dialog open={!!reviewTarget} onClose={() => setReviewTarget(null)} fullWidth maxWidth="sm">
        <DialogTitle>Valider la nouvelle formation</DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ mb: 2 }}>
            Vous pouvez ajuster le nom proposé. Après validation, le besoin sera approuvé et marqué comme formation à ajouter au catalogue.
          </DialogContentText>
          <TextField autoFocus fullWidth required label="Nom de la formation" value={reviewFormationName}
            onChange={event => setReviewFormationName(event.target.value)} />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReviewTarget(null)}>Annuler</Button>
          <Button variant="contained" color="success" disabled={!reviewFormationName.trim()}
            onClick={() => handleDecision(reviewTarget, "APPROVED", null, reviewFormationName.trim())}>
            Valider le besoin
          </Button>
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

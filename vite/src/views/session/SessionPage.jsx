// frontend-template/vite/src/views/session/SessionPage.jsx
import { useEffect, useState, useCallback, useRef } from "react";
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Button, IconButton, MenuItem,
  Snackbar, Alert, Dialog, DialogTitle,
  DialogContent, DialogActions,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import EditIcon   from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import QuizIcon from '@mui/icons-material/Quiz';
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import {
  getSessionsPaginated, getSessionYears, deleteSession,
  addParticipantsToSession, removeParticipantsFromSession,
} from "../../api/sessionApi";
import { getAllEntreprises } from "../../api/entrepriseApi";
import { useAuth }              from "../../contexts/auth/AuthContext";
import SessionModal             from "./SessionModal";
import ParticipantsModal        from "./ParticipantsModal";
import SessionParticipantsPanel from "./SessionParticipantsPanel";
import YearFilter               from "../dashboard/Default/YearFilter";
import { useIsVisitor }         from "../../hooks/useIsVisitor";
import QRCodeDialog from './QRCodeDialog';
import QuizDialog from './QuizDialog';
import QrCode2Icon from '@mui/icons-material/QrCode2';


const exportButtonSx = {
  backgroundColor: "#4CAF50",
  "&:hover": { backgroundColor: "#43A047" },
};

// Status indicator palette — small colored dot + uppercase label, in the style
// of modern SaaS dashboards (Linear/Vercel/GitHub-style status pills) rather
// than a plain solid-colored chip. "En cours" gets a subtle pulse on its dot
// to read as "happening right now" at a glance.
const STATUS_STYLES = {
  PLANIFIEE: { label: "Planifiée", bg: "#EFF6FF", color: "#1D4ED8", dot: "#3B82F6", border: "#BFDBFE" },
  EN_COURS:  { label: "En cours",  bg: "#ECFDF5", color: "#047857", dot: "#10B981", border: "#A7F3D0", pulse: true },
  TERMINEE:  { label: "Terminée", bg: "#F3F4F6", color: "#4B5563", dot: "#9CA3AF", border: "#E5E7EB" },
  ANNULEE:   { label: "Annulée",  bg: "#FEF2F2", color: "#B91C1C", dot: "#EF4444", border: "#FECACA" },
};

const StatusChip = ({ status }) => {
  const style = STATUS_STYLES[status] || {
    label: status, bg: "#F3F4F6", color: "#4B5563", dot: "#9CA3AF", border: "#E5E7EB",
  };
  return (
    <Box
      component="span"
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "3px 10px",
        borderRadius: "6px",
        backgroundColor: style.bg,
        color: style.color,
        border: `1px solid ${style.border}`,
        fontWeight: 600,
        fontSize: "0.72rem",
        letterSpacing: "0.3px",
        textTransform: "uppercase",
        lineHeight: 1.6,
        whiteSpace: "nowrap",
      }}
    >
      <Box
        component="span"
        sx={{
          width: 6,
          height: 6,
          borderRadius: "50%",
          backgroundColor: style.dot,
          flexShrink: 0,
          ...(style.pulse && {
            animation: "statusDotPulse 1.8s ease-out infinite",
            "@keyframes statusDotPulse": {
              "0%":   { boxShadow: `0 0 0 0 ${style.dot}66` },
              "70%":  { boxShadow: `0 0 0 5px ${style.dot}00` },
              "100%": { boxShadow: `0 0 0 0 ${style.dot}00` },
            },
          }),
        }}
      />
      {style.label}
    </Box>
  );
};

const SessionPage = () => {
  const isVisitor = useIsVisitor();
  const { user }  = useAuth();
  const isAdmin   = user?.role === "ADMIN";

  const [sessions,      setSessions]      = useState([]);
  const [loading,       setLoading]       = useState(true);
  const [search,        setSearch]        = useState("");
  const [selectedYears, setSelectedYears] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);

  const [sortModel, setSortModel] = useState([]); // e.g. [{ field: "dateDebut", sort: "desc" }]
  const [paginationModel, setPaginationModel] = useState({ pageSize: 20, page: 0 });
  const [totalSessions, setTotalSessions] = useState(0);

  // Admin-only: entreprise filter dropdown
  const [entreprises,        setEntreprises]        = useState([]);
  const [filterEntrepriseId, setFilterEntrepriseId] = useState(""); // '' = all

  const [openSessionModal,  setOpenSessionModal]  = useState(false);
  const [editingSession,    setEditingSession]    = useState(null);

  const [openDeleteDialog,  setOpenDeleteDialog]  = useState(false);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [openParticipantsModal, setOpenParticipantsModal] = useState(false);
  const [openParticipantsPanel, setOpenParticipantsPanel] = useState(false);
  const [editingParticipantsSession, setEditingParticipantsSession] = useState(null);

  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });
  const showSnackbar        = (message, severity = "success") => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const [qrSession, setQrSession] = useState(null);
  const [quizSession, setQuizSession] = useState(null);

  const isMountedRef         = useRef(false);
  const pendingPaginationRef = useRef(null);
  const pendingSortRef       = useRef(null);

  // ── Load entreprises for admin dropdown ──────────────────────────────────
  useEffect(() => {
    if (!isAdmin) return;
    getAllEntreprises()
      .then(setEntreprises)
      .catch(() => showSnackbar("Erreur chargement entreprises", "error"));
  }, [isAdmin]);

  // ── Load available years (server-side, scoped like sessions) ────────────
  useEffect(() => {
    getSessionYears(isAdmin ? (filterEntrepriseId || null) : undefined)
      .then(setAvailableYears)
      .catch(() => {}); // non-critical — filter just won't show options if it fails
  }, [isAdmin, filterEntrepriseId]);

  // ── Fetch sessions (server-side pagination/sort/search/filter) ──────────
  const fetchSessions = useCallback(async (showSpinner = true) => {
    try {
      if (showSpinner) setLoading(true);
      const sortBy  = sortModel[0]?.field || "idSession";
      const sortDir = sortModel[0]?.sort === "asc" ? "asc" : "desc";
      const data = await getSessionsPaginated({
        page:         paginationModel.page,
        size:         paginationModel.pageSize,
        search:       search.trim(),
        sortBy,
        sortDir,
        years:        selectedYears,
        // Only pass entrepriseId for ADMIN (scoping for others is done server-side via JWT)
        entrepriseId: isAdmin ? (filterEntrepriseId || null) : undefined,
      });
      setSessions(data.content || []);
      setTotalSessions(data.totalElements || 0);
    } catch {
      showSnackbar("Erreur lors du chargement des sessions.", "error");
    } finally {
      if (showSpinner) setLoading(false);
    }
  }, [paginationModel, sortModel, search, selectedYears, isAdmin, filterEntrepriseId]);

  useEffect(() => { fetchSessions(true); }, [fetchSessions]);

  useEffect(() => {
    isMountedRef.current = true;
    if (pendingPaginationRef.current) { setPaginationModel(pendingPaginationRef.current); pendingPaginationRef.current = null; }
    if (pendingSortRef.current)       { setSortModel(pendingSortRef.current);              pendingSortRef.current = null;       }
    return () => { isMountedRef.current = false; };
  }, []);

  useEffect(() => {
    if (openSessionModal) return;
    const interval = setInterval(() => fetchSessions(false), 10000);
    return () => clearInterval(interval);
  }, [openSessionModal, fetchSessions]);

  // ── Edit ──────────────────────────────────────────────────────────────────
  const handleEdit = (row) => {
    setEditingSession({
      ...row,
      idFormation:   row.idFormation   ?? row.formationId,
      idEntreprise:  row.idEntreprise,
      idFournisseur: row.idFournisseur,
      idFormateur:   row.idFormateur,
      statut:        row.statut,
      lieu:          row.lieu || "",
    });
    setOpenSessionModal(true);
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async () => {
    try {
      await deleteSession(selectedSessionId);
      await fetchSessions(false);
      showSnackbar("Session supprimée avec succès !");
    } catch {
      showSnackbar("Impossible de supprimer cette session.", "error");
    } finally {
      setOpenDeleteDialog(false);
    }
  };

  // ── Export (pulls the FULL filtered dataset, not just the current page) ──
  const handleExportExcel = async () => {
    try {
      setLoading(true);
      const sortBy  = sortModel[0]?.field || "idSession";
      const sortDir = sortModel[0]?.sort === "asc" ? "asc" : "desc";
      const allData = await getSessionsPaginated({
        page: 0, size: 10000,
        search: search.trim(),
        sortBy, sortDir,
        years: selectedYears,
        entrepriseId: isAdmin ? (filterEntrepriseId || null) : undefined,
      });
      const rows = allData.content || [];
      if (!rows.length) { showSnackbar("Aucune session à exporter.", "warning"); return; }

      const sessionsData = rows.map(s => ({
        "ID Session":          s.idSession,
        "Réf. session":        s.referenceSession,
        "Formation":           s.formation,
        "Entreprise":          s.entrepriseNom,
        "Fournisseur":         s.fournisseurNom,
        "Formateur":           s.formateurNomComplet,
        "Date début":          s.dateDebut,
        "Date fin":            s.dateFin,
        "Durée (h)":           s.dHeures,
        "Durée (j)":           s.dJours,
        "Lieu":                s.lieu || "",
        "Statut":              s.statut,
        "Nombre participants": s.participants?.length || 0,
      }));

      const participantsData = [];
      rows.forEach(s => {
        (s.participants || []).forEach(p => {
          participantsData.push({
            "ID Session":   s.idSession,
            "Réf. session": s.referenceSession,
            "Formation":    s.formation,
            "Lieu":         s.lieu || "",
            "Nom":          p.nom,
            "Prénom":       p.prenom,
            "CIN":          p.cin,
            "Matricule":    p.matricule,
            "Entreprise":   s.entrepriseNom,
          });
        });
      });

      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(sessionsData),     "Sessions");
      XLSX.utils.book_append_sheet(wb, XLSX.utils.json_to_sheet(participantsData), "Participants");
      const today = new Date().toISOString().split("T")[0];
      saveAs(
        new Blob([XLSX.write(wb, { bookType: "xlsx", type: "array" })],
          { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" }),
        `Export_Sessions_IFMIA_${today}.xlsx`
      );
    } catch {
      showSnackbar("Erreur lors de l'export", "error");
    } finally {
      setLoading(false);
    }
  };

  // ── Pagination + sort handlers (debounced against StrictMode double-mount) ──
  const handlePaginationModelChange = useCallback((newModel) => {
    if (!isMountedRef.current) { pendingPaginationRef.current = newModel; return; }
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setPaginationModel(prev =>
        prev.page === newModel.page && prev.pageSize === newModel.pageSize ? prev : newModel
      );
    }, 0);
  }, []);

  const handleSortModelChange = useCallback((newModel) => {
    if (!isMountedRef.current) { pendingSortRef.current = newModel; return; }
    setTimeout(() => {
      if (!isMountedRef.current) return;
      setSortModel(prev => {
        const n = newModel?.[0] || {}; const c = prev?.[0] || {};
        return n.field === c.field && n.sort === c.sort ? prev : newModel;
      });
    }, 0);
  }, []);

  // Reset to page 0 whenever a filter changes, so we don't land on an empty page
  const resetToFirstPage = () => setPaginationModel(prev => ({ ...prev, page: 0 }));

  // ── Columns ───────────────────────────────────────────────────────────────
  const baseColumns = [
    { field: "referenceSession",    headerName: "Réf. session",  minWidth: 130, maxWidth: 200 },
    { field: "formation",           headerName: "Formation",    flex: 2, minWidth: 100 },
    { field: "entrepriseNom",       headerName: "Entreprise",   flex: 1, minWidth: 100, maxWidth: 200, sortable: false },
    { field: "fournisseurNom",      headerName: "Fournisseur",  flex: 1, minWidth: 100, maxWidth: 200, sortable: false },
    { field: "formateurNomComplet", headerName: "Formateur",    flex: 1, minWidth: 140, maxWidth: 200 },
    { field: "dateDebut",           headerName: "Début",        width: 120 },
    { field: "dateFin",             headerName: "Fin",          width: 120 },
    { field: "dHeures",             headerName: "Durée (h)",    width: 110 },
    { field: "dJours",              headerName: "Durée (j)",    width: 100 },
    { field: "lieu",                headerName: "Lieu",         minWidth: 140 },
    {
      field: "statut",
      headerName: "Statut",
      width: 145,
      renderCell: (params) => <StatusChip status={params.value} />,
    },
    {
      field: "participantsCount",
      headerName: "Participants",
      width: 130,
      sortable: false,
      renderCell: (params) => (
        <Button variant="outlined" size="small" onClick={() => {
          setEditingParticipantsSession(params.row);
          setOpenParticipantsPanel(true);
        }}>
          {params.row.participants?.length || 0}
        </Button>
      ),
    },
  ];

  const actionsColumn = {
    field: "actions",
    headerName: "Actions",
    width: 200,
    sortable: false,
    renderCell: (params) => (
      <Box display="flex" alignItems="center">
        <IconButton color="primary" size="small" onClick={() => handleEdit(params.row)}>
          <EditIcon />
        </IconButton>

        <IconButton color="error" size="small" onClick={() => {
          setSelectedSessionId(params.row.idSession);
          setOpenDeleteDialog(true);
        }}>
          <DeleteIcon />
        </IconButton>

        <IconButton
          color="secondary"
          size="small"
          title="QR Code évaluation à chaud"
          onClick={() => setQrSession(params.row)}
        >
          <QrCode2Icon />
        </IconButton>

        {params.row.idEntreprise === 42 && (
          <IconButton
            color="secondary"
            size="small"
            title="QR Code Quiz Sécurité"
            onClick={(e) => { e.stopPropagation(); setQuizSession(params.row); }}
          >
            <QuizIcon />
          </IconButton>
        )}
      </Box>
    ),
  };

  const columns = isVisitor ? baseColumns : [...baseColumns, actionsColumn];

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <Box p={3}>
      <Typography variant="h4" fontWeight="bold" mb={2}>Sessions de Formation</Typography>

      <Card>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid size={{ xs: 12, md: isAdmin ? 2.5 : 3 }}>
              <TextField
                fullWidth
                label="Rechercher par formation ou référence"
                value={search}
                onChange={e => { setSearch(e.target.value); resetToFirstPage(); }}
              />
            </Grid>

            {/* Entreprise dropdown — ADMIN only */}
            {isAdmin && (
              <Grid size={{ xs: 12, md: 2.5 }}>
                <TextField
                  select fullWidth
                  label="Filtrer par entreprise"
                  value={filterEntrepriseId}
                  onChange={e => { setFilterEntrepriseId(e.target.value); resetToFirstPage(); }}
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

            <Grid size={{ xs: 12, md: "auto" }} sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
              {!isVisitor && (
                <Button variant="contained" onClick={() => { setEditingSession(null); setOpenSessionModal(true); }}>
                  Créer session
                </Button>
              )}
              <Button variant="contained" sx={exportButtonSx} onClick={handleExportExcel}>
                Export Excel
              </Button>
            </Grid>

            <Grid size={{ xs: 12, md: "grow" }}
              sx={{ display: "flex", justifyContent: { xs: "flex-start", md: "flex-end" } }}>
              <YearFilter
                availableYears={availableYears}
                selectedYears={selectedYears}
                onChange={(years) => { setSelectedYears(years); resetToFirstPage(); }}
                loading={loading}
              />
            </Grid>
          </Grid>

          <Box sx={{ height: "70vh" }}>
            <DataGrid
              rows={sessions}
              columns={columns}
              getRowId={row => row.idSession}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
              paginationModel={paginationModel}
              onPaginationModelChange={handlePaginationModelChange}
              sortModel={sortModel}
              onSortModelChange={handleSortModelChange}
              rowCount={totalSessions}
              paginationMode="server"
              sortingMode="server"
              initialState={{
                columns: {
                  columnVisibilityModel: { },
                },
              }}
            />
          </Box>
        </CardContent>
      </Card>

      {/* Delete dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Confirmation de suppression</DialogTitle>
        <DialogContent>Êtes-vous sûr de vouloir supprimer cette session ?</DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Annuler</Button>
          <Button color="error" variant="contained" onClick={handleDelete}>Supprimer</Button>
        </DialogActions>
      </Dialog>

      {/* Session modal */}
      {!isVisitor && (
        <SessionModal
          open={openSessionModal}
          onClose={() => setOpenSessionModal(false)}
          onSessionCreated={() => fetchSessions(false)}
          onCompleted={() => { setOpenSessionModal(false); setEditingSession(null); }}
          initialData={editingSession}
          showSnackbar={showSnackbar}
        />
      )}

      {/* Participants modal */}
      {!isVisitor && editingParticipantsSession && (
        <ParticipantsModal
          open={openParticipantsModal}
          onClose={() => setOpenParticipantsModal(false)}
          preSelectedParticipants={editingParticipantsSession.participants || []}
          onSelectParticipants={async (selected) => {
            try {
              const oldIds = (editingParticipantsSession.participants || []).map(p => Number(p.idEmploye));
              const newIds = selected.map(p => Number(p.idEmploye));
              const toAdd    = newIds.filter(id => !oldIds.includes(id));
              const toRemove = oldIds.filter(id => !newIds.includes(id));
              if (toAdd.length    > 0) await addParticipantsToSession(editingParticipantsSession.idSession, toAdd);
              if (toRemove.length > 0) await removeParticipantsFromSession(editingParticipantsSession.idSession, toRemove);
              showSnackbar(`${selected.length} participants mis à jour avec succès !`);
              fetchSessions(false);
            } catch {
              showSnackbar("Erreur lors de la mise à jour des participants.", "error");
            } finally {
              setOpenParticipantsModal(false);
            }
          }}
        />
      )}

      {/* Participants panel */}
      <Dialog open={openParticipantsPanel} onClose={() => setOpenParticipantsPanel(false)} maxWidth="lg" fullWidth>
        <DialogContent>
          {editingParticipantsSession && (
            <SessionParticipantsPanel
              session={editingParticipantsSession}
              onClose={() => setOpenParticipantsPanel(false)}
              onUpdated={() => fetchSessions(false)}
              showSnackbar={showSnackbar}
              readOnly={isVisitor}
            />
          )}
        </DialogContent>
      </Dialog>

      <QRCodeDialog
        open={!!qrSession}
        onClose={() => setQrSession(null)}
        session={qrSession}
      />
      <QuizDialog
        open={!!quizSession}
        onClose={() => setQuizSession(null)}
        session={quizSession}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
};

export default SessionPage;
// frontend-template/vite/src/views/session/PresencePanel.jsx
import { useEffect, useState, useCallback } from "react";
import {
  Box, Typography, Button, Stack, Chip,
  CircularProgress, Tooltip,
  Table, TableHead, TableBody, TableRow, TableCell,
  Alert, Skeleton,
} from "@mui/material";
import CheckCircleIcon  from "@mui/icons-material/CheckCircle";
import CancelIcon       from "@mui/icons-material/Cancel";
import SaveIcon         from "@mui/icons-material/Save";
import HelpOutlineIcon  from "@mui/icons-material/HelpOutline";
import { getSessionDays, getRecordedDays, getPresenceForDay, savePresence } from "../../api/presenceApi";

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleDateString("fr-FR", { weekday: "short", day: "2-digit", month: "short" });
}

function statusIcon(present) {
  if (present === true)  return <CheckCircleIcon fontSize="small" color="success" />;
  if (present === false) return <CancelIcon fontSize="small" color="error" />;
  return <HelpOutlineIcon fontSize="small" color="disabled" />;
}

// ─── Skeleton for the day chips bar ──────────────────────────────────────────

function DayChipsSkeleton() {
  return (
    <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Skeleton key={i} variant="rounded" width={80} height={28} />
      ))}
    </Box>
  );
}

// ─── Skeleton for the presence table ─────────────────────────────────────────

function PresenceTableSkeleton({ rows = 6 }) {
  return (
    <Table size="small">
      <TableHead>
        <TableRow sx={{ bgcolor: "action.hover" }}>
          {["Nom", "Prénom", "CIN", "Matricule", "Présence"].map(h => (
            <TableCell key={h} sx={{ fontWeight: 700 }}>{h}</TableCell>
          ))}
        </TableRow>
      </TableHead>
      <TableBody>
        {Array.from({ length: rows }).map((_, i) => (
          <TableRow key={i}>
            <TableCell><Skeleton variant="text" width={80} /></TableCell>
            <TableCell><Skeleton variant="text" width={80} /></TableCell>
            <TableCell><Skeleton variant="text" width={90} /></TableCell>
            <TableCell><Skeleton variant="text" width={70} /></TableCell>
            <TableCell align="center">
              <Skeleton variant="rounded" width={90} height={28} sx={{ mx: "auto" }} />
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function PresencePanel({ session, readOnly = false, showSnackbar }) {
  const [sessionDays,  setSessionDays]  = useState([]);
  const [recordedDays, setRecordedDays] = useState([]);
  const [selectedDay,  setSelectedDay]  = useState(null);
  const [presenceData, setPresenceData] = useState(null);
  const [loadingDays,  setLoadingDays]  = useState(true);
  const [loadingGrid,  setLoadingGrid]  = useState(false);
  const [saving,       setSaving]       = useState(false);
  const [edits,        setEdits]        = useState({});

  // ── Load days on mount ────────────────────────────────────────────────────
  useEffect(() => {
    if (!session?.idSession) return;
    setLoadingDays(true);
    Promise.all([
      getSessionDays(session.idSession),
      getRecordedDays(session.idSession),
    ])
      .then(([days, recorded]) => {
        setSessionDays(days);
        setRecordedDays(recorded.jours || []);
        const today  = new Date().toISOString().split("T")[0];
        const autoDay = days.includes(today) ? today : (days[0] || null);
        setSelectedDay(autoDay);
      })
      .catch(() => showSnackbar?.("Erreur chargement des jours.", "error"))
      .finally(() => setLoadingDays(false));
  }, [session?.idSession]);

  // ── Load presence grid when day changes ───────────────────────────────────
  const loadGrid = useCallback(async (day) => {
    if (!day) return;
    setLoadingGrid(true);
    setEdits({});
    try {
      const data = await getPresenceForDay(session.idSession, day);
      setPresenceData(data);
      const initial = {};
      (data.participants || []).forEach(p => { initial[p.participationId] = p.present; });
      setEdits(initial);
    } catch {
      showSnackbar?.("Erreur chargement de la présence.", "error");
    } finally {
      setLoadingGrid(false);
    }
  }, [session?.idSession]);

  useEffect(() => {
    if (selectedDay) loadGrid(selectedDay);
  }, [selectedDay, loadGrid]);

  // ── Toggle / mark all / save ──────────────────────────────────────────────
  const toggle = (participationId, current) => {
    if (readOnly) return;
    setEdits(prev => ({ ...prev, [participationId]: current === true ? false : true }));
  };

  const markAll = (value) => {
    if (readOnly || !presenceData) return;
    const next = {};
    presenceData.participants.forEach(p => { next[p.participationId] = value; });
    setEdits(next);
  };

  const handleSave = async () => {
    if (!selectedDay || !presenceData) return;
    setSaving(true);
    try {
      const presences = presenceData.participants.map(p => ({
        participationId: p.participationId,
        present: edits[p.participationId] ?? false,
      }));
      await savePresence(session.idSession, { jour: selectedDay, presences });
      setRecordedDays(prev => prev.includes(selectedDay) ? prev : [...prev, selectedDay]);
      showSnackbar?.("Présence enregistrée avec succès !", "success");
    } catch {
      showSnackbar?.("Erreur lors de l'enregistrement.", "error");
    } finally {
      setSaving(false);
    }
  };

  // ── Derived stats ─────────────────────────────────────────────────────────
  const total    = presenceData?.participants?.length ?? 0;
  const presents = presenceData?.participants?.filter(p => edits[p.participationId] === true).length  ?? 0;
  const absents  = presenceData?.participants?.filter(p => edits[p.participationId] === false).length ?? 0;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    // minHeight prevents the layout jump while data loads
    <Box sx={{ minHeight: 420 }}>

      {/* No dates configured */}
      {!loadingDays && sessionDays.length === 0 && (
        <Alert severity="info" sx={{ mt: 2 }}>
          Cette session n'a pas de dates définies. Ajoutez une date de début et de fin pour gérer la présence.
        </Alert>
      )}

      {/* Day chips — skeleton while loading */}
      {loadingDays ? (
        <DayChipsSkeleton />
      ) : (
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1, mb: 3 }}>
          {sessionDays.map(day => {
            const isRecorded = recordedDays.includes(day);
            const isSelected = day === selectedDay;
            return (
              <Chip
                key={day}
                label={formatDate(day)}
                onClick={() => setSelectedDay(day)}
                color={isSelected ? "primary" : isRecorded ? "success" : "default"}
                variant={isSelected ? "filled" : "outlined"}
                size="small"
                icon={isRecorded && !isSelected ? <CheckCircleIcon /> : undefined}
                sx={{ cursor: "pointer", fontWeight: isSelected ? 700 : 400 }}
              />
            );
          })}
        </Box>
      )}

      {/* Grid section */}
      {selectedDay && (
        <>
          {/* Stats + action bar — always rendered to avoid height jump */}
          <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" mb={2} gap={1}>
            {loadingGrid ? (
              <Skeleton variant="text" width={200} />
            ) : (
              <Typography variant="body2" color="text.secondary">
                {formatDate(selectedDay)} — {presents}/{total} présent{presents !== 1 ? "s" : ""}
                {absents > 0 && `, ${absents} absent${absents !== 1 ? "s" : ""}`}
              </Typography>
            )}

            {!readOnly && (
              <>
                <Button size="small" variant="outlined" color="success"
                  disabled={loadingGrid}
                  onClick={() => markAll(true)}>
                  Tous présents
                </Button>
                <Button size="small" variant="outlined" color="error"
                  disabled={loadingGrid}
                  onClick={() => markAll(false)}>
                  Tous absents
                </Button>
                <Button
                  size="small" variant="contained"
                  startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <SaveIcon />}
                  onClick={handleSave}
                  disabled={saving || loadingGrid}
                >
                  Enregistrer
                </Button>
              </>
            )}
          </Stack>

          {/* Presence table — skeleton while loading grid */}
          {loadingGrid ? (
            <PresenceTableSkeleton rows={Math.max(total || 0, 4)} />
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow sx={{ bgcolor: "action.hover" }}>
                  <TableCell sx={{ fontWeight: 700 }}>Nom</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Prénom</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>CIN</TableCell>
                  <TableCell sx={{ fontWeight: 700 }}>Matricule</TableCell>
                  <TableCell align="center" sx={{ fontWeight: 700 }}>Présence</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(presenceData?.participants || []).map(p => {
                  const val = edits[p.participationId];
                  return (
                    <TableRow
                      key={p.participationId}
                      sx={{ "&:hover": { bgcolor: "action.hover" } }}
                    >
                      <TableCell>{p.nom}</TableCell>
                      <TableCell>{p.prenom}</TableCell>
                      <TableCell>{p.cin || "—"}</TableCell>
                      <TableCell>{p.matricule || "—"}</TableCell>
                      <TableCell align="center">
                        <Tooltip title={
                          readOnly
                            ? (val === true ? "Présent" : val === false ? "Absent" : "Non renseigné")
                            : "Cliquer pour basculer"
                        }>
                          <Box
                            onClick={() => toggle(p.participationId, val)}
                            sx={{
                              display: "inline-flex",
                              alignItems: "center",
                              gap: 0.5,
                              cursor: readOnly ? "default" : "pointer",
                              userSelect: "none",
                              px: 1.5, py: 0.5,
                              borderRadius: 2,
                              border: "1px solid",
                              borderColor: val === true
                                ? "success.main"
                                : val === false
                                  ? "error.main"
                                  : "divider",
                              bgcolor: val === true
                                ? "success.light"
                                : val === false
                                  ? "error.light"
                                  : "action.hover",
                              color: val === true
                                ? "success.dark"
                                : val === false
                                  ? "error.dark"
                                  : "text.secondary",
                              transition: "all 0.15s",
                              "&:hover": readOnly ? {} : { opacity: 0.8 },
                            }}
                          >
                            {statusIcon(val)}
                            <Typography variant="caption" fontWeight={600}>
                              {val === true ? "Présent" : val === false ? "Absent" : "—"}
                            </Typography>
                          </Box>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </>
      )}
    </Box>
  );
}
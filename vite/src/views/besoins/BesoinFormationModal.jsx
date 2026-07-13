// frontend-template/vite/src/views/besoins/BesoinFormationModal.jsx
import { useEffect, useRef, useState } from "react";
import * as XLSX from "xlsx";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Grid, TextField, MenuItem,
  List, ListItemButton, ListItemIcon, ListItemText, Checkbox,
  Divider, Typography, Box, CircularProgress,
} from "@mui/material";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { createBesoin, updateBesoin } from "../../api/besoinFormationApi";
import { getAllEntreprises } from "../../api/entrepriseApi";

const emptyForm = {
  idEntreprise: "",
  dept: "",
  intitule: "",
  populationCible: "",
  nbCadre: "",
  nbTam: "",
  nbPro: "",
  priorite: "",
  periode: "",
  objectifs: "",
  competencesCiblees: "",
  indicateursSucces: "",
  evaluation: "",
  budgetEstimatif: "",
  remarques: "",
};

// Normalizes a header string so "Priorités ", "priorites", "PRIORITÉS" all match the same key
const normalizeHeader = (s) =>
  s
    .toString()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/\s+/g, " ")
    .trim();

// Maps normalized Excel column headers -> formData / payload field names
const HEADER_MAP = {
  "dept": "dept",
  "besoin en formation": "intitule",
  "population cible": "populationCible",
  "cadre": "nbCadre",
  "tam": "nbTam",
  "pro": "nbPro",
  "priorites": "priorite",
  "priorite": "priorite",
  "periode": "periode",
  "objectifs des formations": "objectifs",
  "competences ciblees": "competencesCiblees",
  "indicateurs de succes/performance": "indicateursSucces",
  "indicateurs de succes": "indicateursSucces",
  "evaluation": "evaluation",
  "budget estimatif": "budgetEstimatif",
  "remarques": "remarques",
  "entreprise": "__entreprise", // handled separately, not a direct field
};

const NUMERIC_FIELDS = new Set(["nbCadre", "nbTam", "nbPro", "priorite", "budgetEstimatif"]);

const BesoinFormationModal = ({ open, onClose, onSave, showSnackbar, initialData = null }) => {
  const isEdit = Boolean(initialData);

  const [formData, setFormData] = useState(emptyForm);
  const [entreprises, setEntreprises] = useState([]);
  const [saving, setSaving] = useState(false);

  const fileInputRef = useRef(null);
  const [importRows, setImportRows] = useState([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedRows, setSelectedRows] = useState(new Set());
  const [importing, setImporting] = useState(false);

  useEffect(() => {
    getAllEntreprises().then(setEntreprises).catch(() => {});
  }, []);

  useEffect(() => {
    if (!open) return;

    if (isEdit && initialData) {
      setFormData({
        idEntreprise: initialData.entrepriseId ?? "",
        dept: initialData.dept || "",
        intitule: initialData.intitule || "",
        populationCible: initialData.populationCible || "",
        nbCadre: initialData.nbCadre ?? "",
        nbTam: initialData.nbTam ?? "",
        nbPro: initialData.nbPro ?? "",
        priorite: initialData.priorite ?? "",
        periode: initialData.periode || "",
        objectifs: initialData.objectifs || "",
        competencesCiblees: initialData.competencesCiblees || "",
        indicateursSucces: initialData.indicateursSucces || "",
        evaluation: initialData.evaluation || "",
        budgetEstimatif: initialData.budgetEstimatif ?? "",
        remarques: initialData.remarques || "",
      });
    } else {
      setFormData(emptyForm);
    }
    setImportRows([]);
    setPickerOpen(false);
    setSelectedRows(new Set());
  }, [open, isEdit, initialData]);

  const handleChange = (field) => (e) =>
    setFormData((prev) => ({ ...prev, [field]: e.target.value }));

  // ── Shared row parsing ────────────────────────────────────────────────────
  const parseRow = (row) => {
    const mapped = {};
    let entrepriseNameFromSheet = null;

    Object.entries(row).forEach(([key, value]) => {
      const field = HEADER_MAP[normalizeHeader(key)];
      if (!field || value === "" || value == null) return;

      if (field === "__entreprise") {
        entrepriseNameFromSheet = value.toString();
        return;
      }

      mapped[field] = NUMERIC_FIELDS.has(field)
        ? (isNaN(Number(value)) ? null : Number(value))
        : value.toString();
    });

    return { mapped, entrepriseNameFromSheet };
  };

  const resolveEntrepriseId = (entrepriseNameFromSheet) => {
    if (entrepriseNameFromSheet) {
      const norm = normalizeHeader(entrepriseNameFromSheet);
      const match = entreprises.find((en) => normalizeHeader(en.nomEntreprise) === norm);
      if (match) return match.idEntreprise;
    }
    return formData.idEntreprise ? Number(formData.idEntreprise) : null;
  };

  // ── Single-row import → prefill the form for review ─────────────────────
  const applyRowToForm = (row) => {
    const { mapped, entrepriseNameFromSheet } = parseRow(row);
    const matchedEntrepriseId = resolveEntrepriseId(entrepriseNameFromSheet);

    setFormData((prev) => ({
      ...prev,
      ...mapped,
      ...(matchedEntrepriseId ? { idEntreprise: matchedEntrepriseId } : {}),
    }));

    setPickerOpen(false);
    setImportRows([]);

    showSnackbar(
      matchedEntrepriseId
        ? "Ligne importée. Vérifiez les champs avant d'enregistrer."
        : "Ligne importée. Pensez à sélectionner l'entreprise avant d'enregistrer.",
    );
  };

  // ── Multi-row import → create directly via the API ──────────────────────
  const buildPayloadFromRow = (row) => {
    const { mapped, entrepriseNameFromSheet } = parseRow(row);
    return {
      idEntreprise: resolveEntrepriseId(entrepriseNameFromSheet),
      dept: mapped.dept || null,
      intitule: mapped.intitule || "",
      populationCible: mapped.populationCible || null,
      nbCadre: mapped.nbCadre ?? null,
      nbTam: mapped.nbTam ?? null,
      nbPro: mapped.nbPro ?? null,
      priorite: mapped.priorite ?? null,
      periode: mapped.periode || null,
      objectifs: mapped.objectifs || null,
      competencesCiblees: mapped.competencesCiblees || null,
      indicateursSucces: mapped.indicateursSucces || null,
      evaluation: mapped.evaluation || null,
      budgetEstimatif: mapped.budgetEstimatif ?? null,
      remarques: mapped.remarques || null,
    };
  };

  const handleBulkImport = async (rowsToImport) => {
    if (!rowsToImport.length) {
      showSnackbar("Sélectionnez au moins une ligne à importer.", "error");
      return;
    }

    const payloads = rowsToImport
      .map(buildPayloadFromRow)
      .filter((p) => p.intitule && p.intitule.trim());

    const skipped = rowsToImport.length - payloads.length;

    if (!payloads.length) {
      showSnackbar("Aucune ligne valide à importer (intitulé manquant).", "error");
      return;
    }

    if (payloads.some((p) => !p.idEntreprise)) {
      showSnackbar(
        "Sélectionnez une entreprise dans le formulaire avant d'importer (aucune colonne \"Entreprise\" trouvée dans le fichier).",
        "error",
      );
      return;
    }

    setImporting(true);
    try {
      const results = await Promise.allSettled(payloads.map((p) => createBesoin(p)));
      const succeeded = results.filter((r) => r.status === "fulfilled").map((r) => r.value);
      const failedCount = results.length - succeeded.length;

      if (succeeded.length) {
        onSave(succeeded);
      }

      if (failedCount > 0) {
        showSnackbar(
          `${succeeded.length} besoin(s) importé(s), ${failedCount} échec(s).`,
          "warning",
        );
      } else {
        showSnackbar(
          `${succeeded.length} besoin(s) importé(s) avec succès !${skipped ? ` (${skipped} ligne(s) ignorée(s) sans intitulé)` : ""}`,
        );
      }

      setPickerOpen(false);
      setImportRows([]);
      setSelectedRows(new Set());
      if (succeeded.length) onClose();
    } catch (err) {
      showSnackbar("Erreur lors de l'import groupé.", "error");
    } finally {
      setImporting(false);
    }
  };

  const toggleRowSelected = (idx) => {
    setSelectedRows((prev) => {
      const next = new Set(prev);
      if (next.has(idx)) next.delete(idx);
      else next.add(idx);
      return next;
    });
  };

  const toggleSelectAll = () => {
    setSelectedRows((prev) =>
      prev.size === importRows.length ? new Set() : new Set(importRows.map((_, i) => i)),
    );
  };

  // ── File handling ─────────────────────────────────────────────────────────
  const handleImportClick = () => fileInputRef.current?.click();

  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const wb = XLSX.read(evt.target.result, { type: "array" });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });

        if (!rows.length) {
          showSnackbar("Le fichier Excel ne contient aucune ligne exploitable.", "error");
          return;
        }

        if (rows.length === 1) {
          applyRowToForm(rows[0]);
        } else {
          setImportRows(rows);
          setSelectedRows(new Set());
          setPickerOpen(true);
        }
      } catch (err) {
        showSnackbar("Impossible de lire ce fichier Excel.", "error");
      } finally {
        e.target.value = ""; // allow re-selecting the same file
      }
    };
    reader.readAsArrayBuffer(file);
  };

  // ── Save (single form entry) ─────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.idEntreprise) {
      showSnackbar("Veuillez sélectionner une entreprise.", "error");
      return;
    }
    if (!formData.intitule.trim()) {
      showSnackbar("Veuillez renseigner l'intitulé du besoin.", "error");
      return;
    }

    const payload = {
      idEntreprise: Number(formData.idEntreprise),
      dept: formData.dept || null,
      intitule: formData.intitule,
      populationCible: formData.populationCible || null,
      nbCadre: formData.nbCadre === "" ? null : Number(formData.nbCadre),
      nbTam: formData.nbTam === "" ? null : Number(formData.nbTam),
      nbPro: formData.nbPro === "" ? null : Number(formData.nbPro),
      priorite: formData.priorite === "" ? null : Number(formData.priorite),
      periode: formData.periode || null,
      objectifs: formData.objectifs || null,
      competencesCiblees: formData.competencesCiblees || null,
      indicateursSucces: formData.indicateursSucces || null,
      evaluation: formData.evaluation || null,
      budgetEstimatif: formData.budgetEstimatif === "" ? null : Number(formData.budgetEstimatif),
      remarques: formData.remarques || null,
    };

    try {
      setSaving(true);
      const saved = isEdit
        ? await updateBesoin(initialData.id, payload)
        : await createBesoin(payload);

      showSnackbar(isEdit ? "Besoin mis à jour avec succès !" : "Besoin créé avec succès !");
      onSave(saved);
    } catch (err) {
      showSnackbar(
        err?.response?.data?.message || err?.response?.data || "Erreur lors de l'enregistrement.",
        "error"
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle
        sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}
      >
        {isEdit ? "Modifier un Besoin de Formation" : "Nouveau Besoin de Formation"}

        <Button
          size="small"
          variant="outlined"
          startIcon={<UploadFileIcon />}
          onClick={handleImportClick}
        >
          Importer depuis Excel
        </Button>
        <input
          type="file"
          accept=".xlsx,.xls"
          ref={fileInputRef}
          style={{ display: "none" }}
          onChange={handleFileChange}
        />
      </DialogTitle>

      <DialogContent>
        <Grid container spacing={2} mt={0.5}>
          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              select fullWidth required
              label="Entreprise"
              value={formData.idEntreprise}
              onChange={handleChange("idEntreprise")}
            >
              {entreprises.map((en) => (
                <MenuItem key={en.idEntreprise} value={en.idEntreprise}>
                  {en.nomEntreprise}
                </MenuItem>
              ))}
            </TextField>
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Département"
              value={formData.dept}
              onChange={handleChange("dept")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth required
              label="Besoin en formation (intitulé)"
              value={formData.intitule}
              onChange={handleChange("intitule")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Population cible"
              placeholder="Ex: white collar, blue collar..."
              value={formData.populationCible}
              onChange={handleChange("populationCible")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth
              label="Période"
              placeholder="Ex: Fin Q2/2025"
              value={formData.periode}
              onChange={handleChange("periode")}
            />
          </Grid>

          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth type="number"
              label="Cadre"
              value={formData.nbCadre}
              onChange={handleChange("nbCadre")}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth type="number"
              label="TAM"
              value={formData.nbTam}
              onChange={handleChange("nbTam")}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth type="number"
              label="PRO"
              value={formData.nbPro}
              onChange={handleChange("nbPro")}
            />
          </Grid>
          <Grid size={{ xs: 6, md: 3 }}>
            <TextField
              fullWidth type="number"
              label="Priorité"
              value={formData.priorite}
              onChange={handleChange("priorite")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth multiline minRows={2}
              label="Objectifs des formations"
              value={formData.objectifs}
              onChange={handleChange("objectifs")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth multiline minRows={2}
              label="Compétences ciblées"
              value={formData.competencesCiblees}
              onChange={handleChange("competencesCiblees")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth multiline minRows={2}
              label="Indicateurs de succès / Performance"
              value={formData.indicateursSucces}
              onChange={handleChange("indicateursSucces")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth multiline minRows={2}
              label="Evaluation"
              value={formData.evaluation}
              onChange={handleChange("evaluation")}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 6 }}>
            <TextField
              fullWidth type="number"
              label="Budget Estimatif (MAD)"
              value={formData.budgetEstimatif}
              onChange={handleChange("budgetEstimatif")}
            />
          </Grid>

          <Grid size={{ xs: 12 }}>
            <TextField
              fullWidth multiline minRows={2}
              label="Remarques"
              value={formData.remarques}
              onChange={handleChange("remarques")}
            />
          </Grid>
        </Grid>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose}>Annuler</Button>
        <Button variant="contained" onClick={handleSave} disabled={saving}>
          {isEdit ? "Mettre à jour" : "Créer"}
        </Button>
      </DialogActions>

      {/* Row picker — shown when the imported sheet has more than one row */}
      <Dialog
        open={pickerOpen}
        onClose={() => !importing && setPickerOpen(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Sélectionnez les lignes à importer</DialogTitle>

        <DialogContent dividers sx={{ p: 0 }}>
          <ListItemButton onClick={toggleSelectAll} dense disabled={importing}>
            <ListItemIcon>
              <Checkbox
                edge="start"
                checked={selectedRows.size === importRows.length && importRows.length > 0}
                indeterminate={selectedRows.size > 0 && selectedRows.size < importRows.length}
                tabIndex={-1}
                disableRipple
              />
            </ListItemIcon>
            <ListItemText
              primary={`Tout sélectionner (${selectedRows.size}/${importRows.length})`}
            />
          </ListItemButton>
          <Divider />

          <List disablePadding>
            {importRows.map((row, idx) => {
              const intitule =
                row["Besoin en Formation"] ?? row["besoin en formation"] ?? `Ligne ${idx + 1}`;
              const dept = row["Dept"] ?? row["dept"] ?? "";
              return (
                <div key={idx}>
                  <ListItemButton
                    onClick={() => toggleRowSelected(idx)}
                    dense
                    disabled={importing}
                  >
                    <ListItemIcon>
                      <Checkbox
                        edge="start"
                        checked={selectedRows.has(idx)}
                        tabIndex={-1}
                        disableRipple
                      />
                    </ListItemIcon>
                    <ListItemText
                      primary={intitule}
                      secondary={dept ? `Dept: ${dept}` : null}
                    />
                  </ListItemButton>
                  {idx < importRows.length - 1 && <Divider />}
                </div>
              );
            })}
          </List>
        </DialogContent>

        <DialogActions sx={{ justifyContent: "space-between", px: 2 }}>
          <Typography variant="caption" color="text.secondary">
            {importing && (
              <Box component="span" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={14} /> Import en cours...
              </Box>
            )}
          </Typography>

          <Box sx={{ display: "flex", gap: 1 }}>
            <Button onClick={() => setPickerOpen(false)} disabled={importing}>
              Annuler
            </Button>
            <Button
              variant="outlined"
              disabled={importing || selectedRows.size === 0}
              onClick={() => handleBulkImport(importRows.filter((_, idx) => selectedRows.has(idx)))}
            >
              Importer la sélection ({selectedRows.size})
            </Button>
            <Button
              variant="contained"
              disabled={importing || importRows.length === 0}
              onClick={() => handleBulkImport(importRows)}
            >
              Importer tout ({importRows.length})
            </Button>
          </Box>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
};

export default BesoinFormationModal;
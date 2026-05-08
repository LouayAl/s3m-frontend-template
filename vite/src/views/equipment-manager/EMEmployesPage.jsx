import { useEffect, useState, useCallback, useMemo } from 'react';
import {
  Box, Typography, Card, CardContent,
  TextField, Grid, Snackbar, Alert, Button,
} from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import AddIcon from '@mui/icons-material/Add';
import { getEmEmployes } from '../../api/employeApi';
import EmployeModal from '../employes/EmployesModal';
import { useAuth } from '../../contexts/auth/AuthContext';

const exportButtonSx = { backgroundColor: '#4CAF50', '&:hover': { backgroundColor: '#43A047' } };

export default function EMEmployesPage() {
  const { user } = useAuth();
  const isTrainer = user?.role === 'TRAINER';

  const [employes,       setEmployes]       = useState([]);
  const [loading,        setLoading]        = useState(true);
  const [search,         setSearch]         = useState('');
  const [modalOpen,      setModalOpen]      = useState(false);
  const [editingEmploye, setEditingEmploye] = useState(null);
  const [snackbar,       setSnackbar]       = useState({ open: false, message: '', severity: 'success' });

  const showSnackbar        = (message, severity = 'success') => setSnackbar({ open: true, message, severity });
  const handleCloseSnackbar = () => setSnackbar(prev => ({ ...prev, open: false }));

  const fetchEmployes = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getEmEmployes();
      setEmployes(data);
    } catch {
      showSnackbar('Erreur lors du chargement des employés', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployes(); }, [fetchEmployes]);

  const handleExport = () => {
    if (!employes.length) { showSnackbar('Aucun employé à exporter.', 'warning'); return; }
    const data = employes.map(e => ({
      'Entreprise': e.entrepriseNom, 'Département': e.departementNom,
      'Nom': e.nom, 'Prénom': e.prenom, 'Matricule': e.matricule,
      'CSP': e.csp, 'Genre': e.f_h, 'CIN': e.cin, 'CNSS': e.cnss,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employés');
    const today = new Date().toISOString().split('T')[0];
    saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Export_Employes_${today}.xlsx`);
  };

  const columns = [
    { field: 'entrepriseNom',  headerName: 'Entreprise',   flex: 1, minWidth: 140 },
    { field: 'departementNom', headerName: 'Département',  flex: 1, minWidth: 140 },
    { field: 'nom',            headerName: 'Nom',          flex: 1, minWidth: 130 },
    { field: 'prenom',         headerName: 'Prénom',       flex: 1, minWidth: 130 },
    { field: 'matricule',      headerName: 'Matricule',    flex: 1, minWidth: 110 },
    { field: 'csp',            headerName: 'CSP',          flex: 0.8, minWidth: 80 },
    { field: 'f_h',            headerName: 'Genre',        flex: 0.6, minWidth: 70 },
    { field: 'typeContrat',    headerName: 'Type Contrat', flex: 1, minWidth: 120 },
    { field: 'fonction',       headerName: 'Fonction',     flex: 1, minWidth: 130 },
  ];

  const filteredRows = useMemo(() => employes.filter(e =>
    e.nom?.toLowerCase().includes(search.toLowerCase()) ||
    e.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    e.matricule?.toLowerCase().includes(search.toLowerCase())
  ), [employes, search]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>Liste des Employés</Typography>
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Rechercher par nom, prénom ou matricule"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'flex-start', gap: 1, flexWrap: 'wrap' }}>
              {!isTrainer && (
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => { setEditingEmploye(null); setModalOpen(true); }}
                >
                  Créer un employé
                </Button>
              )}
              <Button variant="contained" sx={exportButtonSx} onClick={handleExport}>
                Export Excel
              </Button>
            </Grid>
          </Grid>
          <Box sx={{ height: '70vh', width: '100%' }}>
            <DataGrid
              rows={filteredRows}
              columns={columns}
              getRowId={row => row.idEmploye}
              loading={loading}
              pageSizeOptions={[10, 20, 50, 100]}
              initialState={{
                pagination: { paginationModel: { pageSize: 20 } },
                sorting: { sortModel: [{ field: 'idEmploye', sort: 'desc' }] },
              }}
              slots={{ toolbar: GridToolbar }}
              slotProps={{ toolbar: { showQuickFilter: false } }}
            />
          </Box>
        </CardContent>
      </Card>

      <EmployeModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initialData={editingEmploye}
        showSnackbar={showSnackbar}
        onSave={() => {
          setModalOpen(false);
          fetchEmployes();
        }}
      />

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
        <Alert severity={snackbar.severity} variant="filled">{snackbar.message}</Alert>
      </Snackbar>
    </Box>
  );
}
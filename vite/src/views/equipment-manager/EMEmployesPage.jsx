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
      showSnackbar('Error occurred while loading employees', 'error');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchEmployes(); }, [fetchEmployes]);

  const handleExport = () => {
    if (!employes.length) { showSnackbar('No employees to export.', 'warning'); return; }
    const data = employes.map(e => ({
      'Company': e.entrepriseNom, 'Department': e.departementNom,
      'Last Name': e.nom, 'First Name': e.prenom, 'Employee ID': e.matricule,
      'Job Title': e.csp, 'Gender': e.f_h, 'National ID': e.cin, 'Social Security': e.cnss,
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Employees');
    const today = new Date().toISOString().split('T')[0];
    saveAs(new Blob([XLSX.write(wb, { bookType: 'xlsx', type: 'array' })],
      { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' }),
      `Export_Employees_${today}.xlsx`);
  };

  const columns = [
    { field: 'entrepriseNom',  headerName: 'Company',   flex: 1, minWidth: 140 },
    { field: 'departementNom', headerName: 'Department',  flex: 1, minWidth: 140 },
    { field: 'nom',            headerName: 'Last Name',          flex: 1, minWidth: 130 },
    { field: 'prenom',         headerName: 'First Name',       flex: 1, minWidth: 130 },
    { field: 'matricule',      headerName: 'Registration Number',    flex: 1, minWidth: 110 },
    { field: 'csp',            headerName: 'Job Title',          flex: 0.8, minWidth: 80 },
    { field: 'f_h',            headerName: 'Gender',        flex: 0.6, minWidth: 70 },
    { field: 'typeContrat',    headerName: 'Contract Type', flex: 1, minWidth: 120 },
    { field: 'fonction',       headerName: 'Function',     flex: 1, minWidth: 130 },
  ];

  const filteredRows = useMemo(() => employes.filter(e =>
    e.nom?.toLowerCase().includes(search.toLowerCase()) ||
    e.prenom?.toLowerCase().includes(search.toLowerCase()) ||
    e.cin?.toLowerCase().includes(search.toLowerCase()) ||
    e.matricule?.toLowerCase().includes(search.toLowerCase())
  ), [employes, search]);

  return (
    <Box>
      <Typography variant="h4" fontWeight={700} mb={3}>List of Employees</Typography>
      <Card sx={{ borderRadius: 2, boxShadow: 'none', border: '1px solid', borderColor: 'divider' }}>
        <CardContent>
          <Grid container spacing={2} mb={2} alignItems="center">
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Search by name, first name, CIN or employee number"
                value={search}
                sx={{
                  width: {
                    xs: '100%',
                    md: 200,
                    lg: 380,
                  },
                }}
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
                  Create Employee
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

// frontend-template/vite/src/views/evaluation/EvaluationAChaudPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent,
  LinearProgress, Chip, TextField, MenuItem,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getAllSessionsEvaluationSummary } from '../../api/evaluationApi';
import { getAllEntreprises } from '../../api/entrepriseApi';
import { useAuth } from '../../contexts/auth/AuthContext';
import { useGlobalFilter } from '../../contexts/filters/GlobalFilterContext';

function MoyenneChip({ value }) {
  const color = value >= 3.5 ? 'success' : value >= 2.5 ? 'warning' : 'error';
  return <Chip label={`${value}/4`} color={color} size="small" />;
}

export default function EvaluationAChaudPage() {
  const [rows,       setRows]       = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [entreprises, setEntreprises] = useState([]);

  const navigate       = useNavigate();
  const { user }       = useAuth();
  const isAdmin        = user?.role === 'ADMIN';

  const { selectedEntrepriseId, setSelectedEntrepriseId } = useGlobalFilter();

  // Load entreprise list for the dropdown (admin only)
  useEffect(() => {
    if (!isAdmin) return;
    getAllEntreprises('CLIENT').then(setEntreprises).catch(() => {});
  }, [isAdmin]);

  // Re-fetch whenever the entreprise filter changes
  useEffect(() => {
    setLoading(true);
    getAllSessionsEvaluationSummary(isAdmin ? (selectedEntrepriseId || null) : undefined)
      .then(setRows)
      .finally(() => setLoading(false));
  }, [selectedEntrepriseId, isAdmin]);

  const columns = [
    { field: 'referenceSession', headerName: 'Réf. session', width: 140 },
    { field: 'moduleFormation',  headerName: 'Formation',    flex: 1, minWidth: 180 },
    ...(isAdmin ? [{ field: 'entrepriseNom', headerName: 'Entreprise', width: 180 }] : []),
    { field: 'formateur',        headerName: 'Formateur',    flex: 1, minWidth: 160 },
    {
      field: 'totalReponses',
      headerName: 'Réponses',
      width: 120,
      renderCell: p => `${p.row.totalReponses} / ${p.row.totalParticipants}`,
    },
    {
      field: 'moyenneGlobale',
      headerName: 'Moyenne',
      width: 120,
      renderCell: p => <MoyenneChip value={p.row.moyenneGlobale} />,
    },
    {
      field: 'derniereSoumission',
      headerName: 'Dernière réponse',
      width: 180,
      renderCell: p => p.row.derniereSoumission
        ? new Date(p.row.derniereSoumission).toLocaleDateString('fr-FR')
        : '—',
    },
  ];

  return (
    <Box p={3}>
      <Box display="flex" alignItems="center" justifyContent="space-between"
        flexWrap="wrap" gap={2} mb={3}>
        <Typography variant="h4" fontWeight={700}>
          Évaluations à chaud
        </Typography>

        {/* Entreprise filter — admin only */}
        {isAdmin && (
          <TextField
            select
            size="small"
            label="Entreprise"
            value={selectedEntrepriseId || ''}
            onChange={e => setSelectedEntrepriseId(e.target.value)}
            sx={{ minWidth: 220 }}
          >
            <MenuItem value=""><em>Toutes les entreprises</em></MenuItem>
            {entreprises.map(ent => (
              <MenuItem key={ent.idEntreprise} value={ent.idEntreprise}>
                {ent.nomEntreprise}
              </MenuItem>
            ))}
          </TextField>
        )}
      </Box>

      <Card>
        <CardContent>
          {loading && <LinearProgress sx={{ mb: 2 }} />}
          <Box sx={{ height: '70vh' }}>
            <DataGrid
              rows={rows}
              columns={columns}
              getRowId={r => r.idSession}
              loading={loading}
              pageSizeOptions={[10, 25, 50, 100]}
              onRowClick={p => navigate(`/evaluations-a-chaud/${p.row.idSession}`)}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
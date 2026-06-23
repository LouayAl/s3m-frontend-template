// frontend-template/vite/src/views/evaluation/EvaluationAChaudPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent,
  LinearProgress, Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getAllSessionsEvaluationSummary } from '../../api/evaluationApi';

function MoyenneChip({ value }) {
  const color = value >= 4 ? 'success' : value >= 3 ? 'warning' : 'error';
  return <Chip label={`${value}/4`} color={color} size="small" />;
}

export default function EvaluationAChaudPage() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllSessionsEvaluationSummary()
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { field: 'referenceSession', headerName: 'Réf. session', width: 140 },
    { field: 'moduleFormation',  headerName: 'Formation',    flex: 1, minWidth: 180 },
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
      <Typography variant="h4" fontWeight={700} mb={3}>
        Évaluations à chaud
      </Typography>
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
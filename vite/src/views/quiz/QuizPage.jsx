// frontend-template/vite/src/views/quiz/QuizPage.jsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent,
  LinearProgress, Chip,
} from '@mui/material';
import { DataGrid } from '@mui/x-data-grid';
import { getAllSessionsQuizSummary } from '../../api/evaluationApi';

const TOTAL_QUESTIONS = 23;

function ScoreChip({ value }) {
  const pct   = Math.round((value / TOTAL_QUESTIONS) * 100);
  const color = pct >= 75 ? 'success' : pct >= 50 ? 'warning' : 'error';
  return (
    <Chip
      label={`${value}/${TOTAL_QUESTIONS} (${pct}%)`}
      color={color}
      size="small"
    />
  );
}

export default function QuizPage() {
  const [rows,    setRows]    = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    getAllSessionsQuizSummary()
      .then(setRows)
      .finally(() => setLoading(false));
  }, []);

  const columns = [
    { field: 'referenceSession', headerName: 'Réf. session', width: 140 },
    { field: 'moduleFormation',  headerName: 'Formation',    flex: 1, minWidth: 180 },
    { field: 'formateur',        headerName: 'Formateur',    width: 160 },
    {
      field: 'totalReponses',
      headerName: 'Réponses',
      width: 130,
      renderCell: p => `${p.row.totalReponses} / ${p.row.totalParticipants}`,
    },
    {
      field: 'scoreMoyen',
      headerName: 'Score moyen',
      width: 180,
      renderCell: p => <ScoreChip value={p.row.scoreMoyen} />,
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
      <Typography variant="h4" fontWeight={700} mb={1}>
        Quiz Sécurité
      </Typography>
      <Typography variant="body2" color="text.secondary" mb={3}>
        Cliquez sur une ligne pour voir les résultats détaillés
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
              onRowClick={p => navigate(`/quiz/${p.row.idSession}`)}
              sx={{ cursor: 'pointer' }}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
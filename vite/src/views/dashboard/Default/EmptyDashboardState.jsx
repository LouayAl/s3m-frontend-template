// frontend-template/vite/src/views/dashboard/Default/EmptyDashboardState.jsx
import { Box, Typography } from "@mui/material";

export default function EmptyDashboardState() {
  return (
    <Box
      sx={{
        textAlign: "center",
        mt: 10,
        opacity: 0.7
      }}
    >
      <Typography variant="h5">
        Aucun KPI disponible pour le moment
      </Typography>

      <Typography variant="body2" sx={{ mt: 1 }}>
        Les données apparaîtront dès que des sessions et participants seront enregistrés.
      </Typography>
    </Box>
  );
}

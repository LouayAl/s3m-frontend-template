// frontend-template/vite/src/views/dashboard/Default/DashboardSkeleton.jsx

import Grid from "@mui/material/Grid";
import Skeleton from "@mui/material/Skeleton";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Stack from "@mui/material/Stack";

import { gridSpacing } from "store/constant";

/* ---------- KPI Skeleton Card ---------- */
const KpiSkeletonCard = () => (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <Stack spacing={1}>
        {/* Title */}
        <Skeleton variant="text" width="50%" height={22} />

        {/* Big KPI number */}
        <Skeleton variant="text" width="30%" height={40} />

        {/* Small progress bar */}
        <Skeleton
          variant="rounded"
          width="100%"
          height={10}
          sx={{ borderRadius: 5 }}
        />
      </Stack>
    </CardContent>
  </Card>
);

/* ---------- Chart Skeleton Card ---------- */
const ChartSkeletonCard = ({ height = 250 }) => (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <Stack spacing={2}>
        {/* Chart Title */}
        <Skeleton variant="text" width="40%" height={25} />

        {/* Fake chart bars */}
        <Stack direction="row" spacing={1} alignItems="flex-end">
          {[40, 70, 55, 90, 60, 75].map((h, i) => (
            <Skeleton
              key={i}
              variant="rounded"
              width={20}
              height={h}
              sx={{ borderRadius: 2 }}
            />
          ))}
        </Stack>

        {/* Bottom axis line */}
        <Skeleton variant="rounded" height={8} width="100%" />
      </Stack>
    </CardContent>
  </Card>
);

/* ---------- Pie Skeleton Card ---------- */
const PieSkeletonCard = () => (
  <Card sx={{ borderRadius: 3 }}>
    <CardContent>
      <Stack spacing={2} alignItems="center">
        {/* Title */}
        <Skeleton variant="text" width="50%" height={25} />

        {/* Circle placeholder */}
        <Skeleton variant="circular" width={140} height={140} />

        {/* Legend lines */}
        <Skeleton variant="text" width="70%" />
        <Skeleton variant="text" width="60%" />
      </Stack>
    </CardContent>
  </Card>
);

export default function DashboardSkeleton() {
  return (
    <Grid container spacing={gridSpacing}>

      {/* ---------- TOP KPI ROW ---------- */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 4 }}>
            <KpiSkeletonCard />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <KpiSkeletonCard />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <Grid container spacing={gridSpacing}>
              <Grid size={12}>
                <KpiSkeletonCard />
              </Grid>
              <Grid size={12}>
                <KpiSkeletonCard />
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Grid>

      {/* ---------- MAIN CHART ROW ---------- */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          <Grid size={{ xs: 12, md: 8 }}>
            <ChartSkeletonCard height={280} />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <ChartSkeletonCard height={280} />
          </Grid>
        </Grid>
      </Grid>

      {/* ---------- BOTTOM PIE / SMALL CHARTS ---------- */}
      <Grid size={12}>
        <Grid container spacing={gridSpacing}>
          {[1, 2, 3].map((i) => (
            <Grid size={{ xs: 12, md: 4 }} key={i}>
              <PieSkeletonCard />
            </Grid>
          ))}
        </Grid>
      </Grid>
    </Grid>
  );
}

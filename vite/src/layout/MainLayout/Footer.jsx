// frontend-template/vite/src/layout/MainLayout/Footer.jsx
// material-ui
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

export default function Footer() {
  return (
    <Stack direction="row" sx={{ alignItems: 'center', justifyContent: 'space-between', pt: 3, mt: 'auto' }}>
      <Typography variant="caption">
        &copy; All rights reserved{' '}
      </Typography>
    </Stack>
  );
}

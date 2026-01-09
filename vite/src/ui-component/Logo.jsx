// frontend-template/vite/src/ui-component/Logo.jsx
import { Box } from '@mui/material';

// replace with your actual path
import myLogo from 'assets/images/Logo.webp';

export default function Logo() {
  return (
    <Box
      component="img"
      src={myLogo}
      alt="Logo"
      sx={{
        width: 180, // adjust as needed
        height: 'auto',
        display: 'block',
        margin: '0 auto',
      }}
    />
  );
}

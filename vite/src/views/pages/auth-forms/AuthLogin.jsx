// frontend-template/vite/src/views/pages/auth-forms/AuthLogin.jsx
// Only 2 lines change from your current version — the handleSubmit function:

// REPLACE this block in handleSubmit:
//   const userData = await login(email, password);
//   navigate('/dashboard', { replace: true });

// WITH:
//   const userData = await login(email, password);
//   if (userData?.role === 'EQUIPMENT_MANAGER') {
//     navigate('/em/dashboard', { replace: true });
//   } else {
//     navigate('/dashboard', { replace: true });
//   }

// Also update the useEffect redirect (for already-logged-in users):
// REPLACE:
//   navigate('/dashboard', { replace: true });
// WITH:
//   if (user?.role === 'EQUIPMENT_MANAGER') {
//     navigate('/em/dashboard', { replace: true });
//   } else {
//     navigate('/dashboard', { replace: true });
//   }

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from 'contexts/auth/AuthContext';

import Button from '@mui/material/Button';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import OutlinedInput from '@mui/material/OutlinedInput';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';

import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

export default function AuthLogin() {
  const [email, setEmail]               = useState('');
  const [password, setPassword]         = useState('');
  const [checked, setChecked]           = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');

  const { user, login, loading } = useAuth();
  const navigate = useNavigate();
  const getDashboardPath = (role) =>
    role === 'EQUIPMENT_MANAGER' || role === 'TRAINER' ? '/em/dashboard' : '/dashboard';

  // Redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate(getDashboardPath(user.role), { replace: true });
    }
  }, [user, loading, navigate]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const userData = await login(email, password);

      navigate(getDashboardPath(userData?.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      console.error('❌ Login error:', err);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomFormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel htmlFor="email-login">Adresse e-mail / Nom d'utilisateur</InputLabel>
        <OutlinedInput
          id="email-login"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          name="email"
        />
      </CustomFormControl>

      <CustomFormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel htmlFor="password-login">Mot de passe</InputLabel>
        <OutlinedInput
          id="password-login"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label="toggle password visibility"
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                edge="end"
                size="large"
              >
                {showPassword ? <Visibility /> : <VisibilityOff />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
      </CustomFormControl>

      {error && (
        <Typography color="error" variant="body2" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Grid container sx={{ alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Grid>
          <FormControlLabel
            control={<Checkbox checked={checked} onChange={(e) => setChecked(e.target.checked)} name="checked" color="primary" />}
            label="Rester connecté"
          />
        </Grid>
      </Grid>

      <Box>
        <AnimateButton>
          <Button color="secondary" fullWidth size="large" type="submit" variant="contained" sx={{ color: '#ffffffff' }}>
            Se connecter
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}

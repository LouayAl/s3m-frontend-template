// frontend-template/vite/src/views/pages/auth-forms/AuthLogin.jsx

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
  const [identifier, setIdentifier]     = useState('');
  const [password, setPassword]         = useState('');
  const [checked, setChecked]           = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError]               = useState('');

  const { user, login, loading } = useAuth();
  const navigate = useNavigate();

  const getDashboardPath = (role) =>
    role === 'EQUIPMENT_MANAGER' || role === 'TRAINER' ? '/em/dashboard' : '/dashboard';

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
      const userData = await login(identifier, password);
      navigate(getDashboardPath(userData?.role), { replace: true });
    } catch (err) {
      setError(err.message || 'Identifiant ou mot de passe incorrect');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <CustomFormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel htmlFor="identifier-login">Email ou nom d'utilisateur</InputLabel>
        <OutlinedInput
          id="identifier-login"
          type="text"
          value={identifier}
          onChange={(e) => setIdentifier(e.target.value)}
          name="identifier"
          label="Email ou nom d'utilisateur"
        />
      </CustomFormControl>

      <CustomFormControl fullWidth sx={{ mb: 1 }}>
        <InputLabel htmlFor="password-login">Mot de passe</InputLabel>
        <OutlinedInput
          id="password-login"
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          label="Mot de passe"
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
            control={
              <Checkbox
                checked={checked}
                onChange={(e) => setChecked(e.target.checked)}
                name="checked"
                color="primary"
              />
            }
            label="Rester connecté"
          />
        </Grid>
      </Grid>

      <Box>
        <AnimateButton>
          <Button color="secondary" fullWidth size="large" type="submit" variant="contained"
            sx={{ color: '#ffffffff' }}>
            Se connecter
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}
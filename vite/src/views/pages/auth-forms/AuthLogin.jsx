// frontend-template/vite/src/views/pages/auth-forms/AuthLogin.jsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from 'contexts/auth/AuthContext';

// material-ui
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

// project imports
import AnimateButton from 'ui-component/extended/AnimateButton';
import CustomFormControl from 'ui-component/extended/Form/CustomFormControl';

// assets
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

// ===============================|| JWT - LOGIN ||=============================== //

export default function AuthLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [checked, setChecked] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const { user, login, loading } = useAuth(); // get loading too
  const navigate = useNavigate();

  // ✅ redirect if already logged in
  useEffect(() => {
    if (!loading && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [user, loading, navigate]);

  const handleClickShowPassword = () => setShowPassword(!showPassword);
  const handleMouseDownPassword = (event) => event.preventDefault();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');

    try {

      const userData = await login(email, password);

      // Redirect to dashboard
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.message || 'Invalid email or password');
      console.error("❌ Login error:", err);
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
        <Grid>
          <Typography
            variant="subtitle1"
            component={Link}
            to="#!"
            sx={{ textDecoration: 'none', color: 'secondary.main', cursor: 'pointer' }}
          >
            Mot de passe oublié ?
          </Typography>
        </Grid>
      </Grid>

      <Box>
        <AnimateButton>
          <Button
            color="secondary"
            fullWidth
            size="large"
            type="submit"
            variant="contained"
            sx={{ color: '#ffffffff' }} // force white text
          >
            Se connecter
          </Button>
        </AnimateButton>
      </Box>
    </form>
  );
}

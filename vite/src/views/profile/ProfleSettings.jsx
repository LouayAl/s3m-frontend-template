// frontend/src/contexts/auth/AuthContext.jsx
// frontend-template/vite/src/views/profile/ProfileSettings.jsx

import { useState } from 'react';
import { useAuth } from 'contexts/auth/AuthContext';
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import { updateUserProfile } from 'api/userApi'; // You need to implement API

import User1 from 'assets/images/users/user-round.svg';

export default function ProfileSettings() {
  const theme = useTheme();
  const { user, setUser } = useAuth();

  const [prenom, setPrenom] = useState(user?.prenom || '');
  const [nom, setNom] = useState(user?.nom || '');
  const [avatar, setAvatar] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleAvatarChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setAvatar(e.target.files[0]);
    }
  };

  const handleSave = async () => {
    setLoading(true);

    try {
      // Form data for avatar + name
      const formData = new FormData();
      formData.append('prenom', prenom);
      formData.append('nom', nom);
      if (avatar) formData.append('avatar', avatar);

      const updatedUser = await updateUserProfile(user.id, formData);

      // Update auth context
      setUser(updatedUser);
      alert('Profil mis à jour avec succès !');
    } catch (err) {
      console.error('Erreur lors de la mise à jour:', err);
      alert('Impossible de mettre à jour le profil.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Card>
        <CardContent>
          <Stack spacing={3}>
            <Typography variant="h4">Paramètres du profil</Typography>

            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar
                src={avatar ? URL.createObjectURL(avatar) : User1}
                alt="avatar"
                sx={{ width: 80, height: 80 }}
              />
              <Button variant="outlined" component="label">
                Changer l'avatar
                <input type="file" hidden onChange={handleAvatarChange} />
              </Button>
            </Stack>

            <TextField
              label="Prénom"
              value={prenom}
              onChange={(e) => setPrenom(e.target.value)}
              fullWidth
            />

            <TextField
              label="Nom"
              value={nom}
              onChange={(e) => setNom(e.target.value)}
              fullWidth
            />

            <TextField
              label="Email"
              value={user?.email || ''}
              fullWidth
              disabled
            />

            <TextField
              label="Role"
              value={user?.role || ''}
              fullWidth
              disabled
            />

            <Stack direction="row" spacing={2}>
              <Button
                variant="contained"
                onClick={handleSave}
                disabled={loading}
              >
                {loading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
              <Button variant="outlined" onClick={() => {
                setPrenom(user?.prenom || '');
                setNom(user?.nom || '');
                setAvatar(null);
              }}>
                Annuler
              </Button>
            </Stack>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

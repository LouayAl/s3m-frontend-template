// frontend-template/vite/src/layout/MainLayout/Header/ProfileSection/index.jsx

import { useRef, useState, useEffect } from 'react';
import { useAuth } from 'contexts/auth/AuthContext';
import { useNavigate } from 'react-router-dom';

// material-ui
import { useTheme } from '@mui/material/styles';
import Avatar from '@mui/material/Avatar';
import Chip from '@mui/material/Chip';
import ClickAwayListener from '@mui/material/ClickAwayListener';
import Paper from '@mui/material/Paper';
import Popper from '@mui/material/Popper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';

// project imports
import MainCard from 'ui-component/cards/MainCard';
import Transitions from 'ui-component/extended/Transitions';
import useConfig from 'hooks/useConfig';

// assets & icons
import User1 from 'assets/images/users/user-round.svg';
import { IconLogout, IconSettings } from '@tabler/icons-react';

export default function ProfileSection() {
  const theme = useTheme();
  const {
    state: { borderRadius }
  } = useConfig();

  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen] = useState(false);
  const anchorRef = useRef(null);

  const handleToggle = () => setOpen((prev) => !prev);
  const handleClose = (event) => {
    if (anchorRef.current && anchorRef.current.contains(event.target)) return;
    setOpen(false);
  };

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  // Placeholder: implement actual profile settings logic
  const handleProfileSettings = () => {
    setOpen(false);
    alert('Ouvrir les paramètres du profil (à implémenter)');
  };

  // Keep focus on toggle chip
  const prevOpen = useRef(open);
  useEffect(() => {
    if (prevOpen.current === true && open === false) {
      anchorRef.current.focus();
    }
    prevOpen.current = open;
  }, [open]);

  return (
    <>
      {/* User Avatar + Chip */}
      <Chip
        sx={{ ml: 2, height: '48px', alignItems: 'center', borderRadius: '27px' }}
        icon={
          <Avatar
            src={User1}
            alt="user-avatar"
            sx={{ typography: 'mediumAvatar', cursor: 'pointer', margin: '8px 0 8px 8px !important' }}
            ref={anchorRef}
            aria-controls={open ? 'menu-list-grow' : undefined}
            aria-haspopup="true"
          />
        }
        label={<IconSettings stroke={1.5} size="24px" />}
        ref={anchorRef}
        aria-controls={open ? 'menu-list-grow' : undefined}
        aria-haspopup="true"
        onClick={handleToggle}
        color="primary"
      />

      <Popper
        placement="bottom"
        open={open}
        anchorEl={anchorRef.current}
        role={undefined}
        transition
        disablePortal
        modifiers={[{ name: 'offset', options: { offset: [0, 14] } }]}
      >
        {({ TransitionProps }) => (
          <ClickAwayListener onClickAway={handleClose}>
            <Transitions in={open} {...TransitionProps}>
              <Paper>
                {open && (
                  <MainCard border={false} elevation={16} content={false} boxShadow={theme.shadows[16]}>
                    <Box sx={{ p: 2, pb: 0 }}>
                      <Stack>
                        <Stack direction="row" sx={{ alignItems: 'center', gap: 0.5 }}>
                          <Typography variant="h4">Bonjour,</Typography>
                          <Typography component="span" variant="h4" sx={{ fontWeight: 400 }}>
                            {user ? `${user.prenom} ${user.nom}` : 'John Doe'}
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle2">{user ? user.role : 'Administrateur'}</Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ p: 2, py: 0, maxHeight: 'calc(100vh - 250px)', overflowX: 'hidden' }}>
                      <List
                        component="nav"
                        sx={{
                          width: '100%',
                          maxWidth: 300,
                          minWidth: 280,
                          borderRadius: `${borderRadius}px`,
                          '& .MuiListItemButton-root': { mt: 0.5 }
                        }}
                      >
                        {/* Profile Settings */}
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleProfileSettings}>
                          <ListItemIcon>
                            <IconSettings stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Paramètres du profil</Typography>} />
                        </ListItemButton>

                        {/* Logout */}
                        <ListItemButton sx={{ borderRadius: `${borderRadius}px` }} onClick={handleLogout}>
                          <ListItemIcon>
                            <IconLogout stroke={1.5} size="20px" />
                          </ListItemIcon>
                          <ListItemText primary={<Typography variant="body2">Se déconnecter</Typography>} />
                        </ListItemButton>
                      </List>
                    </Box>
                  </MainCard>
                )}
              </Paper>
            </Transitions>
          </ClickAwayListener>
        )}
      </Popper>
    </>
  );
}

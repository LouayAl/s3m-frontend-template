// frontend-template/vite/src/layout/EquipmentManagerLayout/index.jsx
import { useState } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon,
  ListItemText, Typography, Divider, IconButton,
  Avatar, Menu, MenuItem, Tooltip,
} from '@mui/material';
import DashboardOutlinedIcon    from '@mui/icons-material/DashboardOutlined';
import PeopleOutlinedIcon       from '@mui/icons-material/PeopleOutlined';
import SchoolOutlinedIcon       from '@mui/icons-material/SchoolOutlined';
import AssignmentOutlinedIcon   from '@mui/icons-material/AssignmentOutlined';
import FactCheckOutlinedIcon    from '@mui/icons-material/FactCheckOutlined';
import MenuIcon                 from '@mui/icons-material/Menu';
import LogoutOutlinedIcon       from '@mui/icons-material/LogoutOutlined';
import { useAuth } from 'contexts/auth/AuthContext';
import Logo from 'ui-component/Logo';

const DRAWER_WIDTH = 248;

const NAV = [
  { section: 'Dashboard',    items: [{ label:'Dashboard',             icon:<DashboardOutlinedIcon  sx={{fontSize:18}}/>, path:'/em/dashboard'    }] },
  { section: 'Formations',   items: [{ label:'Formations',            icon:<SchoolOutlinedIcon     sx={{fontSize:18}}/>, path:'/em/formations'   }] },
  { section: 'Employés',     items: [{ label:'Employés',              icon:<PeopleOutlinedIcon     sx={{fontSize:18}}/>, path:'/em/employes'     }] },
  { section: 'Évaluations',  items: [{ label:'Évaluations',           icon:<FactCheckOutlinedIcon  sx={{fontSize:18}}/>, path:'/em/evaluations'  }] },
];

export default function EquipmentManagerLayout() {
  const navigate   = useNavigate();
  const location   = useLocation();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl]     = useState(null);

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + '/');

  const SidebarContent = (
    <Box sx={{ height:'100%', display:'flex', flexDirection:'column', bgcolor:'background.paper' }}>
      {/* Logo */}
      <Box sx={{ px:2, py:2.5, borderBottom:'1px solid', borderColor:'divider' }}>
        <Logo />
      </Box>

      {/* Nav */}
      <Box sx={{ flex:1, overflow:'auto', py:1 }}>
        {NAV.map(({ section, items }) => (
          <Box key={section}>
            <Typography variant="overline" sx={{
              px:2.5, py:1, display:'block', color:'text.disabled',
              fontSize:10, fontWeight:700, letterSpacing:'0.1em',
            }}>
              {section}
            </Typography>
            <List disablePadding dense>
              {items.map(item => {
                const active = isActive(item.path);
                return (
                  <ListItemButton
                    key={item.label}
                    onClick={() => { navigate(item.path); setMobileOpen(false); }}
                    sx={{
                      mx:1, mb:0.25, borderRadius:1.5,
                      bgcolor: active ? 'primary.main' : 'transparent',
                      color:   active ? '#fff' : 'text.primary',
                      '&:hover': {
                        bgcolor: active ? 'primary.dark' : 'action.hover',
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth:32, color: active ? '#fff' : 'text.secondary' }}>
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{ fontSize:13, fontWeight: active ? 700 : 400 }}
                    />
                  </ListItemButton>
                );
              })}
            </List>
          </Box>
        ))}
      </Box>

      {/* User info */}
      <Box sx={{ p:2, borderTop:'1px solid', borderColor:'divider' }}>
        <Box sx={{ display:'flex', alignItems:'center', gap:1.5 }}>
          <Avatar sx={{ width:34, height:34, bgcolor:'primary.main', fontSize:13 }}>
            {user?.email?.[0]?.toUpperCase() ?? 'E'}
          </Avatar>
          <Box sx={{ flex:1, minWidth:0 }}>
            <Typography variant="body2" fontWeight={600} noWrap>
              {user?.nom ? `${user.prenom} ${user.nom}` : user?.email}
            </Typography>
            <Typography variant="caption" color="text.secondary">Equipment Manager</Typography>
          </Box>
          <Tooltip title="Se déconnecter">
            <IconButton size="small" onClick={handleLogout} color="inherit">
              <LogoutOutlinedIcon sx={{ fontSize:18 }} />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display:'flex', minHeight:'100vh', bgcolor:'grey.100' }}>
      {/* Desktop sidebar */}
      <Drawer variant="permanent"
        sx={{
          width: DRAWER_WIDTH, flexShrink:0,
          display:{ xs:'none', md:'block' },
          '& .MuiDrawer-paper':{ width:DRAWER_WIDTH, boxSizing:'border-box', borderRight:'1px solid', borderColor:'divider' },
        }}
      >
        {SidebarContent}
      </Drawer>

      {/* Mobile sidebar */}
      <Drawer variant="temporary" open={mobileOpen} onClose={()=>setMobileOpen(false)}
        sx={{ display:{ xs:'block', md:'none' }, '& .MuiDrawer-paper':{ width:DRAWER_WIDTH } }}
      >
        {SidebarContent}
      </Drawer>

      {/* Main area */}
      <Box sx={{ flex:1, display:'flex', flexDirection:'column', minWidth:0 }}>
        {/* Topbar */}
        <Box sx={{
          bgcolor:'background.paper', borderBottom:'1px solid', borderColor:'divider',
          px:2, py:1, display:'flex', alignItems:'center', gap:1,
          position:'sticky', top:0, zIndex:100,
        }}>
          <IconButton sx={{ display:{ md:'none' } }} onClick={()=>setMobileOpen(true)}>
            <MenuIcon sx={{ color:'primary.main' }} />
          </IconButton>
          <Box sx={{ flex:1 }} />
          <IconButton onClick={e=>setAnchorEl(e.currentTarget)}>
            <Avatar sx={{ width:32, height:32, bgcolor:'primary.main', fontSize:13 }}>
              {user?.email?.[0]?.toUpperCase() ?? 'E'}
            </Avatar>
          </IconButton>
          <Menu anchorEl={anchorEl} open={Boolean(anchorEl)} onClose={()=>setAnchorEl(null)}>
            <Box sx={{ px:2, py:1 }}>
              <Typography variant="subtitle2" fontWeight={600}>{user?.email}</Typography>
              <Typography variant="caption" color="text.secondary">Equipment Manager</Typography>
            </Box>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <LogoutOutlinedIcon sx={{ mr:1, fontSize:18 }} />
              Se déconnecter
            </MenuItem>
          </Menu>
        </Box>

        {/* Content */}
        <Box sx={{ flex:1, overflow:'auto', p:{ xs:2, md:3 } }}>
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
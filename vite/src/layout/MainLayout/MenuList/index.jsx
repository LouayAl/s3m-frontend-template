// frontend-template/vite/src/layout/MainLayout/MenuList/index.jsx
import { memo, useState } from 'react';

import Divider from '@mui/material/Divider';
import List from '@mui/material/List';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';

import NavItem from './NavItem';
import NavGroup from './NavGroup';
import menuItems from 'menu-items';
import { useAuth } from 'contexts/auth/AuthContext';
import { useGetMenuMaster } from 'api/menu';

function MenuList() {
  const { menuMaster } = useGetMenuMaster();
  const drawerOpen = menuMaster.isDashboardDrawerOpened;
  const { user } = useAuth();
  const [selectedID, setSelectedID] = useState('');

  const lastItem = null;

  // Filter quiz-securite out for users who are not entreprise 42
  const filteredItems = menuItems.items.map(item => {
    if (item.id !== 'session') return item;
    return {
      ...item,
      children: item.children.filter(
        child => child.id !== 'quiz-securite' || user?.entrepriseId === 42
      ),
    };
  });

  let lastItemIndex = filteredItems.length - 1;
  let remItems = [];
  let lastItemId;

  if (lastItem && lastItem < filteredItems.length) {
    lastItemId = filteredItems[lastItem - 1].id;
    lastItemIndex = lastItem - 1;
    remItems = filteredItems
      .slice(lastItem - 1, filteredItems.length)
      .map((item) => ({
        title: item.title,
        elements: item.children,
        icon: item.icon,
        ...(item.url && { url: item.url }),
      }));
  }

  const navItems = filteredItems.slice(0, lastItemIndex + 1).map((item, index) => {
    switch (item.type) {
      case 'group':
        if (item.url && item.id !== lastItemId) {
          return (
            <List key={item.id}>
              <NavItem
                item={item}
                level={1}
                isParents
                setSelectedID={() => setSelectedID('')}
              />
              {index !== 0 && <Divider sx={{ py: 0.5 }} />}
            </List>
          );
        }
        return (
          <NavGroup
            key={item.id}
            setSelectedID={setSelectedID}
            selectedID={selectedID}
            item={item}
            lastItem={lastItem}
            remItems={remItems}
            lastItemId={lastItemId}
          />
        );
      default:
        return (
          <Typography key={item.id} variant="h6" color="error" align="center">
            Menu Items Error
          </Typography>
        );
    }
  });

  return <Box {...(drawerOpen && { sx: { mt: 1.5 } })}>{navItems}</Box>;
}

export default memo(MenuList);
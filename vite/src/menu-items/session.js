// frontend-template/vite/src/menu-items/session.js
// assets
import { IconEdit } from '@tabler/icons-react'; // or any icon you like

const icons = { IconEdit };

// ==============================|| SESSION MENU ITEMS ||============================= //

const session = {
  id: 'session',
  title: 'Sessions',
  type: 'group',
  children: [
    {
      id: 'create-session',
      title: 'Session de Formation',
      type: 'item',
      url: '/sessions',
      icon: icons.IconEdit,
      breadcrumbs: false
    }
  ]
};

export default session;

// frontend-template/vite/src/menu-items/saisie.js
// assets
import { IconEdit } from '@tabler/icons-react'; // or any icon you like

const icons = { IconEdit };

// ==============================|| SAISIE MENU ITEMS ||============================= //

const saisie = {
  id: 'saisie',
  title: 'Saisie',
  type: 'group',
  children: [
    {
      id: 'create-session',
      title: 'Session de Formation',
      type: 'item',
      url: '/saisie',
      icon: icons.IconEdit,
      breadcrumbs: false
    }
  ]
};

export default saisie;

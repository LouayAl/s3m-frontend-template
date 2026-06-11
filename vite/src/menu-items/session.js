// frontend-template/vite/src/menu-items/session.js
// assets
import { IconEdit, IconStars } from '@tabler/icons-react'; // or any icon you like

const icons = { IconEdit, IconStars };

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
    },
    {
      id: 'evaluations-a-chaud',
      title: 'Évaluations à chaud',
      type: 'item',
      url: '/evaluations-a-chaud',
      icon: icons.IconStars ,
      breadcrumbs: false
    }
  ]
};

export default session;

// frontend-template/vite/src/menu-items/besoin.js
import { IconClipboardList } from '@tabler/icons-react';

const icons = { IconClipboardList };

const besoin = {
  id: 'besoin',
  title: 'Besoins',
  type: 'group',
  children: [
    {
      id: 'besoins-formation',
      title: 'Besoins en Formation',
      type: 'item',
      url: '/besoins-formation',
      icon: icons.IconClipboardList,
      breadcrumbs: false,
    },
  ],
};

export default besoin;
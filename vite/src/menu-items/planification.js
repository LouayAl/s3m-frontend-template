// frontend-template/vite/src/menu-items/planification.js
import { IconChartBar } from '@tabler/icons-react';

const planification = {
  id: 'planification',
  title: 'Planification',
  type: 'group',
  children: [
    {
      id: 'planification-page',
      title: 'Planification',
      type: 'item',
      url: '/planification',
      icon: IconChartBar,
      breadcrumbs: false,
    },
  ],
};

export default planification;
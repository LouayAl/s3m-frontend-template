import { IconEdit, IconStars, IconShieldCheck } from '@tabler/icons-react';

const icons = { IconEdit, IconStars, IconShieldCheck };

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
      breadcrumbs: false,
    },
    {
      id: 'evaluations-a-chaud',
      title: 'Évaluations à chaud',
      type: 'item',
      url: '/evaluations-a-chaud',
      icon: icons.IconStars,
      breadcrumbs: false,
    },
    {
      id: 'quiz-securite',
      title: 'Quiz Sécurité',
      type: 'item',
      url: '/quiz',
      icon: icons.IconShieldCheck,
      breadcrumbs: false,
    },
  ],
};

export default session;
// frontend-template/vite/src/routes/index.jsx
import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import EquipmentManagerRoutes from './EquipmentManagerRoutes';
import { rootRedirectLoader } from './authLoader';
import PublicEvaluationForm from '../views/evaluation/PublicEvaluationForm';



// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      path: '/',
      loader: rootRedirectLoader, // 👈 runs BEFORE any UI renders
    },
    {
      path: '/evaluation/session/:sessionId',
      element: <PublicEvaluationForm />,
    },
    MainRoutes,
    AuthenticationRoutes,
    EquipmentManagerRoutes,
  ],
  {
    basename: import.meta.env.VITE_APP_BASE_NAME
  }
);

export default router;

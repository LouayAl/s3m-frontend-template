// frontend-template/vite/src/routes/index.jsx
import { createBrowserRouter } from 'react-router-dom';

// routes
import AuthenticationRoutes from './AuthenticationRoutes';
import MainRoutes from './MainRoutes';
import EquipmentManagerRoutes from './EquipmentManagerRoutes';
import { rootRedirectLoader } from './authLoader';


// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      path: '/',
      loader: rootRedirectLoader, // 👈 runs BEFORE any UI renders
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

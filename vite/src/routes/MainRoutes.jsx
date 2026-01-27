// frontend-template/vite/src/routes/MainRoutes.jsx
import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import SaisiePage from '../views/saisie/SaisiePage';
import FormationsPage from '../views/formations/FormationsPage';
import EntreprisesPage from '../views/entreprises/EntreprisesPage';

// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: (
            <ProtectedRoute>
              <DashboardDefault />
            </ProtectedRoute>
          )
        }
      ]
    },
    {
      path: 'typography',
      element: <UtilsTypography />
    },
    {
      path: 'color',
      element: <UtilsColor />
    },
    {
      path: 'shadow',
      element: <UtilsShadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
    path: 'saisie',          // ✅ new route
    element: (
      <ProtectedRoute>
        <SaisiePage />
      </ProtectedRoute>
    )
    },
    {
    path: 'formations',     
    element: (
      <ProtectedRoute>
        <FormationsPage />
      </ProtectedRoute>
    )
    },
    {
    path: 'entreprises',          // ✅ new route
    element: (
      <ProtectedRoute>
        <EntreprisesPage />
      </ProtectedRoute>
    )
    }
  ]
};

export default MainRoutes;

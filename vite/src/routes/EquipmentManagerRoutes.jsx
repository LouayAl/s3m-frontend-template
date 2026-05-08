// frontend-template/vite/src/routes/EquipmentManagerRoutes.jsx
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from 'ui-component/Loadable';
import EquipmentManagerLayout from 'layout/EquipmentManagerLayout';
import { useAuth } from 'contexts/auth/AuthContext';

const EMDashboard       = Loadable(lazy(() => import('views/equipment-manager/EMDashboard')));
const EMEmployesPage    = Loadable(lazy(() => import('views/equipment-manager/EMEmployesPage')));
const EMFormationsPage  = Loadable(lazy(() => import('views/equipment-manager/EMFormationsPage')));
const EMSessionsPage    = Loadable(lazy(() => import('views/equipment-manager/EMSessionsPage')));       // ← NEW list
const EMSessionProgress = Loadable(lazy(() => import('views/equipment-manager/EMSessionsProgressPage')));
const EMEvaluationsPage = Loadable(lazy(() => import('views/equipment-manager/EMEvaluationsPage')));

function EMGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'EQUIPMENT_MANAGER'&& user.role !== 'TRAINER') return <Navigate to="/dashboard" replace />;
  return children;
}

const EquipmentManagerRoutes = {
  path: '/em',
  element: (
    <EMGuard>
      <EquipmentManagerLayout />
    </EMGuard>
  ),
  children: [
    { path: '',              element: <Navigate to="dashboard" replace /> },
    { path: 'dashboard',     element: <EMDashboard /> },
    { path: 'employes',      element: <EMEmployesPage /> },
    { path: 'formations',    element: <EMFormationsPage /> },
    { path: 'sessions',      element: <EMSessionsPage /> },        // ← NEW list page
    { path: 'sessions/:id',  element: <EMSessionProgress /> },     // existing detail page
    { path: 'evaluations',   element: <EMEvaluationsPage /> },
    
  ],
};

export default EquipmentManagerRoutes;
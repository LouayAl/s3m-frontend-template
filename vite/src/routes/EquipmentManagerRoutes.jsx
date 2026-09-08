// frontend-template/vite/src/routes/EquipmentManagerRoutes.jsx
import { lazy } from 'react';
import { Navigate } from 'react-router-dom';
import Loadable from 'ui-component/Loadable';
import EquipmentManagerLayout from 'layout/EquipmentManagerLayout';
import { useAuth } from 'contexts/auth/AuthContext';

const EMDashboard              = Loadable(lazy(() => import('views/equipment-manager/EMDashboard')));
const EMEmployesPage           = Loadable(lazy(() => import('views/equipment-manager/EMEmployesPage')));
const EMFormationsPage         = Loadable(lazy(() => import('views/equipment-manager/EMFormationsPage')));
const EMSessionsPage           = Loadable(lazy(() => import('views/equipment-manager/EMSessionsPage')));
const EMSessionProgress        = Loadable(lazy(() => import('views/equipment-manager/EMSessionsProgressPage')));
const EMEvaluationsPage        = Loadable(lazy(() => import('views/equipment-manager/EMEvaluationsPage')));
const CritereTemplatesPage     = Loadable(lazy(() => import('views/equipment-manager/CritereTemplatesPage'))); // ← NEW

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
    { path: '',                    element: <Navigate to="dashboard" replace /> },
    { path: 'dashboard',           element: <EMDashboard /> },
    { path: 'employes',            element: <EMEmployesPage /> },
    { path: 'formations',          element: <EMFormationsPage /> },
    { path: 'sessions',            element: <EMSessionsPage /> },
    { path: 'sessions/:id',        element: <EMSessionProgress /> },
    { path: 'evaluations',         element: <EMEvaluationsPage /> },
    { path: 'critere-templates',   element: <CritereTemplatesPage /> }, // ← NEW
  ],
};

export default EquipmentManagerRoutes;
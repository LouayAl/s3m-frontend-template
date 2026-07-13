// frontend-template/vite/src/routes/AuthenticationRoutes.jsx
import { lazy } from 'react';

// project imports
import Loadable from 'ui-component/Loadable';
import MinimalLayout from 'layout/MinimalLayout';

// auth routing
const LoginPage = Loadable(lazy(() => import('views/pages/authentication/Login')));
const RegisterPage = Loadable(lazy(() => import('views/pages/authentication/Register')));
const PublicQuizForm = Loadable(lazy(() => import('views/quiz/PublicQuizForm')));

// ==============================|| AUTHENTICATION ROUTING ||============================== //

const AuthenticationRoutes = {
  path: '/',
  element: <MinimalLayout />,
  children: [
    {
      path: 'login',
      element: <LoginPage />
    },
    {
      path: 'register',
      element: <RegisterPage />
    },
    { path: '/quiz/session/:sessionId', element: <PublicQuizForm /> }
  ]
};

function EMGuard({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'EQUIPMENT_MANAGER' && user.role !== 'TRAINER')
    return <Navigate to="/dashboard" replace />;
  return children;
}

export default AuthenticationRoutes;

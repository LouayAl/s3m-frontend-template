// frontend-template/vite/src/routes/MainRoutes.jsx
import { lazy } from 'react';
import ProtectedRoute from './ProtectedRoute';

// project imports
import MainLayout from 'layout/MainLayout';
import Loadable from 'ui-component/Loadable';
import SessionPage from '../views/session/SessionPage';
import FormationsPage from '../views/formations/FormationsPage';
import EntreprisesPage from '../views/entreprises/EntreprisesPage';
import EmployesPage from '../views/employes/EmployesPage';

import EvaluationAChaudPage      from '../views/evaluation/EvaluationAChaudPage';
import EvaluationAChaudStatsPage from '../views/evaluation/EvaluationAChaudStatsPage';
import QuizStatsPage from '../views/quiz/QuizStatsPage';
import QuizPage from '../views/quiz/QuizPage';
import QuizRoute from './QuizRoute';
import BesoinsFormationPage from '../views/besoins/BesoinsFormationPage';




// dashboard routing
const DashboardDefault = Loadable(lazy(() => import('views/dashboard/Default')));

// utilities routing
const UtilsTypography = Loadable(lazy(() => import('views/utilities/Typography')));
const UtilsColor = Loadable(lazy(() => import('views/utilities/Color')));
const UtilsShadow = Loadable(lazy(() => import('views/utilities/Shadow')));

// sample page routing
const SamplePage = Loadable(lazy(() => import('views/sample-page')));

const PlanificationPage  = Loadable(lazy(() => import('views/planification/PlanificationPage')));

const FormateursPage = Loadable(lazy(() => import('views/formateurs/FormateursPage')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: <MainLayout />,
  children: [
    // Dashboard route simplified
    {
      path: 'dashboard',
      element: (
        <ProtectedRoute>
          <DashboardDefault />
        </ProtectedRoute>
      )
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
      path: 'sessions',
      element: (
        <ProtectedRoute>
          <SessionPage />
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
      path: 'fournisseurs',
      element: (
        <ProtectedRoute>
          <EntreprisesPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'employes',
      element: (
        <ProtectedRoute>
          <EmployesPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'formateurs',
      element: (
        <ProtectedRoute>
          <FormateursPage />
        </ProtectedRoute>
      )
    },
    {
      path: 'besoins-formation',
      element: <ProtectedRoute><BesoinsFormationPage /></ProtectedRoute>,
    },
    {
      path: 'planification',
      element: <ProtectedRoute><PlanificationPage /></ProtectedRoute>,  // ← new
    },
    {
      path: 'evaluations-a-chaud',
      element: <ProtectedRoute><EvaluationAChaudPage /></ProtectedRoute>,
    },
    {
      path: 'evaluations-a-chaud/:sessionId',
      element: <ProtectedRoute><EvaluationAChaudStatsPage /></ProtectedRoute>,
    },
    {
      path: 'quiz',
      element: <QuizRoute><QuizPage /></QuizRoute>,
    },
    {
      path: 'quiz/:sessionId',
      element: <QuizRoute><QuizStatsPage /></QuizRoute>,
    },

  ]
};

export default MainRoutes;

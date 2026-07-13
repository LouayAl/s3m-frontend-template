// frontend-template/vite/src/routes/QuizRoute.jsx
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/auth/AuthContext';

export default function QuizRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (user.entrepriseId !== 42) return <Navigate to="/dashboard" replace />;
  return children;
}